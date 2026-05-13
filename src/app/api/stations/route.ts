import { NextResponse } from "next/server";
import { listStations } from "@/lib/db/store";
import { toPublicStation } from "@/lib/dto";

export async function GET() {
  const stations = await listStations();
  return NextResponse.json({ stations: stations.map(toPublicStation) });
}
