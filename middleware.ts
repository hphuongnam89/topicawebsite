import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";

const SESSION_COOKIE_NAME = "topica_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to admin pages (exclude static files, api routes)
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const sessionSecret =
      process.env.ADMIN_SESSION_SECRET ||
      process.env.SESSION_SECRET ||
      "topica-super-safe-production-session-secret-2026-xyz";

    const hasSession = Boolean(
      sessionCookie?.value &&
        sessionSecret &&
        sessionSecret.length >= 32 &&
        (await verifySessionToken(sessionCookie.value, sessionSecret)),
    );

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
