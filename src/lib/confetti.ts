import confetti from "canvas-confetti";

export function fireConfetti(colors?: string[]) {
  const base = { spread: 70, ticks: 100, gravity: 0.9, decay: 0.92, startVelocity: 32 };
  confetti({ ...base, particleCount: 60, origin: { x: 0.3, y: 0.6 }, colors });
  confetti({ ...base, particleCount: 60, origin: { x: 0.7, y: 0.6 }, colors });
  confetti({ ...base, particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.4 }, colors });
}
