"use client";

import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";

type Props = {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  error?: boolean;
  autoFocus?: boolean;
};

export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  autoFocus = true,
}: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setChar(i: number, ch: string) {
    const sanitized = ch.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const arr = value.padEnd(length, " ").split("");
    arr[i] = sanitized.charAt(0) ?? " ";
    const next = arr.join("").replace(/\s+$/g, "");
    onChange(next);
    if (sanitized && i + 1 < length) {
      refs.current[i + 1]?.focus();
    }
    if (next.length === length && !next.includes(" ")) {
      onComplete?.(next);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      e.preventDefault();
      const arr = value.padEnd(length, " ").split("");
      arr[i - 1] = " ";
      onChange(arr.join("").replace(/\s+$/g, ""));
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i + 1 < length) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const txt = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (!txt) return;
    e.preventDefault();
    const sliced = txt.slice(0, length);
    onChange(sliced);
    const target = Math.min(sliced.length, length - 1);
    refs.current[target]?.focus();
    if (sliced.length === length) onComplete?.(sliced);
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={ch}
            onChange={(e) => setChar(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            autoCapitalize="characters"
            autoComplete="off"
            inputMode="text"
            maxLength={1}
            className={cn(
              "glass h-14 w-12 rounded-2xl text-center font-mono text-2xl font-medium uppercase tracking-tight text-[var(--color-text)] caret-[var(--color-accent)] outline-none transition-all sm:h-16 sm:w-14 sm:text-3xl",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
              error && "ring-2 ring-[var(--color-error)] animate-[shake_0.4s]",
              !error &&
                ch &&
                "border-[var(--color-accent)]/40 shadow-[0_0_24px_-8px_var(--color-accent-glow)]",
            )}
          />
        );
      })}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
