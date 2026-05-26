import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin";
import {
  getGameState,
  listAllParticipantsWithProgress,
  listStations,
} from "@/lib/db/store";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stations = await listStations();
  const participants = await listAllParticipantsWithProgress();
  const gameState = await getGameState();

  const stationStats = stations.map((s) => {
    const rows = participants.flatMap((p) =>
      p.progress.filter((x) => x.stationId === s.id),
    );
    return {
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      code: s.code,
      unlocked: rows.filter((r) => r.unlockedAt).length,
      correct: rows.filter((r) => r.isCorrect === true).length,
      wrong: rows.filter((r) => r.isCorrect === false).length,
    };
  });

  return NextResponse.json({
    gameState,
    totals: {
      participants: participants.length,
      completed: participants.filter((p) => p.completed).length,
      stations: stations.length,
    },
    stationStats,
    recent: participants
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        email: p.email,
        completed: p.completed,
        correctCount: p.progress.filter((x) => x.isCorrect === true).length,
        createdAt: p.createdAt,
      })),
    eligibleForDrawing: participants
      .filter((p) => p.completed)
      .map((p) => ({ id: p.id, name: p.name, email: p.email, phone: p.phone })),
  });
}
