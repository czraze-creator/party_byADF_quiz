import { NextResponse } from "next/server";
import {
  createParticipant,
  findParticipantByEmail,
} from "@/lib/db/store";
import { setSessionCookie } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_SECONDS = 60 * 60; // 1 hour
const RATE_MAX = 3;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await checkRateLimit(
    ip,
    "participants",
    RATE_WINDOW_SECONDS,
    RATE_MAX,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { name, email, phone, consentMarketing } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const existing = await findParticipantByEmail(email);
  if (existing) {
    await setSessionCookie(existing.sessionToken);
    return NextResponse.json({
      id: existing.id,
      name: existing.name,
      resumed: true,
    });
  }

  const participant = await createParticipant({
    name,
    email,
    phone: typeof phone === "string" ? phone : null,
    consentMarketing: consentMarketing === true,
  });
  await setSessionCookie(participant.sessionToken);

  return NextResponse.json({
    id: participant.id,
    name: participant.name,
    resumed: false,
  });
}
