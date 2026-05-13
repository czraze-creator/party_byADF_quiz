"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "glass h-14 rounded-2xl px-5 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
          error && "ring-2 ring-[var(--color-error)]",
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-[var(--color-error)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--color-text-faint)]">{hint}</span>
      ) : null}
    </div>
  );
});
