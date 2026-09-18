export function isSameOrigin(request: Request): boolean {
  try {
    const requestOrigin = new URL(request.url).origin;
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
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
