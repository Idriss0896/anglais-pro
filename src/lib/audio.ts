let voices: SpeechSynthesisVoice[] = [];
let audioEnabled = true;

export function setAudioEnabled(enabled: boolean) {
  audioEnabled = enabled;
  if (!enabled) stopSpeaking();
}

function refreshVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voices = window.speechSynthesis.getVoices();
}

export function primeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

function pickEnglishVoice() {
  if (voices.length === 0) refreshVoices();
  const preferred = voices.find((voice) => {
    const name = voice.name.toLowerCase();
    return (
      /^en[-_](us|gb)/i.test(voice.lang) &&
      (name.includes("google") ||
        name.includes("samantha") ||
        name.includes("natural") ||
        name.includes("aria") ||
        name.includes("jenny"))
    );
  });
  return (
    preferred ??
    voices.find((voice) => /^en[-_](us|gb)/i.test(voice.lang)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

export function speak(text: string, rate = 0.92) {
  if (!audioEnabled) return false;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  if (!text.trim()) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
