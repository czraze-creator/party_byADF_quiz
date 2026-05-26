"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StationNode } from "@/components/journey/StationNode";
import { vocative } from "@/lib/czech";
import type { PublicProgress, PublicStation } from "@/lib/types";

type Me = {
  participant: { id: string; name: string; email: string };
  progress: PublicProgress[];
  completed: boolean;
};

export function JourneyView() {
  const router = useRouter();
  const [stations, setStations] = useState<PublicStation[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch("/api/stations"),
          fetch("/api/me"),
        ]);
        if (mRes.status === 401) {
          router.replace("/play/identita");
          return;
        }
        if (!sRes.ok || !mRes.ok) throw new Error("load_failed");
        const sData = (await sRes.json()) as { stations: PublicStation[] };
        const mData = (await mRes.json()) as Me;
        if (cancelled) return;
        setStations(sData.stations);
        setMe(mData);
      } catch {
        if (!cancelled) setError("Nepodařilo se načíst stav hry.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-[var(--color-error)]">{error}</p>
      </div>
    );
  }
  if (!stations || !me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const totalCorrect = me.progress.filter((p) => p.isCorrect === true).length;

  return (
    <div className="relative flex flex-1 flex-col px-5 pt-6 pb-10">
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2 opacity-90">
          <Image
            src="/brand/logo-adf-negativ.png"
            alt="ADF"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        <span className="font-mono text-xs text-[var(--color-text)]">
          {String(totalCorrect).padStart(2, "0")}
          <span className="text-[var(--color-text-faint)]">
            {" "}
            / {String(stations.length).padStart(2, "0")}
          </span>
        </span>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mt-6 w-full max-w-md"
      >
        <ProgressBar
          value={totalCorrect}
          max={stations.length}
          showCount={false}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mx-auto mt-8 w-full max-w-md"
      >
        <h1 className="text-display text-3xl font-medium tracking-tight">
          Ahoj, {vocative(me.participant.name)}.
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          Všechna stanoviště jsou otevřená — projdi je v libovolném pořadí.
          Naskenuj QR na stanovišti nebo klepni na dlaždici.
        </p>
      </motion.div>

      <div className="relative mx-auto mt-10 w-full max-w-md">
        {/* connecting line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top" }}
          className="pointer-events-none absolute left-[23px] top-6 bottom-20 w-px bg-gradient-to-b from-[var(--color-accent)] via-white/15 to-white/5"
        />

        <div className="flex flex-col gap-5">
          {stations.map((s, i) => {
            const progress = me.progress.find((p) => p.stationId === s.id);
            return (
              <StationNode
                key={s.id}
                station={s}
                progress={progress}
                index={i}
              />
            );
          })}
        </div>

        {/* Slosování placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + stations.length * 0.07 }}
          className="relative mt-6 flex gap-5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-base">
              🏆
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-dashed border-white/10 p-5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Cíl
            </span>
            <div className="mt-1.5 text-xl font-medium tracking-tight text-[var(--color-text)]">
              Slosování
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-muted)]">
              Splň všechny otázky správně a jsi v hře o ceny.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
