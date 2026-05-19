"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";

const STEPS = [
  {
    emoji: "📍",
    title: "Najdi stanoviště",
    body: "Po areálu jsou rozmístěna čtyři stanoviště — Raut, Bar, Fotokoutek a Vyhlídka u Karla.",
  },
  {
    emoji: "🔑",
    title: "Zadej kód, odpověz",
    body: "Na každém stanovišti najdeš unikátní kód. Odemkne ti otázku — jeden klik = odpověď.",
  },
  {
    emoji: "🏆",
    title: "Zařadíme tě do slosování",
    body: "Po správném zodpovězení všech čtyř otázek jsi v hře o ceny. Losujeme na hlavním pódiu.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      router.push("/play/identita");
    }
  }

  return (
    <div className="relative flex flex-1 flex-col px-6 pt-6 pb-8">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        <span className="font-mono">
          {String(step + 1).padStart(2, "0")}
          <span className="text-[var(--color-text-faint)]">
            {" "}
            / {String(STEPS.length).padStart(2, "0")}
          </span>
        </span>
        <Link href="/play/identita" className="hover:text-[var(--color-text)]">
          Přeskočit
        </Link>
      </header>

      <div className="mt-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.32, ease: ease.out }}
              className="flex flex-col items-center text-center"
            >
              <div className="glass-strong mb-8 flex h-28 w-28 items-center justify-center rounded-full text-5xl">
                {STEPS[step].emoji}
              </div>
              <h2 className="text-display text-4xl font-medium">
                {STEPS[step].title}
              </h2>
              <p className="mt-5 max-w-xs text-balance text-base text-[var(--color-text-muted)]">
                {STEPS[step].body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <motion.span
              key={i}
              animate={{
                width: i === step ? 32 : 8,
                backgroundColor:
                  i === step ? "rgb(0, 184, 212)" : "rgba(255,255,255,0.16)",
              }}
              transition={{ duration: 0.32, ease: ease.out }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
        <Button fullWidth onClick={next}>
          {step < STEPS.length - 1 ? "Dál" : "Pojď do hry"}
        </Button>
      </div>
    </div>
  );
}
