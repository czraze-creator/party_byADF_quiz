import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin";
import { getGameState, setGameClosed } from "@/lib/db/store";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const state = await getGameState();
  return NextResponse.json(state);
}

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
  const action = (body as { action?: unknown })?.action;
  if (action !== "close" && action !== "open") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  const state = await setGameClosed(action === "close");
  return NextResponse.json(state);
}
