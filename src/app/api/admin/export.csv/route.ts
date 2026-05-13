import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin";
import { listAllParticipantsWithProgress, listStations } from "@/lib/db/store";

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stations = await listStations();
  const participants = await listAllParticipantsWithProgress();

  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "consent_marketing",
    "created_at",
    ...stations.map((s) => `station_${s.id}_${s.name}`),
    "all_correct",
  ];

  const rows: string[] = [headers.join(",")];
  for (const p of participants) {
    const stationCols = stations.map((s) => {
      const row = p.progress.find((x) => x.stationId === s.id);
      if (!row) return "—";
      if (row.isCorrect === true) return "ok";
      if (row.isCorrect === false) return "wrong";
      if (row.unlockedAt) return "unlocked";
      return "—";
    });
    const cells = [
      p.id,
      p.name,
      p.email,
      p.phone ?? "",
      p.consentMarketing ? "yes" : "no",
      p.createdAt,
      ...stationCols,
      p.completed ? "yes" : "no",
    ];
    rows.push(cells.map(csvEscape).join(","));
  }

  return new NextResponse("﻿" + rows.join("\n"), {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="adf-quiz-participants-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
