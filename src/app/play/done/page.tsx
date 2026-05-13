"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { fireConfetti } from "@/components/feedback/Confetti";

type Me = {
  participant: { name: string };
  completed: boolean;
  progress: { stationId: number; isCorrect: boolean | null }[];
};

export default function DonePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        router.replace("/play/identita");
        return;
      }
      const data = (await res.json()) as Me;
      if (cancelled) return;
      setMe(data);
      const allCorrect = data.progress.every((p) => p.isCorrect === true);
      setEligible(allCorrect && data.progress.length >= 4);
      if (allCorrect) {
        setTimeout(() => fireConfetti(), 400);
        setTimeout(() => fireConfetti(), 1400);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const title = "Party byADF — Quiz";
    const text = eligible
      ? "Právě jsem dokončil quiz na party byADF a jsem v slosování. Pojď si zahrát."
      : "Hraju quiz na party byADF. Pojď taky.";
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
            ? `Skvělá práce, ${me.participant.name.split(" ")[0]}. Zařadili jsme tě do slosování o ceny. Vyhlášení proběhne na hlavním pódiu.`
            : `Díky za hru, ${me.participant.name.split(" ")[0]}. Tentokrát ses do slosování nedostal, ale stejně si dej ještě jednu skleničku.`}
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
      </div>
    </div>
  );
}
