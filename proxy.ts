import { NextResponse, type NextRequest } from "next/server";
import { localizedPath } from "@/lib/i18n/routes";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  requestHeaders.set("x-pathname", pathname);

  const isEnRoute = pathname === "/en" || pathname.startsWith("/en/");
  const selected = request.nextUrl.searchParams.get("lang");
  const locale = isEnRoute
    ? "en"
    : selected === "vi" || selected === "en"
      ? selected
      : request.cookies.get("topica_locale")?.value;
  requestHeaders.set("x-topica-locale", locale === "en" ? "en" : "vi");

  if (isEnRoute) {
    const targetViPath = localizedPath(pathname, "vi");
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = targetViPath;
    nextUrl.searchParams.set("lang", "en");
    return NextResponse.rewrite(nextUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
