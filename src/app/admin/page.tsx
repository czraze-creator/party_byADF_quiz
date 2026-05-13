"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        setError("Špatné heslo.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error("request_failed");
      router.push("/admin/dashboard");
    } catch {
      setError("Něco se nepovedlo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo-adf-negativ.png"
            alt="ADF"
            width={180}
            height={60}
            className="h-10 w-auto"
          />
          <span className="mt-6 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Admin · Party byADF Quiz
          </span>
          <h1 className="text-display mt-2 text-3xl font-medium">Přihlášení</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <Input
              label="Heslo"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
            />
            <Button type="submit" fullWidth loading={submitting}>
              Přihlásit
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
