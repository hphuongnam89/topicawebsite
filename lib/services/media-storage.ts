import "server-only";
import path from "node:path";

const fileNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,180}$/;

export function isSafeMediaName(name: string | null): name is string {
  return Boolean(
    name &&
    fileNamePattern.test(name) &&
    name !== "." &&
    name !== ".." &&
    path.basename(name) === name,
  );
}

export function getPublicMediaDirectory() {
  return process.env.TOPICA_UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export function getPrivateMediaDirectory() {
  return (
    process.env.TOPICA_PRIVATE_UPLOAD_DIR ||
    path.join(process.env.TOPICA_DATA_DIR || process.cwd(), "private_uploads")
  );
}

export function getPublicMediaUrl(name: string) {
  const configuredPrefix = process.env.TOPICA_UPLOAD_URL_PREFIX;
  // QA uploads live outside the build's static directory. Route them through
  // the isolated API so a fresh server can read files created after build.
  if (process.env.TOPICA_QA_MODE === "true" && process.env.TOPICA_UPLOAD_DIR)
    return `/api/public-media?name=${encodeURIComponent(name)}`;
  if (configuredPrefix) return `${configuredPrefix.replace(/\/$/, "")}/${name}`;
  if (process.env.TOPICA_UPLOAD_DIR) return `/api/public-media?name=${encodeURIComponent(name)}`;
  return `/uploads/${name}`;
}

export function getPrivateMediaUrl(name: string) {
  return `/api/admin/private-media?name=${encodeURIComponent(name)}`;
}
