import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getUsers, createUser, deleteUser, getUserByUsername, updateUser } from "@/lib/db";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import crypto from "node:crypto";
import { isSameOrigin } from "@/lib/security/request";
import { recordAdminAudit } from "@/lib/services/admin-audit";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const users = getUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên." },
        { status: 400 },
      );
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` },
        { status: 400 },
      );
    }

    const existing = getUserByUsername(username.trim());
    if (existing) {
      return NextResponse.json({ error: "Tên đăng nhập đã được sử dụng." }, { status: 409 });
    }

    const id = `user_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const password_hash = hashPassword(password);

    createUser({
      id,
      username: username.trim(),
      password_hash,
      name: name.trim(),
      role: role === "admin" ? "admin" : "editor",
    });
    recordAdminAudit(auth.user, "create", "user", id, ["username", "name", "role"]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Lỗi tạo tài khoản." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { id, name, role, password } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Thiếu ID hoặc họ tên." }, { status: 400 });
    }

    const updates: { name?: string; role?: string; password_hash?: string } = {
      name: name.trim(),
      role: role === "admin" ? "admin" : "editor",
    };

    if (password && password.trim().length > 0) {
      if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH)
        return NextResponse.json(
          { error: `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` },
          { status: 400 },
        );
      updates.password_hash = hashPassword(password);
    }

    updateUser(id, updates);
    recordAdminAudit(auth.user, "update", "user", id, [
      "name",
      "role",
      ...(password?.trim() ? ["password"] : []),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật tài khoản." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID người dùng." }, { status: 400 });
  }

  if (id === auth.user.id || id === "admin_root") {
    return NextResponse.json({ error: "Không thể xóa tài khoản này." }, { status: 400 });
  }

  const deleted = deleteUser(id);
  if (!deleted) return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  recordAdminAudit(auth.user, "delete", "user", id, ["account"]);
  return NextResponse.json({ success: true });
}
