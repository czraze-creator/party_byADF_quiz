"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { fadeUp, stagger, itemTransition } from "@/lib/motion";

export default function LandingPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-between px-6 pt-10 pb-8">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex w-full max-w-md flex-col items-center gap-8"
      >
        <motion.div variants={fadeUp} transition={itemTransition}>
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
            Party byADF · Červen 2026
          </span>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={itemTransition}
          className="relative"
        >
          <Image
            src="/brand/logo-adf-negativ.png"
            alt="ADF"
            width={420}
            height={140}
            priority
            className="h-16 w-auto"
          />
        </motion.div>
      </motion.header>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <motion.div
          variants={fadeUp}
          transition={{ ...itemTransition, delay: 0.1 }}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 blur-3xl opacity-60"
            style={{
              background:
                "radial-gradient(closest-side, rgba(212,165,80,0.35), transparent 70%)",
            }}
          />
          <Image
            src="/brand/badge-10-years-celebration.png"
            alt="10 Years Celebration"
            width={600}
            height={637}
            priority
            className="h-auto w-[260px] sm:w-[300px] drop-shadow-[0_8px_40px_rgba(212,165,80,0.25)]"
          />
        </motion.div>
        <motion.h2
          variants={fadeUp}
          transition={{ ...itemTransition, delay: 0.18 }}
          className="text-display mt-2 text-3xl font-medium text-[var(--color-text)] sm:text-4xl"
        >
          Jedna výzva.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={{ ...itemTransition, delay: 0.28 }}
          className="mt-5 max-w-xs text-balance text-base text-[var(--color-text-muted)]"
        >
          Projdi čtyři stanoviště, odpověz správně a zařadíme tě
          do slosování o ceny.
        </motion.p>
      </motion.section>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex w-full max-w-md flex-col items-center gap-4"
      >
        <motion.div
          variants={fadeUp}
          transition={{ ...itemTransition, delay: 0.4 }}
          className="w-full"
        >
          <Link
            href="/play/onboarding"
            className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-accent)] text-base font-medium text-[var(--color-bg-deep)] shadow-[0_18px_60px_-12px_var(--color-accent-glow)] transition-[transform,filter] duration-200 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center gap-3 tracking-tight">
              Pojď do hry
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: "var(--animate-shimmer)",
              }}
            />
          </Link>
        </motion.div>
        <motion.p
          variants={fadeUp}
          transition={{ ...itemTransition, delay: 0.5 }}
          className="text-xs text-[var(--color-text-faint)]"
        >
          Hra trvá ~10 minut · Žádná instalace
        </motion.p>
      </motion.div>
    </div>
  );
}
