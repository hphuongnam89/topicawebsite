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
  const activeLocale = locale === "en" ? "en" : "vi";
  requestHeaders.set("x-topica-locale", activeLocale);

  let response: NextResponse;
  if (isEnRoute) {
    const targetViPath = localizedPath(pathname, "vi");
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = targetViPath;
    nextUrl.searchParams.set("lang", "en");
    response = NextResponse.rewrite(nextUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  response.headers.set("x-topica-locale", activeLocale);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
