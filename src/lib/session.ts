import { cookies } from "next/headers";
import { findParticipantBySession } from "./db/store";

const COOKIE_NAME = "quiz_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentParticipant() {
  const token = await getSessionToken();
  if (!token) return null;
  return findParticipantBySession(token);
}
