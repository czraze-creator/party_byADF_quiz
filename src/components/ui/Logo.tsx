import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 56, className }: Props) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/logo-adf-negativ.png"
        alt="ADF"
        width={size * 2}
        height={size}
        priority
        className="h-auto w-auto"
        style={{ height: size }}
      />
    </div>
  );
}
