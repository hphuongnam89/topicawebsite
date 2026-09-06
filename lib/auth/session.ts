import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/db";
import { verifySessionToken, type SessionPayload, type SessionUser } from "./token";

export const SESSION_COOKIE_NAME = "topica_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours in seconds

export type { SessionUser } from "./token";

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function signToken(data: string): string {
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Creates a signed session token for a user
 */
export function createSessionToken(user: SessionUser, sessionVersion = 0): string {
  const payload: SessionPayload = {
    user,
    sessionVersion,
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
    sameSite: "strict",
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
    if (!payload || typeof payload.sessionVersion !== "number") return null;
    const currentUser = getUserById(payload.user.id);
    if (!currentUser || payload.sessionVersion !== currentUser.session_version) return null;
    return {
      id: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
    };
  } catch {
    return null;
  }
}
