"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BackLink } from "@/components/ui/BackLink";
import { fireConfetti, vibrate } from "@/components/feedback/Confetti";
import { cn } from "@/lib/cn";
import type { PublicQuestion } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

type Status =
  | { kind: "idle" }
  | { kind: "submitting"; answerId: string }
  | { kind: "answered"; answerId: string; isCorrect: boolean; correctAnswerId: string | null };

export default function QuestionPage({ params }: Props) {
  const { id } = use(params);
  const stationId = Number(id);
  const router = useRouter();
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/stations/${stationId}/question`);
        if (res.status === 401) {
          router.replace("/play/identita");
          return;
        }
        if (res.status === 403) {
          router.replace(`/play/station/${stationId}/unlock`);
          return;
        }
        if (!res.ok) throw new Error("request_failed");
        const data = await res.json();
        if (cancelled) return;
        setQuestion(data.question);
        if (data.answeredAt && data.selectedAnswerId) {
          setStatus({
            kind: "answered",
            answerId: data.selectedAnswerId,
            isCorrect: data.isCorrect,
            correctAnswerId: data.correctAnswerId,
          });
        }
      } catch {
        if (!cancelled) setError("Otázka se nepodařila načíst.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router, stationId]);

  async function pickAnswer(answerId: string) {
    if (!question) return;
    if (status.kind !== "idle") return;
    setStatus({ kind: "submitting", answerId });
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "already_answered") {
          router.replace("/play/journey");
          return;
        }
        throw new Error("request_failed");
      }
      const data = (await res.json()) as {
        isCorrect: boolean;
        correctAnswerId: string | null;
      };
      setStatus({
        kind: "answered",
        answerId,
        isCorrect: data.isCorrect,
        correctAnswerId: data.correctAnswerId,
      });
      if (data.isCorrect) {
        fireConfetti();
        vibrate([12, 40, 12]);
      } else {
        vibrate([60, 30, 60]);
      }
      // auto-return: if this was the last station with all correct so far, go to done; otherwise back to journey
      setTimeout(async () => {
        try {
          const meRes = await fetch("/api/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            const allDone = meData.progress.every(
              (p: { stationId: number; state: string }) =>
                p.state === "completed",
            );
            if (allDone) {
              router.push("/play/done");
              return;
            }
          }
        } catch {
          // ignore
        }
        router.push("/play/journey");
      }, 2400);
    } catch {
      setError("Něco se nepovedlo, zkus to znovu.");
      setStatus({ kind: "idle" });
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-[var(--color-error)]">{error}</p>
      </div>
    );
  }
  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const answered = status.kind === "answered";

  return (
    <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
      <header className="mx-auto w-full max-w-md">
        <BackLink href="/play/journey" />
      </header>

      <div className="mx-auto mt-10 flex w-full max-w-md flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <div className="glass-strong flex h-20 w-20 items-center justify-center rounded-full text-4xl">
            {question.emoji}
          </div>
          <span className="mt-5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Stanoviště {String(stationId).padStart(2, "0")} · otázka
          </span>
          <h1 className="text-display mt-3 text-2xl font-medium text-balance sm:text-3xl">
            {question.text}
          </h1>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3">
          {question.answers.map((a, idx) => {
            const isSelected =
              status.kind !== "idle" && status.answerId === a.id;
            const showAsCorrect =
              answered &&
              ((status.kind === "answered" && status.isCorrect && isSelected) ||
                (status.kind === "answered" &&
                  !status.isCorrect &&
                  status.correctAnswerId === a.id));
            const showAsWrong =
              answered &&
              status.kind === "answered" &&
              !status.isCorrect &&
              isSelected;
            const dimmed = answered && !showAsCorrect && !showAsWrong;

            return (
              <motion.button
                key={a.id}
                disabled={status.kind !== "idle"}
                onClick={() => pickAnswer(a.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{
                  opacity: dimmed ? 0.35 : 1,
                  y: 0,
                  scale: showAsWrong ? [1, 0.98, 1.01, 0.99, 1] : 1,
                }}
                transition={{
                  duration: showAsWrong ? 0.45 : 0.4,
                  delay: idx * 0.06,
                }}
                whileHover={
                  status.kind === "idle" ? { scale: 1.01 } : undefined
                }
                whileTap={
                  status.kind === "idle" ? { scale: 0.98 } : undefined
                }
                className={cn(
                  "group relative flex h-20 items-center justify-between rounded-2xl border px-6 text-left transition",
                  showAsCorrect &&
                    "border-[var(--color-success)]/60 bg-[var(--color-success-soft)] text-[var(--color-success)] shadow-[0_0_30px_-8px_var(--color-success-glow)]",
                  showAsWrong &&
                    "border-[var(--color-error)]/60 bg-[var(--color-error-soft)] text-[var(--color-error)]",
                  !showAsCorrect &&
                    !showAsWrong &&
                    "glass text-[var(--color-text)]",
                )}
              >
                <span
                  className={cn(
                    "absolute -left-1.5 top-1/2 hidden -translate-y-1/2 font-mono text-xs text-[var(--color-text-faint)] sm:block",
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg font-medium tracking-tight">
                  {a.text}
                </span>
                <AnimatePresence>
                  {showAsCorrect && (
                    <motion.span
                      key="ok"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className="ml-3"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.span>
                  )}
                  {showAsWrong && (
                    <motion.span
                      key="x"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-3"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center text-sm text-[var(--color-text-muted)]"
            >
              {status.kind === "answered" && status.isCorrect ? (
                <>Super! Vracím tě na přehled…</>
              ) : (
                <>Tentokrát ne. Vracím tě na přehled…</>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
