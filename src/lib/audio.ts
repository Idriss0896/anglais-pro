let voices: SpeechSynthesisVoice[] = [];
let audioEnabled = true;
let queue: Chunk[] = [];
let pauseTimer: number | null = null;
/** Filet de sécurité : remet l'égaliseur au repos si le moteur ne répond plus. */
let watchdog: number | null = null;
/** Incrémenté à chaque lecture : invalide les files d'attente précédentes. */
let generation = 0;
/** Texte en cours de lecture (null quand le moteur est au repos). */
let currentText: string | null = null;
const speakingListeners = new Set<(text: string | null) => void>();

export function subscribeSpeaking(listener: (text: string | null) => void) {
  speakingListeners.add(listener);
  return () => {
    speakingListeners.delete(listener);
  };
}

export function getSpeakingText() {
  return currentText;
}

function setCurrentText(text: string | null) {
  if (currentText === text) return;
  currentText = text;
  for (const listener of speakingListeners) listener(text);
}

export function setAudioEnabled(enabled: boolean) {
  audioEnabled = enabled;
  if (!enabled) stopSpeaking();
}

function refreshVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const next = window.speechSynthesis.getVoices();
  if (next.length > 0) voices = next;
}

export function primeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  refreshVoices();
  // Chrome charge les voix en différé : on réécoute à chaque mise à jour.
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
  // Safari/iOS ne déclenche pas toujours l'événement : une seconde lecture ne coûte rien.
  window.setTimeout(refreshVoices, 400);
}

/** Voix robotiques ou de secours à éviter quand une meilleure option existe. */
const VOICE_PENALTIES: Array<[RegExp, number]> = [
  [/compact|espeak|festival|pico|albert/i, -60],
  [/zira|david|hazel|mark(?!et)/i, -14],
];

/** Voix réputées pour leur naturel (Edge, Chrome, macOS, Android, iOS). */
const VOICE_BONUSES: Array<[RegExp, number]> = [
  [/natural|neural/i, 46],
  [/google (uk|us) english|google english/i, 42],
  [/google/i, 32],
  [/samantha|allison|ava|susan|tom/i, 28],
  [/aria|jenny|libby|sonia|ryan|guy|emma|brian|serena|daniel|kate|oliver/i, 24],
  [/enhanced|premium|siri/i, 20],
];

function scoreVoice(voice: SpeechSynthesisVoice) {
  const lang = voice.lang.replace("_", "-").toLowerCase();
  const name = `${voice.name} ${voice.voiceURI}`;

  let score = 0;
  if (/^en-us/i.test(lang)) score += 10;
  else if (/^en-gb/i.test(lang)) score += 8;
  else if (/^en-(au|ca|ie|nz)/i.test(lang)) score += 4;
  else if (/^en/i.test(lang)) score += 2;
  else return -Infinity;

  for (const [pattern, points] of VOICE_BONUSES) {
    if (pattern.test(name)) score += points;
  }
  for (const [pattern, points] of VOICE_PENALTIES) {
    if (pattern.test(name)) score += points;
  }
  if (voice.localService) score += 2;
  return score;
}

function pickEnglishVoice() {
  if (voices.length === 0) refreshVoices();
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -Infinity;

  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }

  if (best) return best;
  return (
    voices.find((voice) => /^en[-_]us/i.test(voice.lang)) ??
    voices.find((voice) => /^en/i.test(voice.lang))
  );
}

interface Chunk {
  /** Phrase à prononcer. */
  text: string;
  /** Silence après la phrase, en millisecondes. */
  pause: number;
}

/**
 * Découpe le texte aux vraies fins de phrase pour laisser le moteur respirer.
 * Les abréviations (e.g., i.e., Dr.) et les décimales (3.5) ne coupent pas.
 */
export function splitIntoChunks(input: string): Chunk[] {
  const text = input.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const guarded = text
    .replace(/(\d)\.(\d)/g, "$1\u0001$2")
    .replace(
      /\b(e\.g|i\.e|etc|vs|Dr|Mr|Mrs|Ms|Prof|St|No|approx|a\.m|p\.m|U\.S|U\.K)\./gi,
      (match) => `${match.slice(0, -1)}\u0001`,
    );

  const protectedText = guarded.replace(/\u0001/g, "\u0002");

  // Découpage manuel (pas de lookbehind : compatible avec les anciens Safari).
  const pieces: string[] = [];
  let buffer = "";
  for (let i = 0; i < protectedText.length; i += 1) {
    const char = protectedText[i];
    buffer += char;

    const endsSentence = ".!?…".includes(char);
    if (!endsSentence) continue;

    // Absorbe la ponctuation multiple et les guillemets fermants : « ! » », … ».
    while (i + 1 < protectedText.length && ".!?…\"'”’)]".includes(protectedText[i + 1])) {
      buffer += protectedText[i + 1];
      i += 1;
    }

    // Une vraie fin de phrase est suivie d'un espace.
    if (i + 1 < protectedText.length && protectedText[i + 1] === " ") {
      pieces.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) pieces.push(buffer.trim());

  return pieces.filter(Boolean).map((piece) => {
    const chunkText = piece.replace(/\u0002/g, ".");
    const tail = chunkText.slice(-1);
    // Une phrase longue respire un peu plus, comme à l'oral.
    const base = tail === "." || tail === "!" || tail === "?" || tail === "…" ? 260 : 170;
    return { text: chunkText, pause: base + Math.min(chunkText.length, 120) };
  });
}

function cancelPlayback() {
  generation += 1;
  queue = [];
  setCurrentText(null);
  if (typeof window === "undefined") return;
  if (pauseTimer !== null) {
    window.clearTimeout(pauseTimer);
    pauseTimer = null;
  }
  if (watchdog !== null) {
    window.clearTimeout(watchdog);
    watchdog = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Lit un texte anglais avec une voix naturelle, en respectant la ponctuation.
 * @param rate Débit de parole (1 = normal).
 */
export function speak(text: string, rate = 0.95) {
  if (!audioEnabled) return false;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  if (!text.trim()) return false;

  cancelPlayback();
  const token = generation;
  queue = splitIntoChunks(text);
  setCurrentText(text);

  const voice = pickEnglishVoice();
  const lang = voice?.lang?.replace("_", "-") ?? "en-US";

  const play = (index: number) => {
    if (token !== generation) return;
    const chunk = queue[index];
    if (!chunk) return;

    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.lang = /^en/i.test(lang) ? lang : "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (token !== generation) return;
      if (index + 1 >= queue.length) {
        setCurrentText(null);
        return;
      }
      pauseTimer = window.setTimeout(() => play(index + 1), chunk.pause);
    };
    utterance.onerror = () => {
      if (token === generation) cancelPlayback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Laisse à Chrome le temps d'annuler la lecture précédente avant d'enchaîner.
  pauseTimer = window.setTimeout(() => {
    pauseTimer = null;
    play(0);
  }, 0);

  // Certains navigateurs n'émettent jamais « end » : on libère l'égaliseur après coup.
  const wordCount = text.trim().split(/\s+/).length;
  const estimate = Math.min(180_000, Math.max(4_000, Math.round((wordCount * 700) / rate) + 2_000));
  watchdog = window.setTimeout(() => {
    watchdog = null;
    if (token === generation) setCurrentText(null);
  }, estimate);

  return true;
}

export function stopSpeaking() {
  cancelPlayback();
}

/** Vrai tant que le moteur vocal a une lecture en cours. */
export function isSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.speaking;
}
