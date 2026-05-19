"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { fadeUp, itemTransition, stagger } from "@/lib/motion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IdentitaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Zadej alespoň 2 znaky";
    if (!EMAIL_RE.test(email.trim())) next.email = "Neplatný formát e-mailu";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() || null,
          consentMarketing: consent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "request_failed");
      }
      router.push("/play/journey");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Něco se nepovedlo, zkus znovu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col px-6 pt-8 pb-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8"
      >
        <motion.div variants={fadeUp} transition={itemTransition}>
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Krok 1 z 1
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Kdo si dnes zahraje?
          </h1>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Tvoje jméno potřebujeme pro slosování. E-mail, abychom ti mohli dát
            vědět, když vyhraješ.
          </p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          variants={fadeUp}
          transition={itemTransition}
          className="flex flex-1 flex-col"
        >
          <Card className="flex flex-col gap-5 p-6">
            <Input
              label="Jméno a příjmení"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Aleš Vychodil"
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="ales.vychodil@byadf.cz"
            />
            <Input
              label="Telefon (nepovinné)"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              hint="Když vyhraješ, dáme vědět rovnou."
              placeholder="+420…"
            />

            <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
              />
              <span>
                Souhlasím se zpracováním osobních údajů pro účely slosování. Po
                eventu mě klidně držte v kontaktu.
              </span>
            </label>
          </Card>

          {submitError && (
            <p className="mt-4 text-center text-sm text-[var(--color-error)]">
              {submitError === "invalid_email"
                ? "E-mail nemá správný formát."
                : submitError === "invalid_name"
                  ? "Jméno musí mít alespoň 2 znaky."
                  : "Něco se nepovedlo, zkus znovu."}
            </p>
          )}

          <div className="mt-auto pt-8">
            <Button type="submit" fullWidth loading={submitting}>
              Začít hru →
            </Button>
            <p className="mt-3 text-center text-xs text-[var(--color-text-faint)]">
              Tvoje údaje smažeme po skončení slosování (pokud nedáš souhlas
              výše).
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
