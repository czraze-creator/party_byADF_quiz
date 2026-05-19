"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { printImageUrls } from "@/lib/printAsImage";

export default function AdminInviteQRPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      setAuthed(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    setPrinting(true);
    try {
      await printImageUrls(["/print/invite.png"], {
        pageSize: "148mm 105mm",
        widthMm: 148,
        heightMm: 105,
      });
    } finally {
      setPrinting(false);
    }
  }

  if (authed !== true) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Pozvánka — vstup do hry
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Tisková karta s QR
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
            Formát A6 (148×105 mm). Tiskni v barvě na silnější papír, případně
            lamiňuj. Hosté skenují → otevře se úvodní obrazovka a začnou hru.
          </p>
        </div>
        <button
          onClick={handlePrint}
          disabled={printing}
          className="rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[var(--color-bg-deep)] hover:brightness-110 disabled:opacity-60"
        >
          {printing ? "Připravuji…" : "Tisknout"}
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Image
          src="/print/invite.png"
          alt="Pozvánka — náhled tiskové karty"
          width={1094}
          height={768}
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  );
}
