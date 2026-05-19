"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";
import { BackLink } from "@/components/ui/BackLink";
import type { PublicStation } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

function Spinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
    </div>
  );
}

export default function UnlockPage({ params }: Props) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Spinner />}>
      <UnlockInner stationId={Number(id)} />
    </Suspense>
  );
}

function UnlockInner({ stationId }: { stationId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") ?? "").trim().toUpperCase();

  const [station, setStation] = useState<PublicStation | null>(null);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitted = useRef(false);

  // Single combined effect: do all auth/progress/station checks BEFORE
  // revealing the unlock form. If we already know the user is going to be
  // redirected (unlocked → question, completed → journey, no session →
  // identita), we never setStation, so the form never flashes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch("/api/stations"),
          fetch("/api/me", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (mRes.status === 401) {
          const next = `/play/station/${stationId}/unlock`;
          router.replace(`/play/identita?next=${encodeURIComponent(next)}`);
          return;
        }
        const sData = (await sRes.json()) as { stations: PublicStation[] };
        const mData = await mRes.json();
        const s = sData.stations.find((x) => x.id === stationId) ?? null;
        if (cancelled) return;
        if (!s) {
          router.replace("/play/journey");
          return;
        }
        const prog = mData.progress.find(
          (p: { stationId: number; state: string }) =>
            p.stationId === stationId,
        );
        if (prog?.state === "completed") {
          router.replace("/play/journey");
          return;
        }
        if (prog?.state === "unlocked") {
          router.replace(`/play/station/${stationId}/question`);
          return;
        }
        setStation(s);
      } catch {
        if (!cancelled) setError("Nepodařilo se načíst stanoviště.");
      }
    })();
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

  // Auto-submit when the QR delivered the code in the URL. Runs once,
  // only after the station/progress checks have confirmed we're staying
  // on this page (station !== null).
  useEffect(() => {
    if (!station) return;
    if (autoSubmitted.current) return;
    if (!initialCode) return;
    autoSubmitted.current = true;
    submit(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station]);

  if (!station) {
    return <Spinner />;
  }

  // If we're auto-submitting from a QR scan, show a friendlier "unlocking"
  // state instead of the manual input flash.
  if (initialCode && submitting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
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
          Odemykáme otázku…
        </p>
        <div className="mt-8 h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
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
            Naskenuj QR na stanovišti — otevře otázku rovnou. Nebo zadej
            kód ručně.
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
