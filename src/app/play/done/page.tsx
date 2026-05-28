"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { fireConfetti } from "@/components/feedback/Confetti";
import { vocative } from "@/lib/czech";

type Me = {
  participant: { name: string };
  completed: boolean;
  progress: { stationId: number; isCorrect: boolean | null }[];
};

type Wish = { participantId: string; text: string; createdAt: string };

const MAX_WISH = 500;

export default function DonePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [eligible, setEligible] = useState(false);
  const [wish, setWish] = useState<Wish | null>(null);
  const [wishDraft, setWishDraft] = useState("");
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishError, setWishError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [meRes, wishRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/wishes", { cache: "no-store" }),
      ]);
      if (meRes.status === 401) {
        router.replace("/play/identita");
        return;
      }
      const data = (await meRes.json()) as Me;
      if (cancelled) return;
      setMe(data);
      const allCorrect = data.progress.every((p) => p.isCorrect === true);
      setEligible(allCorrect && data.progress.length >= 4);
      if (allCorrect) {
        setTimeout(() => fireConfetti(), 400);
        setTimeout(() => fireConfetti(), 1400);
      }
      if (wishRes.ok) {
        const wd = (await wishRes.json()) as { wish: Wish | null };
        if (!cancelled && wd.wish) {
          setWish(wd.wish);
          setWishDraft(wd.wish.text);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function submitWish() {
    const trimmed = wishDraft.trim();
    if (trimmed.length < 1) {
      setWishError("Napiš aspoň krátkou větu.");
      return;
    }
    if (trimmed.length > MAX_WISH) {
      setWishError(`Maximálně ${MAX_WISH} znaků.`);
      return;
    }
    setWishError(null);
    setWishSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "game_closed") {
          setWishError("Hra už byla uzavřena, přání už nepřijímáme.");
        } else if (data.error === "invalid_length") {
          setWishError("Text je moc dlouhý nebo prázdný.");
        } else {
          setWishError("Něco se nepovedlo, zkus to znovu.");
        }
        return;
      }
      setWish(data.wish);
      setTimeout(() => fireConfetti(), 200);
    } catch {
      setWishError("Něco se nepovedlo, zkus to znovu.");
    } finally {
      setWishSubmitting(false);
    }
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const title = "Party byADF";
    const text = eligible
      ? "Právě jsem dohrál hru na party byADF a jsem v slosování. Pojď si taky zahrát."
      : "Hraju na party byADF — pojď taky.";
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: { title: string; text: string; url: string }) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: { title: string; text: string; url: string }) => Promise<void> }).share({ title, text, url });
        return;
      } catch {
        // user cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Odkaz zkopírovaný do schránky.");
    } catch {
      // ignore
    }
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pt-10 pb-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/brand/logo-adf-negativ.png"
            alt="ADF"
            width={200}
            height={70}
            className="h-10 w-auto"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.15,
          }}
          className="mt-12 flex h-32 w-32 items-center justify-center rounded-full glass-strong text-6xl shadow-[0_0_60px_-12px_var(--color-accent-glow)]"
        >
          {eligible ? "🏆" : "🎉"}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-display mt-10 text-5xl font-medium"
        >
          {eligible ? "Jsi v hře!" : "Hotovo."}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 max-w-sm text-balance text-[var(--color-text-muted)]"
        >
          {eligible
            ? `Skvělá práce, ${vocative(me.participant.name)}. Zařadili jsme tě do slosování o ceny. Vyhlášení proběhne na hlavním pódiu.`
            : `Díky za hru, ${vocative(me.participant.name)}. Tentokrát ses do slosování nedostal, ale stejně si dej ještě jednu skleničku.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-12 flex w-full flex-col gap-3"
        >
          <Button fullWidth onClick={share}>
            Sdílej s kámošem
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => router.push("/play/journey")}
          >
            Zpět na přehled
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 w-full"
        >
          <div className="glass rounded-3xl p-6 text-left">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Bonus · slosování o speciální cenu
            </span>
            <h2 className="text-display mt-2 text-2xl font-medium leading-tight">
              Co byste ADF do dalších 10 let NEpřáli?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Hoď nám sem nějaké anti-přání — co rozhodně nedoporučujeme.
              Mezi všemi odpověďmi vylosujeme bonusovou cenu.
            </p>

            {wish ? (
              <div className="mt-5">
                <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success-soft)] p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-success)]">
                    Tvoje anti-přání · v slosování
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text)]">
                    {wish.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWish(null);
                    setWishError(null);
                  }}
                  className="mt-3 text-xs text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-text)] hover:underline"
                >
                  Upravit
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <textarea
                  value={wishDraft}
                  onChange={(e) => {
                    setWishError(null);
                    setWishDraft(e.target.value.slice(0, MAX_WISH));
                  }}
                  placeholder="Třeba: žádný open space bez kávovaru…"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/[0.1] bg-white/[0.03] p-4 text-sm text-[var(--color-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                />
                <div className="mt-1 flex items-center justify-between gap-3 text-[10px]">
                  <span className="text-[var(--color-error)]">
                    {wishError}
                  </span>
                  <span className="font-mono text-[var(--color-text-faint)]">
                    {wishDraft.length}/{MAX_WISH}
                  </span>
                </div>
                <div className="mt-3">
                  <Button
                    size="md"
                    fullWidth
                    loading={wishSubmitting}
                    disabled={wishDraft.trim().length < 1 || wishSubmitting}
                    onClick={submitWish}
                  >
                    Odeslat do bonusového slosování
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
