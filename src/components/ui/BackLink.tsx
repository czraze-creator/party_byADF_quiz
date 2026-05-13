import Link from "next/link";

type Props = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Zpět na přehled" }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      {label}
    </Link>
  );
}
