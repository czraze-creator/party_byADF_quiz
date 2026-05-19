"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { printImageUrls } from "@/lib/printAsImage";

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

  // Scope the invite-card print rules in globals.css to just this route,
  // and inject the @page size declaration directly into <head> so the
  // printer asks for an A6-landscape sheet, not the default A4.
  useEffect(() => {
    document.body.classList.add("print-invite-card");
    const style = document.createElement("style");
    style.id = "page-invite-style";
    style.textContent = "@page { size: 148mm 105mm; margin: 0; }";
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove("print-invite-card");
      style.remove();
    };
  }, []);

  const [printing, setPrinting] = useState(false);

  // See /admin/qr — print uses a static screenshot PNG checked into
  // /public/print/ instead of rasterising the live DOM.
  async function handlePrint() {
    setPrinting(true);
    try {
      await printImageUrls(["/print/invite.png"], {
        pageSize: "148mm 105mm",
        widthMm: 148,
        heightMm: 105,
      });
    } finally {
      setPrinting(false);
    }
  }

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
          onClick={handlePrint}
          disabled={printing}
          className="rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[var(--color-bg-deep)] hover:brightness-110 disabled:opacity-60"
        >
          {printing ? "Připravuji…" : "Tisknout"}
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
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .invite-bg {
          position: absolute;
          inset: 0;
          /* Saturated stops so the diagonal purple → teal → navy
             gradient is visible after print conversion. */
          background:
            radial-gradient(130% 95% at 105% 55%, #0e7290 0%, #08344a 45%, #051427 75%),
            linear-gradient(135deg, #2a1565 0%, #14093c 30%, #051427 65%);
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .invite-glow {
          position: absolute;
          pointer-events: none;
        }
        /* Wide, soft radial stops give a blurred look that survives print
           (filter: blur is dropped on most print engines, which turns the
           glow into a hard disc). Mild blur stays for extra softness on
           screen but is purely cosmetic. */
        .invite-glow-cyan {
          width: 120mm;
          height: 120mm;
          top: -50mm;
          right: -50mm;
          background: radial-gradient(
            circle,
            rgba(0, 184, 212, 0.45) 0%,
            rgba(0, 184, 212, 0.18) 28%,
            rgba(0, 184, 212, 0.05) 55%,
            transparent 75%
          );
          filter: blur(8px);
        }
        .invite-glow-gold {
          width: 130mm;
          height: 130mm;
          bottom: -60mm;
          left: -55mm;
          background: radial-gradient(
            circle,
            rgba(212, 165, 80, 0.28) 0%,
            rgba(212, 165, 80, 0.12) 28%,
            rgba(212, 165, 80, 0.04) 55%,
            transparent 78%
          );
          filter: blur(8px);
        }
        @media print {
          .invite-glow {
            filter: none !important;
          }
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
