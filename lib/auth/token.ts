export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface SessionPayload {
  user: SessionUser;
  expiresAt: number;
}

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)).buffer as ArrayBuffer;
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<SessionPayload>;
  const user = payload.user;
  return Boolean(
    user &&
      typeof user.id === "string" &&
      typeof user.username === "string" &&
      typeof user.name === "string" &&
      typeof user.role === "string" &&
      typeof payload.expiresAt === "number",
  );
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  try {
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(data),
    );
    if (!valid) return null;

    const payload: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(data)));
    if (!isSessionPayload(payload) || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
