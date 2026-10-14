import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { verifySessionToken, type SessionPayload, type SessionUser } from "./token";
import { getUserById } from "@/lib/db";

const SESSION_COOKIE_NAME = "topica_admin_session";
const DEVELOPMENT_SESSION_SECRET = "development-only-session-secret-do-not-use-in-production";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export type { SessionUser } from "./token";

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return DEVELOPMENT_SESSION_SECRET;
  }
  throw new Error("ADMIN_SESSION_SECRET phải có ít nhất 32 ký tự ở production.");
}

function signToken(data: string): string {
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
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

    const payload = await verifySessionToken(sessionCookie.value, getSessionSecret());
    if (!payload) return null;
    const user = getUserById(payload.user.id);
    if (!user || (user.role !== "admin" && user.role !== "editor")) return null;
    return { id: user.id, username: user.username, name: user.name, role: user.role };
  } catch {
    return null;
  }
}
