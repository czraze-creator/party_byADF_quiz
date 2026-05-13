import { NextResponse } from "next/server";
import { setAdminCookie, verifyAdminPassword } from "@/lib/admin";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
