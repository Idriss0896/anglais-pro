import confetti from "canvas-confetti";

const COLORS = ["#745bfa", "#5a45e8", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9"];

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function fireConfetti() {
  if (reducedMotion()) return;
  const base = { spread: 70, ticks: 180, gravity: 0.9, decay: 0.94, colors: COLORS };
  confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } });
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 90, spread: 100, origin: { x: 0.5, y: 0.6 } });
  }, 180);
}

export function fireBurst(origin?: { x: number; y: number }) {
  if (reducedMotion()) return;
  confetti({
    particleCount: 34,
    spread: 55,
    startVelocity: 26,
    ticks: 90,
    gravity: 0.8,
    scalar: 0.75,
    colors: COLORS,
    origin: origin ?? { x: 0.5, y: 0.6 },
  });
}
