"use client";

import { useEffect } from "react";

export function fireConfetti() {
  if (typeof window === "undefined") return;
  void (async () => {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    const defaults = {
      origin: { y: 0.65 },
      spread: 70,
      ticks: 220,
      gravity: 1,
      colors: ["#00B8D4", "#14E59A", "#F7F9FC", "#0A2540"],
    };
    confetti({ ...defaults, particleCount: 80, startVelocity: 45 });
    setTimeout(() => confetti({ ...defaults, particleCount: 40, angle: 60 }), 180);
    setTimeout(() => confetti({ ...defaults, particleCount: 40, angle: 120 }), 320);
  })();
}

export function ConfettiOnMount() {
  useEffect(() => {
    fireConfetti();
  }, []);
  return null;
}

export function vibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
}
