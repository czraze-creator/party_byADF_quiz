"use client";

import { motion } from "motion/react";

type Props = {
  value: number;
  max: number;
  showCount?: boolean;
};

export function ProgressBar({ value, max, showCount = true }: Props) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Postup
        </span>
        {showCount && (
          <span className="font-mono text-xs text-[var(--color-text)]">
            {String(value).padStart(2, "0")}
            <span className="text-[var(--color-text-faint)]">
              {" "}
              / {String(max).padStart(2, "0")}
            </span>
          </span>
        )}
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)]"
          style={{
            boxShadow: "0 0 24px var(--color-accent-glow)",
          }}
        />
        <div
          className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            animation: "var(--animate-shimmer)",
          }}
        />
      </div>
    </div>
  );
}
