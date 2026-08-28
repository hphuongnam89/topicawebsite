import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "topica_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to admin pages (exclude static files, api routes)
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const hasSession = Boolean(sessionCookie?.value);

    // If accessing login page while already logged in -> redirect to dashboard
    if (pathname === "/admin/login") {
      if (hasSession) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // If accessing protected admin routes without session -> redirect to login
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
