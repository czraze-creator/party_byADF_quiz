import { NextResponse } from "next/server";
import {
  getProgress,
  getQuestionForStation,
  getStation,
  upsertProgress,
} from "@/lib/db/store";
import { toPublicQuestion, shuffle } from "@/lib/dto";
import { getCurrentParticipant } from "@/lib/session";
import type { StationId } from "@/lib/types";

export async function POST(
  req: Request,
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const code = (body as { code?: unknown })?.code;
  if (typeof code !== "string" || code.length < 2 || code.length > 24) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const station = await getStation(stationId);
  if (!station) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const normalized = code.trim().toUpperCase();
  if (normalized !== station.code.toUpperCase()) {
    return NextResponse.json({ error: "wrong_code" }, { status: 401 });
  }

  const existingProgress = await getProgress(participant.id);
  const existing = existingProgress.find((p) => p.stationId === stationId);
  await upsertProgress({
    participantId: participant.id,
    stationId,
    unlockedAt: existing?.unlockedAt ?? new Date().toISOString(),
    answeredAt: existing?.answeredAt ?? null,
    selectedAnswerId: existing?.selectedAnswerId ?? null,
    isCorrect: existing?.isCorrect ?? null,
  });

  const question = await getQuestionForStation(stationId);
  if (!question) {
    return NextResponse.json({ error: "no_question" }, { status: 500 });
  }
  const publicQ = toPublicQuestion(question);
  publicQ.answers = shuffle(publicQ.answers, `${participant.id}:${question.id}`);

  return NextResponse.json({ question: publicQ });
}
