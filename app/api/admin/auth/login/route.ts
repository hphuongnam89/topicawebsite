import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request, username: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") || forwardedFor || "unknown";
  return `${ip}:${username.toLowerCase()}`;
}

function isRateLimited(key: string): boolean {
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
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

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
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
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      recordFailure(key);
      return NextResponse.json(
        { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    failures.delete(key);

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
      { status: 500 }
    );
  }
}
