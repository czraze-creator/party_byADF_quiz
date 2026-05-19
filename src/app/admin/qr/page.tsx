"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { printImageUrls } from "@/lib/printAsImage";

type Station = { id: number; name: string };

export default function AdminQRPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const data = await res.json();
      if (!cancelled) {
        setStations(
          data.stationStats.map((s: { id: number; name: string }) => ({
            id: s.id,
            name: s.name,
          })),
        );
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (!stations || stations.length === 0) return;
    setPrinting(true);
    try {
      const urls = stations.map((s) => `/print/station-${s.id}.png`);
      await printImageUrls(urls, {
        pageSize: "148mm 105mm",
        widthMm: 148,
        heightMm: 105,
      });
    } finally {
      setPrinting(false);
    }
  }

  if (!stations) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            QR kódy pro tisk
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Tištěné listy
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
            Pro každé stanoviště jeden A6 list (148×105 mm) — vytiskni v
            barvě, lamiňuj a postav na stanoviště.
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {stations.map((s) => (
          <div
            key={s.id}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <Image
              src={`/print/station-${s.id}.png`}
              alt={`Stanoviště ${s.id} — ${s.name}`}
              width={1052}
              height={734}
              className="h-auto w-full"
              priority={s.id === 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
