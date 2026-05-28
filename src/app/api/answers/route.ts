import { NextResponse } from "next/server";
import {
  getGameState,
  getProgress,
  getQuestion,
  upsertProgress,
} from "@/lib/db/store";
import { getCurrentParticipant } from "@/lib/session";

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

  const { questionId, answerId } = (body ?? {}) as Record<string, unknown>;
  if (typeof questionId !== "string" || typeof answerId !== "string") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const question = await getQuestion(questionId);
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const answer = question.answers.find((a) => a.id === answerId);
  if (!answer) {
    return NextResponse.json({ error: "invalid_answer" }, { status: 400 });
  }

  const progressRows = await getProgress(participant.id);
  const existing = progressRows.find((p) => p.stationId === question.stationId);
  if (!existing?.unlockedAt) {
    return NextResponse.json({ error: "not_unlocked" }, { status: 403 });
  }
  // Pokud už trefil správnou odpověď, nedovol další pokusy. Špatné pokusy
  // ale ano — host smí zkoušet dál, dokud neuhodne.
  if (existing.isCorrect === true) {
    return NextResponse.json({ error: "already_answered" }, { status: 409 });
  }

  await upsertProgress({
    participantId: participant.id,
    stationId: question.stationId,
    unlockedAt: existing.unlockedAt,
    // answered_at se nastaví jen při finálně správné odpovědi
    answeredAt: answer.isCorrect ? new Date().toISOString() : null,
    selectedAnswerId: answer.id,
    isCorrect: answer.isCorrect,
  });

  // Správnou odpověď klientovi NEvyzrazujeme když host zvolil špatně —
  // jinak by si ji odečetl z odpovědi a klikl rovnou.
  return NextResponse.json({ isCorrect: answer.isCorrect });
}
