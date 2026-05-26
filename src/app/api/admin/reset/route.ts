import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin";
import { resetAllRegistrations } from "@/lib/db/store";

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  // Vyžaduj confirmation token aby se reset nepustil omylem
  const confirm = (body as { confirm?: unknown })?.confirm;
  if (confirm !== "RESET") {
    return NextResponse.json({ error: "missing_confirmation" }, { status: 400 });
  }
  await resetAllRegistrations();
  return NextResponse.json({ ok: true });
}
