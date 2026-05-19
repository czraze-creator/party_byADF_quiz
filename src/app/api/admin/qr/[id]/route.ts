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
  // QR deep-links straight to the station's unlock screen AND carries the
  // station code, so a scan from the printed sheet auto-unlocks — no manual
  // typing. The code stays visible on the same sheet so a guest with a
  // damaged QR can fall back to typing it.
  //
  // Returned as PNG (not SVG) because the admin print flow rasterises the
  // entire card with html2canvas, and html2canvas does not reliably render
  // inline SVG glyphs. PNG inputs come out crisp.
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const target = `${origin}/play/station/${stationId}/unlock?code=${encodeURIComponent(station.code)}&utm_source=qr&utm_medium=station_${stationId}`;
  const png = await QRCode.toBuffer(target, {
    errorCorrectionLevel: "Q",
    margin: 1,
    color: { dark: "#0A2540", light: "#FFFFFF" },
    width: 800,
  });
  return new NextResponse(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "private, max-age=300" },
  });
}
