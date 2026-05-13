import { NextResponse } from "next/server";
import {
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
  if (existing.answeredAt) {
    return NextResponse.json({ error: "already_answered" }, { status: 409 });
  }

  await upsertProgress({
    participantId: participant.id,
    stationId: question.stationId,
    unlockedAt: existing.unlockedAt,
    answeredAt: new Date().toISOString(),
    selectedAnswerId: answer.id,
    isCorrect: answer.isCorrect,
  });

  const correctAnswerId = question.answers.find((a) => a.isCorrect)?.id ?? null;

  return NextResponse.json({
    isCorrect: answer.isCorrect,
    correctAnswerId: answer.isCorrect ? null : correctAnswerId,
  });
}
