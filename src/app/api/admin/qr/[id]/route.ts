import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminAuthed } from "@/lib/admin";
import { getStation } from "@/lib/db/store";
import type { StationId } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const stationId = Number(id) as StationId;
  const station = await getStation(stationId);
  if (!station) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // QR encodes the public game URL (homepage). The station code is on the printed sheet.
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const target = `${origin}/?utm_source=qr&utm_medium=station_${stationId}`;
  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "Q",
    margin: 1,
    color: { dark: "#0A2540", light: "#FFFFFF" },
  });
  return new NextResponse(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}
