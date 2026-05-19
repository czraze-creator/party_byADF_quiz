"use client";

import jsQR from "jsqr";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "photo">("live");
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

  // Decode a snapshot from <video> or an Image element via jsQR, returning
  // the decoded text if anything is recognised. Used both as a live-scan
  // fallback (when BarcodeDetector is unavailable) and for the photo path.
  function decodeImageData(
    pixels: Uint8ClampedArray,
    w: number,
    h: number,
  ): string | null {
    try {
      const result = jsQR(pixels, w, h, { inversionAttempts: "attemptBoth" });
      return result?.data ?? null;
    } catch {
      return null;
    }
  }

  const startLive = useCallback(async () => {
    setError(null);
    setStarting(true);
    detectedRef.current = false;
    let cancelled = false;
    const Detector = getBarcodeDetector();

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
      video.setAttribute("playsinline", "true");
      video.muted = true;
      await video.play().catch(() => {});

      if (Detector) {
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (cancelled || detectedRef.current) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              detectedRef.current = true;
              onDetect(codes[0].rawValue);
              return;
            }
          } catch {
            /* ignore — keep trying */
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // No BarcodeDetector — pull frames into a canvas and use jsQR.
        const canvas = document.createElement("canvas");
        const tick = () => {
          if (cancelled || detectedRef.current) return;
          if (video.readyState >= 2 && video.videoWidth > 0) {
            const w = video.videoWidth;
            const h = video.videoHeight;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);
              const img = ctx.getImageData(0, 0, w, h);
              const data = decodeImageData(img.data, w, h);
              if (data) {
                detectedRef.current = true;
                onDetect(data);
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch (e) {
      if (!cancelled) {
        const msg =
          e instanceof Error && e.name === "NotAllowedError"
            ? "Kamera je zablokovaná. Povol přístup, nebo použij Vyfotit a vyber snímek."
            : "Kameru se nepodařilo zapnout. Zkus Vyfotit s nativním fotoaparátem.";
        setError(msg);
        setMode("photo");
      }
    } finally {
      if (!cancelled) setStarting(false);
    }

    return () => {
      cancelled = true;
    };
  }, [onDetect]);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    if (mode !== "live") return;

    let active = true;
    (async () => {
      const cleanup = await startLive();
      if (!active && cleanup) cleanup();
    })();

    return () => {
      active = false;
      stop();
    };
  }, [open, mode, startLive, stop]);

  async function handlePhotoFile(file: File) {
    setError(null);
    setStarting(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(new Error("read_failed"));
        fr.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("img_failed"));
        el.src = dataUrl;
      });
      // Downscale very large photos to keep jsQR fast.
      const maxDim = 1280;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("ctx_failed");
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const decoded = decodeImageData(imgData.data, w, h);
      if (decoded) {
        onDetect(decoded);
      } else {
        setError(
          "Z fotky se nepodařilo přečíst QR. Zkus znovu z menší vzdálenosti, ostřeji.",
        );
      }
    } catch {
      setError("Nepodařilo se zpracovat fotku. Zkus to znovu.");
    } finally {
      setStarting(false);
    }
  }

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

        {mode === "live" ? (
          <div className="relative aspect-square w-full bg-black">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-3/5 w-3/5">
                <div className="absolute -top-px -left-px h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute -top-px -right-px h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-2xl border-l-2 border-b-2 border-[var(--color-accent)]" />
                <div className="absolute -bottom-px -right-px h-8 w-8 rounded-br-2xl border-r-2 border-b-2 border-[var(--color-accent)]" />
              </div>
            </div>
            {starting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-sm text-[var(--color-text-muted)]">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                  <span>Zapínám kameru…</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-6 bg-black/40 px-6 text-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-accent)]"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p className="max-w-xs text-sm text-[var(--color-text-muted)]">
              Klepni na tlačítko, fotoaparát se otevře a vyfotíš QR ze
              stanoviště.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-bg-deep)] hover:brightness-110"
              disabled={starting}
            >
              {starting ? "Čtu fotku…" : "Vyfotit QR"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handlePhotoFile(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <div className="border-t border-white/[0.06] px-5 py-3 text-center text-xs text-[var(--color-error)]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-center text-xs text-[var(--color-text-muted)]">
          {mode === "live" ? (
            <>
              <span>Namiř kameru na QR ze stanoviště.</span>
              <button
                type="button"
                onClick={() => setMode("photo")}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                Vyfotit
              </button>
            </>
          ) : (
            <>
              <span>Nemusíš mířit přesně — stačí, aby byl QR ostrý.</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("live");
                }}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                Živá kamera
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
