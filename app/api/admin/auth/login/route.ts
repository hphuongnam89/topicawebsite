import { consumeRateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { getUserByUsername, writeAuditLog } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getClientIp, readJsonBody, BodyTooLargeError } from "@/lib/security/request";
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
function clientKey(request: Request, username: string): string {
  const ip = getClientIp(request);
  return `${ip}:${username.toLowerCase()}`;
}
function clientIp(request: Request): string {
  return getClientIp(request);
}
export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await readJsonBody(request, 4096);
    } catch (error) {
      if (error instanceof BodyTooLargeError)
        return NextResponse.json({ error: "Payload too large" }, { status: 413 });
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
      username.trim().length < 3 ||
      username.trim().length > 100 ||
      password.length < 1 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." },
        { status: 400 },
      );
    }
    const key = clientKey(request, username.trim());
    const retryAfter = await consumeRateLimit(`login:${key}`, {
      limit: MAX_FAILURES,
      windowMs: WINDOW_MS,
    });
    if (retryAfter !== null) {
      return NextResponse.json(
        { error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        },
      );
    }
    const user = await getUserByUsername(username.trim());
    if (!user) {
      await writeAuditLog({
        action: "auth.login_failed",
        target: username.trim(),
        ip: clientIp(request),
      });
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 },
      );
    }
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      await writeAuditLog({
        action: "auth.login_failed",
        target: username.trim(),
        ip: clientIp(request),
      });
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 },
      );
    }
    await writeAuditLog({ action: "auth.login_success", actorId: user.id, ip: clientIp(request) });
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
    const token = createSessionToken(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      user.session_version,
    );
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
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
