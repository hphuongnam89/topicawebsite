import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const selected = request.nextUrl.searchParams.get("lang");
  const locale = selected === "vi" || selected === "en" ? selected : request.cookies.get("topica_locale")?.value;
  requestHeaders.set("x-topica-locale", locale === "en" ? "en" : "vi");
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
