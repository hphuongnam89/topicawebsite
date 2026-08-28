import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "topica_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "topica-secret-key-change-in-production-min32chars-secure";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface SessionPayload {
  user: SessionUser;
  expiresAt: number;
}

function signToken(data: string): string {
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verifyAndDecodeToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");

  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
    if (!isMatch) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as SessionPayload;
    if (payload.expiresAt < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates a signed session token for a user
 */
export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return signToken(data);
}

/**
 * Sets session cookie in Next.js response context
 */
export async function setSessionCookie(user: SessionUser) {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clears session cookie (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Gets the current authenticated user from session cookie
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const payload = verifyAndDecodeToken(sessionCookie.value);
    return payload?.user ?? null;
  } catch {
    return null;
  }
}
