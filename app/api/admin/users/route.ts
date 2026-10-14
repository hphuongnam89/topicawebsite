import { NextResponse } from "next/server";
import { readBoundedJson } from "@/lib/http/read-json";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getUsers,
  createUser,
  deleteUser,
  getUserByUsername,
  updateUser,
  getUserById,
  getDb,
} from "@/lib/db";
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
    const rawBody = await readBoundedJson(request);
    const body =
      rawBody && typeof rawBody === "object"
        ? (rawBody as { username?: unknown; password?: unknown; name?: unknown; role?: unknown })
        : {};
    const { username, password, name, role } = body;

    if (
      typeof username !== "string" ||
      !username.trim() ||
      username.length > 100 ||
      typeof password !== "string" ||
      !password ||
      password.length > 256 ||
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 150
    ) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên." },
        { status: 400 },
      );
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
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
    const rawBody = await readBoundedJson(request);
    const body =
      rawBody && typeof rawBody === "object"
        ? (rawBody as { id?: unknown; name?: unknown; role?: unknown; password?: unknown })
        : {};
    const { id, name, role, password } = body;

    if (
      typeof id !== "string" ||
      !id ||
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 150
    ) {
      return NextResponse.json({ error: "Thiếu ID hoặc họ tên." }, { status: 400 });
    }

    if (password !== undefined && password !== null) {
      if (typeof password !== "string" || password.length > 256) {
        return NextResponse.json({ error: "Mật khẩu không hợp lệ." }, { status: 400 });
      }
      if (password.trim().length > 0 && password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          { error: `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` },
          { status: 400 },
        );
      }
    }

    const db = getDb();
    db.exec("BEGIN IMMEDIATE");
    try {
      const targetUser = getUserById(id);
      if (!targetUser) {
        db.exec("ROLLBACK");
        return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
      }

      const updates: { name?: string; role?: string; password_hash?: string } = {
        name: name.trim(),
        role: role === "admin" ? "admin" : "editor",
      };

      if (targetUser.role === "admin" && updates.role !== "admin") {
        const adminCount = (
          db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as {
            count: number;
          }
        ).count;
        if (adminCount <= 1) {
          db.exec("ROLLBACK");
          return NextResponse.json(
            { error: "Không thể hạ quyền quản trị viên duy nhất còn lại trong hệ thống." },
            { status: 400 },
          );
        }
      }

      if (typeof password === "string" && password.trim().length > 0) {
        updates.password_hash = hashPassword(password);
      }

      const updated = updateUser(id, updates);
      if (!updated) {
        db.exec("ROLLBACK");
        return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
      }

      recordAdminAudit(auth.user, "update", "user", id, [
        "name",
        "role",
        ...(typeof password === "string" && password.trim() ? ["password"] : []),
      ]);

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (innerError) {
      db.exec("ROLLBACK");
      throw innerError;
    }
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

  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const targetUser = getUserById(id);
    if (!targetUser) {
      db.exec("ROLLBACK");
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      const adminCount = (
        db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as {
          count: number;
        }
      ).count;
      if (adminCount <= 1) {
        db.exec("ROLLBACK");
        return NextResponse.json(
          { error: "Không thể xóa quản trị viên duy nhất còn lại trong hệ thống." },
          { status: 400 },
        );
      }
    }

    const deleted = deleteUser(id);
    if (!deleted) {
      db.exec("ROLLBACK");
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
    }
    recordAdminAudit(auth.user, "delete", "user", id, ["account"]);
    db.exec("COMMIT");
    return NextResponse.json({ success: true });
  } catch (innerError) {
    db.exec("ROLLBACK");
    console.error("Delete user error:", innerError);
    return NextResponse.json({ error: "Lỗi xóa tài khoản." }, { status: 500 });
  }
}
