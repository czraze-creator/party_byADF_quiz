"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "danger";
type Size = "md" | "lg";

type Props = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-bg-deep)] hover:brightness-110 shadow-[0_0_0_1px_var(--color-accent-soft),0_18px_60px_-12px_var(--color-accent-glow)]",
  ghost:
    "glass text-[var(--color-text)] hover:bg-white/[0.06]",
  danger:
    "bg-[var(--color-error)] text-white hover:brightness-110",
};

const sizeStyles: Record<Size, string> = {
  md: "h-12 px-5 text-sm",
  lg: "h-16 px-7 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    className,
    variant = "primary",
    size = "lg",
    fullWidth,
    loading,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-2xl font-medium tracking-tight transition-[filter,background] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)] disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
});
