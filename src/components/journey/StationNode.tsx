"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { PublicProgress, PublicStation } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  station: PublicStation;
  progress: PublicProgress | undefined;
  isActive: boolean;
  index: number;
};

export function StationNode({ station, progress, isActive, index }: Props) {
  const state = progress?.state ?? "locked";
  const isCompletedCorrect = state === "completed" && progress?.isCorrect === true;
  const isCompletedWrong = state === "completed" && progress?.isCorrect === false;

  const href =
    state === "locked" || state === "unlocked"
      ? `/play/station/${station.id}/unlock`
      : `/play/station/${station.id}/question`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.07 }}
      className="relative flex gap-5"
    >
      {/* node dot column */}
      <div className="flex flex-col items-center">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          {isActive && state !== "completed" && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--color-accent-glow)" }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          )}
          <div
            className={cn(
              "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-sm transition-colors",
              isCompletedCorrect &&
                "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]",
              isCompletedWrong &&
                "border-[var(--color-error)] bg-[var(--color-error-soft)] text-[var(--color-error)]",
              !isCompletedCorrect &&
                !isCompletedWrong &&
                isActive &&
                "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-[0_0_24px_var(--color-accent-glow)]",
              !isCompletedCorrect &&
                !isCompletedWrong &&
                !isActive &&
                "border-white/10 bg-white/[0.03] text-[var(--color-text-faint)]",
            )}
          >
            {isCompletedCorrect ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : isCompletedWrong ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              String(station.id).padStart(2, "0")
            )}
          </div>
        </div>
      </div>

      {/* card */}
      <Link
        href={href}
        className={cn(
          "group relative flex-1 cursor-pointer rounded-2xl border p-5 transition",
          isCompletedCorrect &&
            "border-[var(--color-success)]/40 bg-[var(--color-success-soft)] hover:bg-[var(--color-success-soft)]",
          isCompletedWrong &&
            "border-[var(--color-error)]/40 bg-[var(--color-error-soft)] hover:bg-[var(--color-error-soft)]",
          !isCompletedCorrect &&
            !isCompletedWrong &&
            isActive &&
            "border-[var(--color-accent)]/40 bg-white/[0.04] hover:bg-white/[0.06] shadow-[0_0_0_1px_var(--color-accent-soft),0_18px_50px_-20px_var(--color-accent-glow)]",
          !isCompletedCorrect &&
            !isCompletedWrong &&
            !isActive &&
            "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">{station.emoji}</span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                Stanoviště {String(station.id).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-1.5 text-xl font-medium tracking-tight text-[var(--color-text)]">
              {station.name}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-muted)]">
              {isCompletedCorrect
                ? "Splněno"
                : isCompletedWrong
                  ? "Bohužel špatně"
                  : isActive
                    ? state === "unlocked"
                      ? "Odpověz na otázku"
                      : "Připraveno k odemčení"
                    : station.hint}
            </div>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "shrink-0 transition-transform group-hover:translate-x-0.5",
              isCompletedCorrect && "text-[var(--color-success)]",
              isCompletedWrong && "text-[var(--color-error)]",
              !isCompletedCorrect &&
                !isCompletedWrong &&
                isActive &&
                "text-[var(--color-accent)]",
              !isCompletedCorrect &&
                !isCompletedWrong &&
                !isActive &&
                "text-[var(--color-text-faint)]",
            )}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
