import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        404
      </span>
      <h1 className="text-display mt-3 text-5xl font-medium">
        Tahle stránka neexistuje
      </h1>
      <p className="mt-4 max-w-xs text-[var(--color-text-muted)]">
        Možná jsi zkusil kód mimo hru. Vrať se na začátek a zkus to znovu.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-2xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-bg-deep)] hover:brightness-110"
      >
        Zpět na úvod
      </Link>
    </div>
  );
}
