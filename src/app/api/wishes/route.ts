import { NextResponse } from "next/server";
import {
  getGameState,
  getWishByParticipant,
  upsertWish,
} from "@/lib/db/store";
import { getCurrentParticipant } from "@/lib/session";

export async function GET() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const wish = await getWishByParticipant(participant.id);
  return NextResponse.json({ wish });
}

export async function POST(req: Request) {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const state = await getGameState();
  if (state.isClosed) {
    return NextResponse.json({ error: "game_closed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = (body as { text?: unknown })?.text;
  if (typeof text !== "string") {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 1000) {
    return NextResponse.json({ error: "invalid_length" }, { status: 400 });
  }

  const wish = await upsertWish({
    participantId: participant.id,
    text: trimmed,
  });
  return NextResponse.json({ wish });
}
