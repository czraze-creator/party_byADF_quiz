import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/session";
import { getProgress, listStations } from "@/lib/db/store";
import type { PublicProgress, StationId } from "@/lib/types";

export async function GET() {
  const participant = await getCurrentParticipant();
  if (!participant) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const stations = await listStations();
  const rows = await getProgress(participant.id);

  const progress: PublicProgress[] = stations.map((s) => {
    const row = rows.find((r) => r.stationId === s.id);
    let state: PublicProgress["state"] = "locked";
    if (row?.answeredAt) state = "completed";
    else if (row?.unlockedAt) state = "unlocked";
    return {
      stationId: s.id as StationId,
      state,
      isCorrect: row?.isCorrect ?? null,
    };
  });

  const completed = progress.every(
    (p) => p.state === "completed" && p.isCorrect === true,
  );

  return NextResponse.json({
    participant: {
      id: participant.id,
      name: participant.name,
      email: participant.email,
    },
    progress,
    completed,
  });
}
