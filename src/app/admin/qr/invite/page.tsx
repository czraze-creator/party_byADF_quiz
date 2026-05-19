"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminInviteQRPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      setAuthed(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Scope the invite-card print rules in globals.css to just this route.
  useEffect(() => {
    document.body.classList.add("print-invite-card");
    return () => {
      document.body.classList.remove("print-invite-card");
    };
  }, []);

  if (authed !== true) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between print:hidden">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Pozvánka — vstup do hry
          </span>
          <h1 className="text-display mt-2 text-4xl font-medium">
            Tisková karta s QR
          </h1>
          <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
            Formát A6 (148×105 mm), stejný jako hrací karta. Tiskni v barvě
            na silnější papír, případně lamiňuj. Hosté skenují → otevře se
            úvodní obrazovka a začnou hru.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[var(--color-bg-deep)] hover:brightness-110"
        >
          Tisknout
        </button>
      </header>

      {/* The printable card. Sized for A6 landscape (148×105 mm). */}
      <div className="mx-auto print:m-0">
        <div className="invite-card invite-print-card">
          <div className="invite-bg" aria-hidden="true" />
          <div className="invite-glow invite-glow-cyan" aria-hidden="true" />
          <div className="invite-glow invite-glow-gold" aria-hidden="true" />

          <div className="invite-content">
            <div className="invite-left">
              <Image
                src="/brand/badge-10-years-celebration.png"
                alt="10 Years Celebration"
                width={600}
                height={637}
                className="invite-badge"
                priority
              />
            </div>

            <div className="invite-right">
              <div className="invite-eyebrow">Party byADF · Červen 2026</div>
              <div className="invite-title">
                Skenuj <span className="invite-amp">&amp;</span> hraj
              </div>
              <div className="invite-subtitle">
                Jedna výzva. Čtyři stanoviště.
              </div>

              <div className="invite-qr-frame">
                <img
                  src="/api/admin/qr/home"
                  alt="QR kód · vstup do hry"
                  className="invite-qr"
                />
              </div>

              <div className="invite-footer">
                <Image
                  src="/brand/logo-adf-negativ.png"
                  alt="ADF"
                  width={120}
                  height={40}
                  className="invite-logo"
                />
                <span className="invite-years">2016 — 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .invite-card {
          position: relative;
          width: 148mm;
          height: 105mm;
          border-radius: 6mm;
          overflow: hidden;
          background: #051427;
          color: #f4f6fa;
          box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
        }
        .invite-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(120% 80% at 100% 50%, #0a4a5e 0%, #051427 65%),
            linear-gradient(135deg, #1a0f3a 0%, #051427 55%);
        }
        .invite-glow {
          position: absolute;
          filter: blur(40px);
          opacity: 0.55;
          pointer-events: none;
          border-radius: 50%;
        }
        .invite-glow-cyan {
          width: 70mm;
          height: 70mm;
          top: -10mm;
          right: -10mm;
          background: radial-gradient(closest-side, rgba(0, 184, 212, 0.6), transparent);
        }
        .invite-glow-gold {
          width: 80mm;
          height: 80mm;
          bottom: -20mm;
          left: -10mm;
          background: radial-gradient(closest-side, rgba(212, 165, 80, 0.35), transparent);
        }
        .invite-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 70mm 1fr;
          gap: 4mm;
          width: 100%;
          height: 100%;
          padding: 8mm 8mm 8mm 6mm;
          box-sizing: border-box;
        }
        .invite-left {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .invite-badge {
          width: 60mm;
          height: auto;
          filter: drop-shadow(0 4mm 10mm rgba(212, 165, 80, 0.35));
        }
        .invite-right {
          display: flex;
          flex-direction: column;
          gap: 2mm;
          justify-content: space-between;
        }
        .invite-eyebrow {
          font-size: 2.6mm;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(244, 246, 250, 0.65);
        }
        .invite-title {
          font-family: var(--font-display, "Inter", system-ui, sans-serif);
          font-size: 11mm;
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-top: 1mm;
        }
        .invite-amp {
          color: #00b8d4;
          font-weight: 400;
        }
        .invite-subtitle {
          font-size: 3.4mm;
          color: rgba(244, 246, 250, 0.8);
          margin-top: 0.5mm;
        }
        .invite-qr-frame {
          margin-top: 1mm;
          align-self: flex-start;
          background: #ffffff;
          padding: 2mm;
          border-radius: 3mm;
          box-shadow: 0 3mm 12mm rgba(0, 0, 0, 0.35);
        }
        .invite-qr {
          display: block;
          width: 28mm;
          height: 28mm;
        }
        .invite-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1mm;
          padding-top: 2mm;
          border-top: 0.25mm solid rgba(244, 246, 250, 0.15);
        }
        .invite-logo {
          height: 6mm;
          width: auto;
        }
        .invite-years {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 2.8mm;
          letter-spacing: 0.18em;
          color: rgba(212, 165, 80, 0.85);
        }
      `}</style>
    </div>
  );
}
