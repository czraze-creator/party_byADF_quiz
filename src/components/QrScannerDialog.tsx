"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BarcodeDetectorCtor = new (init?: { formats: string[] }) => {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return w.BarcodeDetector ?? null;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onDetect: (raw: string) => void;
};

export function QrScannerDialog({ open, onClose, onDetect }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }

    const Detector = getBarcodeDetector();
    if (!Detector) {
      setError(
        "Tenhle prohlížeč scanování QR nezvládá. Otevři QR fotoaparátem telefonu nebo napiš kód ručně.",
      );
      return;
    }

    let cancelled = false;
    setError(null);
    setStarting(true);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        // iOS Safari needs these
        video.setAttribute("playsinline", "true");
        video.muted = true;
        await video.play().catch(() => {});

        const detector = new Detector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelled || detectedRef.current) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              detectedRef.current = true;
              const raw = codes[0].rawValue;
              onDetect(raw);
              return;
            }
          } catch {
            /* keep trying */
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error && e.name === "NotAllowedError"
              ? "Pro scanování potřebuju přístup ke kameře. Povol ho v nastavení prohlížeče."
              : "Nepodařilo se zapnout kameru. Zkus to znovu nebo napiš kód ručně.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [open, onDetect, stop]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-bg-deep)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            Naskenuj QR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-[var(--color-text)]"
            aria-label="Zavřít"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-square w-full bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />

          {/* viewfinder frame */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-3/5 w-3/5">
              <div className="absolute -top-px -left-px h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-[var(--color-accent)]" />
              <div className="absolute -top-px -right-px h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 border-[var(--color-accent)]" />
              <div className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-2xl border-l-2 border-b-2 border-[var(--color-accent)]" />
              <div className="absolute -bottom-px -right-px h-8 w-8 rounded-br-2xl border-r-2 border-b-2 border-[var(--color-accent)]" />
            </div>
          </div>

          {(starting || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-6 text-center text-sm text-[var(--color-text-muted)]">
              {error ? (
                <p>{error}</p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                  <span>Zapínám kameru…</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 text-center text-xs text-[var(--color-text-muted)]">
          Namiř fotoaparát na QR ze stanoviště. Rozpoznáme ho sami.
        </div>
      </div>
    </div>
  );
}
