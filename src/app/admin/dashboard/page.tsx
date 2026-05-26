"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Dashboard = {
  gameState: { isClosed: boolean; closedAt: string | null };
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
  const [busy, setBusy] = useState<null | "close" | "open" | "reset">(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/admin");
      return null;
    }
    return (await res.json()) as Dashboard;
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const d = await load();
      if (!cancelled && d) setData(d);
    }
    tick();
    const timer = setInterval(tick, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [load]);

  function pickWinner() {
    if (!data?.eligibleForDrawing.length) return;
    const idx = Math.floor(Math.random() * data.eligibleForDrawing.length);
    setWinner(data.eligibleForDrawing[idx]);
  }

  async function toggleGame(action: "close" | "open") {
    if (action === "close") {
      const ok = window.confirm(
        "Uzavřít hru? Po uzavření nikdo nový se nezaregistruje a stávající hráči už nebudou moci odpovídat. Můžeš hru znovu otevřít.",
      );
      if (!ok) return;
    }
    setBusy(action);
    try {
      const res = await fetch("/api/admin/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        alert("Nepodařilo se změnit stav hry.");
        return;
      }
      const d = await load();
      if (d) setData(d);
    } finally {
      setBusy(null);
    }
  }

  async function resetAll() {
    if (!data) return;
    const count = data.totals.participants;
    const ok = window.confirm(
      `Opravdu smazat všech ${count} registrací včetně progressu? Tuto akci nelze vrátit zpět.`,
    );
    if (!ok) return;
    const confirm2 = window.prompt(
      'Pro potvrzení napiš velkými písmeny: RESET',
    );
    if (confirm2 !== "RESET") return;
    setBusy("reset");
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESET" }),
      });
      if (!res.ok) {
        alert("Reset selhal.");
        return;
      }
      setWinner(null);
      const d = await load();
      if (d) setData(d);
    } finally {
      setBusy(null);
    }
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const isClosed = data.gameState.isClosed;
  const canDraw = isClosed && data.eligibleForDrawing.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              Live · automaticky se obnovuje
            </span>
            <GameStateBadge isClosed={isClosed} />
          </div>
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

          {!isClosed && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-[var(--color-text-muted)]">
              Slosování bude dostupné po uzavření hry.
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {!isClosed ? (
              <Button
                fullWidth
                size="md"
                onClick={() => toggleGame("close")}
                loading={busy === "close"}
                disabled={busy !== null}
              >
                Uzavřít hru
              </Button>
            ) : (
              <Button
                fullWidth
                size="md"
                variant="ghost"
                onClick={() => toggleGame("open")}
                loading={busy === "open"}
                disabled={busy !== null}
              >
                Znovu otevřít hru
              </Button>
            )}

            <Button
              fullWidth
              size="md"
              disabled={!canDraw || busy !== null}
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

      <section className="mt-12">
        <Card className="border-[var(--color-error)]/30 p-6">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--color-error)]">
            Testování — nebezpečná zóna
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Smaže všechny registrace a postup hráčů (stanoviště a otázky
            zůstanou). Po resetu se hra znovu otevře. Používej jen při
            testování — na produkci před akcí.
          </p>
          <div className="mt-5 max-w-xs">
            <Button
              variant="danger"
              size="md"
              fullWidth
              loading={busy === "reset"}
              disabled={busy !== null || data.totals.participants === 0}
              onClick={resetAll}
            >
              Resetovat všechny registrace
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function GameStateBadge({ isClosed }: { isClosed: boolean }) {
  return (
    <span
      className={
        isClosed
          ? "rounded-full bg-[var(--color-error)]/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-error)]"
          : "rounded-full bg-[var(--color-success-soft)] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-success)]"
      }
    >
      {isClosed ? "🔴 Hra uzavřena" : "🟢 Hra běží"}
    </span>
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
