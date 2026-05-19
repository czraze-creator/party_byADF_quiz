"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { printElementsAsImages } from "@/lib/printAsImage";

type Station = {
  id: number;
  name: string;
  emoji: string;
  code: string;
};

export default function AdminQRPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[] | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
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
          data.stationStats.map(
            (s: { id: number; name: string; emoji: string; code: string }) => ({
              id: s.id,
              name: s.name,
              emoji: s.emoji,
              code: s.code,
            }),
          ),
        );
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Mark <body> while this route is mounted so the print rules in
  // globals.css scope themselves to just the QR cards. Cleaned up on
  // unmount so other routes print normally.
  useEffect(() => {
    document.body.classList.add("print-station-cards");
    // Inject the @page size declaration directly into <head>. Named pages
    // in globals.css turned out unreliable across print engines, so each
    // route now owns its own @page rule and removes it on unmount.
    const style = document.createElement("style");
    style.id = "page-station-style";
    style.textContent = "@page { size: A5; margin: 0; }";
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove("print-station-cards");
      style.remove();
    };
  }, []);

  const stackRef = useRef<HTMLDivElement | null>(null);
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (!stackRef.current) return;
    const cards = Array.from(
      stackRef.current.querySelectorAll<HTMLElement>(".qr-print-card"),
    );
    if (cards.length === 0) return;
    setPrinting(true);
    try {
      await printElementsAsImages(cards, {
        pageSize: "A5",
        widthMm: 148,
        heightMm: 210,
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            QR kódy pro tisk
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Tištěné listy
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
            Pro každé stanoviště jeden A5 list — vytiskni v barvě, lamiňuj a
            postav na stanoviště. QR míří na hlavní stránku hry; kód
            stanoviště je vytištěný velkým fontem.
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

      <div
        ref={stackRef}
        className="qr-print-stack grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {stations.map((s) => (
          <Card
            key={s.id}
            variant="strong"
            className="qr-print-card overflow-hidden p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Stanoviště {String(s.id).padStart(2, "0")}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
                    {s.name}
                  </span>
                </div>
              </div>
              <Image
                src="/brand/logo-adf-negativ.png"
                alt="ADF"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-6 grid grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Tvůj kód
                </div>
                <div className="font-mono text-display mt-2 text-6xl font-medium tracking-tight text-[var(--color-accent)]">
                  {s.code}
                </div>
                <div className="mt-4 text-sm text-[var(--color-text-muted)]">
                  Naskenuj QR · zadej kód · odpověz.
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <img
                  src={`/api/admin/qr/${s.id}`}
                  alt={`QR ${s.name}`}
                  className="h-44 w-44"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
