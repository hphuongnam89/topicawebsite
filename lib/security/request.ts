export function isSameOrigin(request: Request): boolean {
  try {
    const rawOrigin = request.headers.get("origin");
    const rawReferer = request.headers.get("referer");
    const clientOriginStr = rawOrigin || (rawReferer ? new URL(rawReferer).origin : null);
    if (!clientOriginStr) return false;

    const clientOrigin = new URL(clientOriginStr);
    const requestUrl = new URL(request.url);

    const forwardedProto = (
      request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "")
    )
      .split(",")[0]
      .trim();
    const forwardedHost = (
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      requestUrl.host
    )
      .split(",")[0]
      .trim();
    const expectedOrigin = new URL(`${forwardedProto}://${forwardedHost}`);

    return (
      equivalentOrigin(clientOrigin, requestUrl) ||
      equivalentOrigin(clientOrigin, expectedOrigin)
    );
  } catch {
    return false;
  }
}

function equivalentOrigin(a: URL, b: URL): boolean {
  const loopbacks = new Set(["localhost", "127.0.0.1", "::1"]);
  const isLoopbackA = loopbacks.has(a.hostname);
  const isLoopbackB = loopbacks.has(b.hostname);

  const portA = a.port || (a.protocol === "https:" ? "443" : "80");
  const portB = b.port || (b.protocol === "https:" ? "443" : "80");

  if (isLoopbackA && isLoopbackB) {
    return portA === portB;
  }

  if (a.hostname === b.hostname) {
    if (a.protocol === b.protocol && portA === portB) return true;
    if (a.protocol === "https:" && b.protocol === "http:") return true;
  }

  return false;
}
