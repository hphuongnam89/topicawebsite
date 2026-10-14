import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { readBoundedJson } from "@/lib/http/read-json";
import { BoundedRateLimiter, getClientIp } from "@/lib/security/rate-limit";

const loginLimiter = new BoundedRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  maxKeys: 5000,
});

function clientKey(request: Request, username: string): string {
  const ip = getClientIp(request);
  return `${ip}:${username.toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await readBoundedJson(request, 4096);
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu đăng nhập không hợp lệ. Vui lòng thử lại." },
        { status: 400 },
      );
    }

    const { username, password } =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password ||
      username.length > 100 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu hợp lệ." },
        { status: 400 },
      );
    }

    const key = clientKey(request, username.trim());
    const limitStatus = loginLimiter.check(key);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau." },
        {
          status: 429,
          headers: { "Retry-After": String(limitStatus.retryAfterSeconds) },
        },
      );
    }

    const user = getUserByUsername(username.trim());
    if (!user) {
      const recorded = loginLimiter.increment(key);
      if (!recorded.allowed) {
        return NextResponse.json(
          { error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau." },
          {
            status: 429,
            headers: { "Retry-After": String(recorded.retryAfterSeconds) },
          },
        );
      }
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 },
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      const recorded = loginLimiter.increment(key);
      if (!recorded.allowed) {
        return NextResponse.json(
          { error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau." },
          {
            status: 429,
            headers: { "Retry-After": String(recorded.retryAfterSeconds) },
          },
        );
      }
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 },
      );
    }

    loginLimiter.reset(key);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // Instead of using cookies().set, set directly on the response to ensure it sets properly on Render
    const { createSessionToken } = await import("@/lib/auth/session");
    const token = createSessionToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    response.cookies.set("topica_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập." },
      { status: 500 },
    );
  }
}
