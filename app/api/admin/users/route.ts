import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getUsers, createUser, deleteUser, getUserByUsername, updateUser, writeAuditLog } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import crypto from "node:crypto";
import { isSameOrigin } from "@/lib/security/request";
import { adminUserSchema } from "@/lib/validation/admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const users = getUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = adminUserSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu tài khoản không hợp lệ." }, { status: 422 });
    const { username, password, name, role } = parsed.data;

    const existing = getUserByUsername(username.trim());
    if (existing) {
      return NextResponse.json(
        { error: "Tên đăng nhập đã được sử dụng." },
        { status: 409 }
      );
    }

    const id = `user_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const password_hash = hashPassword(password);

    createUser({
      id,
      username: username.trim(),
      password_hash,
      name: name.trim(),
      role,
    });
    writeAuditLog({ actorId: auth.user.id, action: "user.created", target: username, ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Lỗi tạo tài khoản." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, name, role, password } = body;

    if (typeof id !== "string" || !id || typeof name !== "string" || !name.trim() || name.length > 200) {
      return NextResponse.json(
        { error: "Thiếu ID hoặc họ tên." },
        { status: 400 }
      );
    }

    const updates: { name?: string; role?: string; password_hash?: string } = {
      name: name.trim(),
      role: role === "admin" ? "admin" : "editor",
    };

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 12 || password.length > 256) {
        return NextResponse.json({ error: "Mật khẩu phải có từ 12 đến 256 ký tự." }, { status: 422 });
      }
      updates.password_hash = hashPassword(password);
    }

    updateUser(id, updates);
    writeAuditLog({ actorId: auth.user.id, action: "user.updated", target: id, ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật tài khoản." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID người dùng." }, { status: 400 });
  }

  if (id === auth.user.id || id === "admin_root") {
    return NextResponse.json({ error: "Không thể xóa tài khoản này." }, { status: 400 });
  }

  deleteUser(id);
  writeAuditLog({ actorId: auth.user.id, action: "user.deleted", target: id, ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown" });
  return NextResponse.json({ success: true });
}
