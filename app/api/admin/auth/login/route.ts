import { NextResponse } from "next/server";
import { getUserByUsername, writeAuditLog } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request, username: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") || forwardedFor || "unknown";
  return `${ip}:${username.toLowerCase()}`;
}

function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  for (const [storedKey, value] of failures) {
    if (value.resetAt <= now) failures.delete(storedKey);
  }
  const entry = failures.get(key);
  if (!entry) {
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
  if (!failures.has(key) && failures.size >= 10_000) return;
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu đăng nhập không hợp lệ. Vui lòng thử lại." },
        { status: 400 }
      );
    }

    const { username, password } = (body && typeof body === "object" ? body as Record<string, unknown> : {});

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
        { status: 400 }
      );
    }

    const key = clientKey(request, username.trim());
    if (isRateLimited(key)) {
      return NextResponse.json({ error: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau." }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((failures.get(key)!.resetAt - Date.now()) / 1000)) },
      });
    }

    const user = getUserByUsername(username.trim());
    if (!user) {
      recordFailure(key);
      writeAuditLog({ action: "auth.login_failed", target: username.trim(), ip: clientIp(request) });
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      recordFailure(key);
      writeAuditLog({ action: "auth.login_failed", target: username.trim(), ip: clientIp(request) });
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    failures.delete(key);
    writeAuditLog({ action: "auth.login_success", actorId: user.id, ip: clientIp(request) });

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
    const token = createSessionToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }, user.session_version);
    
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
      { status: 500 }
    );
  }
}
