"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";
import { BackLink } from "@/components/ui/BackLink";
import type { PublicStation } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default function UnlockPage({ params }: Props) {
  const { id } = use(params);
  const stationId = Number(id);
  const router = useRouter();
  const [station, setStation] = useState<PublicStation | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        const sData = (await sRes.json()) as { stations: PublicStation[] };
        const s = sData.stations.find((x) => x.id === stationId) ?? null;
        if (cancelled) return;
        if (!s) {
          router.replace("/play/journey");
          return;
        }
        setStation(s);

        const mData = await mRes.json();
        const prog = mData.progress.find(
          (p: { stationId: number; state: string }) => p.stationId === stationId,
        );
        if (prog?.state === "completed") {
          router.replace("/play/journey");
        } else if (prog?.state === "unlocked") {
          router.replace(`/play/station/${stationId}/question`);
        }
      } catch {
        if (!cancelled) setError("Nepodařilo se načíst stanoviště.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router, stationId]);

  async function submit(value: string) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stations/${stationId}/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      if (res.status === 401) {
        setError("Kód neplatí. Zkontroluj zadání.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error("request_failed");
      router.push(`/play/station/${stationId}/question`);
    } catch {
      setError("Něco se nepovedlo, zkus to znovu.");
      setSubmitting(false);
    }
  }

  if (!station) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <header className="mx-auto w-full max-w-md">
        <BackLink href="/play/journey" />
      </header>

      <div className="mx-auto mt-12 flex w-full max-w-md flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <div className="glass-strong flex h-24 w-24 items-center justify-center rounded-full text-5xl">
            {station.emoji}
          </div>
          <span className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Stanoviště {String(station.id).padStart(2, "0")}
          </span>
          <h1 className="text-display mt-1 text-4xl font-medium">
            {station.name}
          </h1>
          <p className="mt-4 max-w-xs text-balance text-[var(--color-text-muted)]">
            Zadej kód, který najdeš na stanovišti, a odemkne se ti otázka.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10"
        >
          <CodeInput
            length={6}
            value={code}
            onChange={(v) => {
              setError(null);
              setCode(v);
            }}
            onComplete={(v) => submit(v)}
            error={!!error}
          />
          {error && (
            <p className="mt-5 text-center text-sm text-[var(--color-error)]">
              {error}
            </p>
          )}
        </motion.div>

        <div className="mt-auto pt-10">
          <Button
            fullWidth
            loading={submitting}
            disabled={code.length < 2}
            onClick={() => submit(code)}
          >
            Odemknout
          </Button>
        </div>
      </div>
    </div>
  );
}
