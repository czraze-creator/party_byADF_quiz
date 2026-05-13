"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Dashboard = {
  totals: { participants: number; completed: number; stations: number };
  stationStats: {
    id: number;
    name: string;
    emoji: string;
    code: string;
    unlocked: number;
    correct: number;
    wrong: number;
  }[];
  recent: {
    name: string;
    email: string;
    completed: boolean;
    correctCount: number;
    createdAt: string;
  }[];
  eligibleForDrawing: { id: string; name: string; email: string; phone: string | null }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [winner, setWinner] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval>;
    async function load() {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const d = (await res.json()) as Dashboard;
      if (!cancelled) setData(d);
    }
    load();
    timer = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [router]);

  function pickWinner() {
    if (!data?.eligibleForDrawing.length) return;
    const idx = Math.floor(Math.random() * data.eligibleForDrawing.length);
    setWinner(data.eligibleForDrawing[idx]);
  }

  if (!data) {
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
            Live · automaticky se obnovuje
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">Přehled hry</h1>
        </div>
        <a
          href="/api/admin/export.csv"
          className="rounded-2xl glass px-5 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-white/[0.06]"
        >
          Stáhnout CSV
        </a>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Účastníků"
          value={data.totals.participants}
          accent="accent"
        />
        <Stat
          label="Dokončilo všechny otázky správně"
          value={data.totals.completed}
          accent="success"
        />
        <Stat
          label="Stanovišť"
          value={data.totals.stations}
          accent="muted"
        />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Stanoviště
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.stationStats.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-center gap-2 text-2xl">{s.emoji}</div>
              <div className="mt-3 text-base font-medium tracking-tight">
                {s.name}
              </div>
              <div className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                kód: <span className="text-[var(--color-text)]">{s.code}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <Mini label="Odemknuto" value={s.unlocked} />
                <Mini label="Správně" value={s.correct} tint="success" />
                <Mini label="Špatně" value={s.wrong} tint="error" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Poslední registrace
          </h2>
          <ul className="mt-4 divide-y divide-white/5">
            {data.recent.length === 0 && (
              <li className="py-4 text-sm text-[var(--color-text-faint)]">
                Zatím nikdo nehraje.
              </li>
            )}
            {data.recent.map((p) => (
              <li
                key={p.email}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-[var(--color-text-faint)]">
                    {p.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {p.correctCount}/{data.totals.stations}
                  </span>
                  {p.completed && (
                    <span className="rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-success)]">
                      hotovo
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Slosování
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            V hře je{" "}
            <span className="font-mono text-[var(--color-text)]">
              {data.eligibleForDrawing.length}
            </span>{" "}
            účastník{data.eligibleForDrawing.length === 1 ? "" : "ů"}, kteří
            zodpověděli všechny otázky správně.
          </p>
          <div className="mt-5">
            <Button
              fullWidth
              size="md"
              disabled={!data.eligibleForDrawing.length}
              onClick={pickWinner}
            >
              Vylosovat výherce
            </Button>
          </div>
          {winner && (
            <motion.div
              key={winner.email}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="mt-5 rounded-2xl border border-[var(--color-success)]/40 bg-[var(--color-success-soft)] p-5 text-center"
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-success)]">
                Výherce
              </div>
              <div className="mt-1 text-xl font-medium">{winner.name}</div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {winner.email}
              </div>
            </motion.div>
          )}
        </Card>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "accent" | "success" | "muted";
}) {
  const color =
    accent === "accent"
      ? "var(--color-accent)"
      : accent === "success"
        ? "var(--color-success)"
        : "var(--color-text)";
  return (
    <Card className="p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
        {label}
      </div>
      <div
        className="text-display mt-3 text-5xl font-medium"
        style={{ color }}
      >
        {value}
      </div>
    </Card>
  );
}

function Mini({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint?: "success" | "error";
}) {
  const color =
    tint === "success"
      ? "var(--color-success)"
      : tint === "error"
        ? "var(--color-error)"
        : "var(--color-text)";
  return (
    <div>
      <div
        className="font-mono text-xl font-medium"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
        {label}
      </div>
    </div>
  );
}
