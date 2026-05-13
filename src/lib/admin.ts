import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

const COOKIE = "quiz_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "adf2026";
}

export function verifyAdminPassword(pw: string): boolean {
  const expected = getAdminPassword();
  const a = Buffer.from(pw, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, getAdminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  if (!val) return false;
  return verifyAdminPassword(val);
}
