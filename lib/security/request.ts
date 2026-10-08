import crypto from "node:crypto";
import net from "node:net";

export function isSameOrigin(request: Request): boolean {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto");
    const requestOrigin =
      process.env.TRUSTED_INGRESS === "nginx" && host
        ? new URL(`${protocol === "https" ? "https:" : "http:"}//${host}`).origin
        : url.origin;
    const origin = request.headers.get("origin");
    if (origin) return origin === requestOrigin;

    const referer = request.headers.get("referer");
    if (referer) return new URL(referer).origin === requestOrigin;

    return false;
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  // nginx is the only ingress and overwrites this header; web must not expose a host port.
  if (process.env.TRUSTED_INGRESS !== "nginx") return "unknown";
  const value = request.headers.get("x-topica-client-ip")?.trim();
  return value && net.isIP(value) ? value : "unknown";
}

export function getRateLimitKey(request: Request): {
  key: string;
  trustedIp: boolean;
  setCookie?: string;
} {
  const ip = getClientIp(request);
  if (ip !== "unknown") return { key: `ip:${ip}`, trustedIp: true };
  if (process.env.NODE_ENV === "production")
    throw new Error("Production requires the private nginx ingress with a valid client IP");
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("ADMIN_SESSION_SECRET must have at least 32 characters");
  const sign = (value: string) => crypto.createHmac("sha256", secret).update(value).digest("hex");
  const cookie = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)topica_rl=([a-f0-9]{32}\.\d{13}\.[a-f0-9]{64})(?:;|$)/)?.[1];
  if (cookie) {
    const [token, expires, signature] = cookie.split(".");
    if (
      Number(expires) > Date.now() &&
      Number(expires) <= Date.now() + 86400000 &&
      crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(sign(`${token}.${expires}`), "hex"),
      )
    ) {
      return { key: `anon:${token}`, trustedIp: false };
    }
  }
  const token = crypto.randomBytes(16).toString("hex");
  const value = `${token}.${Date.now() + 86400000}`;
  return {
    key: `anon:${token}`,
    trustedIp: false,
    setCookie: `topica_rl=${value}.${sign(value)}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
  };
}

export class BodyTooLargeError extends Error {}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new BodyTooLargeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing request body");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
