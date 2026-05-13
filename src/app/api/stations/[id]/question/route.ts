import { NextResponse } from "next/server";
import {
  getProgress,
  getQuestionForStation,
} from "@/lib/db/store";
import { toPublicQuestion, shuffle } from "@/lib/dto";
import { getCurrentParticipant } from "@/lib/session";
import type { StationId } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await params;
  const stationId = Number(id) as StationId;
  if (![1, 2, 3, 4].includes(stationId)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const progress = await getProgress(participant.id);
  const row = progress.find((p) => p.stationId === stationId);
  if (!row?.unlockedAt) {
    return NextResponse.json({ error: "not_unlocked" }, { status: 403 });
  }

  const question = await getQuestionForStation(stationId);
  if (!question) {
    return NextResponse.json({ error: "no_question" }, { status: 500 });
  }

  const pq = toPublicQuestion(question);
  pq.answers = shuffle(pq.answers, `${participant.id}:${question.id}`);

  const correctAnswerId = row.answeredAt
    ? question.answers.find((a) => a.isCorrect)?.id ?? null
    : null;

  return NextResponse.json({
    question: pq,
    answeredAt: row.answeredAt,
    selectedAnswerId: row.selectedAnswerId,
    isCorrect: row.isCorrect,
    correctAnswerId,
  });
}
