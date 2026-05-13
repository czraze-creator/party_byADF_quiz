import { NextResponse } from "next/server";
import {
  createParticipant,
  findParticipantByEmail,
} from "@/lib/db/store";
import { setSessionCookie } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
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
