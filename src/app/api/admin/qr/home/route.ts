import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminAuthed } from "@/lib/admin";

export async function GET(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const target = `${origin}/?utm_source=qr&utm_medium=invite`;
  const png = await QRCode.toBuffer(target, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: "#0A2540", light: "#FFFFFF" },
    width: 800,
  });
  return new NextResponse(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "private, max-age=300" },
  });
}
