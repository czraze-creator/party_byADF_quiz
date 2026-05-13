import Link from "next/link";
import type { ReactNode } from "react";
import { isAdminAuthed } from "@/lib/admin";
import Image from "next/image";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authed = await isAdminAuthed();
  return (
    <div className="flex flex-1 flex-col">
      {authed && (
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[var(--color-bg-deep)]/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <Image
                src="/brand/logo-adf-negativ.png"
                alt="ADF"
                width={120}
                height={40}
                className="h-7 w-auto"
              />
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                Admin
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/admin/dashboard"
                className="rounded-lg px-3 py-1.5 text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
              >
                Přehled
              </Link>
              <Link
                href="/admin/qr"
                className="rounded-lg px-3 py-1.5 text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
              >
                QR kódy
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
