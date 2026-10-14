export function isSameOrigin(request: Request): boolean {
  try {
    const requestOrigin = new URL(request.url).origin;
    const origin = request.headers.get("origin");
    if (origin) return equivalentOrigin(origin, requestOrigin);

    const referer = request.headers.get("referer");
    if (referer) return equivalentOrigin(new URL(referer).origin, requestOrigin);

    return false;
  } catch {
    return false;
  }
}

function equivalentOrigin(left: string, right: string): boolean {
  const a = new URL(left);
  const b = new URL(right);
  if (a.protocol !== b.protocol || a.port !== b.port) return false;
  if (a.hostname === b.hostname) return true;
  const loopbacks = new Set(["localhost", "127.0.0.1", "::1"]);
  return loopbacks.has(a.hostname) && loopbacks.has(b.hostname);
}
