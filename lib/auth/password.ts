import "server-only";
import crypto from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 100_000;
const DIGEST = "sha512";

/**
 * Hashes a password using PBKDF2 with SHA-512
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a password against a stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
  } catch {
    return false;
  }
}
