import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "strong";
};

export function Card({ className, variant = "default", ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        variant === "strong" ? "glass-strong" : "glass",
        className,
      )}
      {...rest}
    />
  );
}
