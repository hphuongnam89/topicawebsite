import "server-only";
import crypto from "node:crypto";
import { getSessionSecret } from "./session";
export function createPreviewToken(userId: string, revisionId: number, updatedAt: string) {
  const data = Buffer.from(
    JSON.stringify({ userId, revisionId, updatedAt, expires: Date.now() + 5 * 60 * 1000 }),
  ).toString("base64url");
  return `${data}.${crypto.createHmac("sha256", getSessionSecret()).update(`preview:${data}`).digest("base64url")}`;
}
export function verifyPreviewToken(
  token: string,
  userId: string,
  revisionId: number,
  updatedAt: string,
) {
  try {
    const [data, signature, ...rest] = token.split(".");
    if (!data || !signature || rest.length) return false;
    const expected = crypto
      .createHmac("sha256", getSessionSecret())
      .update(`preview:${data}`)
      .digest();
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected))
      return false;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return (
      payload.userId === userId &&
      payload.revisionId === revisionId &&
      payload.updatedAt === updatedAt &&
      payload.expires > Date.now() &&
      payload.expires <= Date.now() + 5 * 60 * 1000
    );
  } catch {
    return false;
  }
}
