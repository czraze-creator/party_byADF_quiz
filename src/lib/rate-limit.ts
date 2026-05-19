import { getSupabaseAdmin } from "./supabase/server";

type RateLimitResult = {
  allowed: boolean;
  hits: number;
  retryAfterSeconds: number;
};

/**
 * IP-based fixed-window rate limit, backed by Supabase.
 *
 * Single-row read + upsert — races between concurrent requests from the same
 * IP can lose at most one increment, which is fine at the scale of one party
 * event (low traffic, anti-spam not anti-DoS).
 */
export async function checkRateLimit(
  ip: string,
  scope: string,
  windowSeconds: number,
  max: number,
): Promise<RateLimitResult> {
  const sb = getSupabaseAdmin();
  const nowMs = Date.now();
  const winMs = windowSeconds * 1000;

  const { data: existing, error: readErr } = await sb
    .from("rate_limits")
    .select("hits, window_start")
    .eq("ip", ip)
    .eq("scope", scope)
    .maybeSingle();

  if (readErr) throw readErr;

  let newHits: number;
  let windowStartIso: string;
  if (!existing) {
    newHits = 1;
    windowStartIso = new Date(nowMs).toISOString();
  } else {
    const winStartMs = new Date(existing.window_start).getTime();
    if (nowMs - winStartMs > winMs) {
      newHits = 1;
      windowStartIso = new Date(nowMs).toISOString();
    } else {
      newHits = existing.hits + 1;
      windowStartIso = existing.window_start;
    }
  }

  const { error: writeErr } = await sb.from("rate_limits").upsert(
    { ip, scope, hits: newHits, window_start: windowStartIso },
    { onConflict: "ip,scope" },
  );
  if (writeErr) throw writeErr;

  const allowed = newHits <= max;
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(
        1,
        Math.ceil(
          (new Date(windowStartIso).getTime() + winMs - nowMs) / 1000,
        ),
      );

  return { allowed, hits: newHits, retryAfterSeconds };
}

/** Extract caller IP from Vercel/proxy headers; falls back to "unknown". */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
