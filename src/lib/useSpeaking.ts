import { useEffect, useState } from "react";
import { getSpeakingText, subscribeSpeaking } from "@/lib/audio";

/**
 * Indique si le texte fourni est en cours de lecture vocale.
 * Permet d'afficher un égaliseur animé sur le bouton « Écouter ».
 */
export function useSpeaking(text: string) {
  const [active, setActive] = useState(() => getSpeakingText() === text);

  useEffect(() => {
    setActive(getSpeakingText() === text);
    return subscribeSpeaking((current) => setActive(current === text));
  }, [text]);

  return active;
}
