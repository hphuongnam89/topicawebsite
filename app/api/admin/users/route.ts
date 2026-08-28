import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUsers, createUser, deleteUser, getUserByUsername } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import crypto from "node:crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = getUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên." },
        { status: 400 }
      );
    }

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
      role: role === "admin" ? "admin" : "editor",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Lỗi tạo tài khoản." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Thiếu ID người dùng." }, { status: 400 });
  }

  if (id === currentUser.id || id === "admin_root") {
    return NextResponse.json({ error: "Không thể xóa tài khoản này." }, { status: 400 });
  }

  deleteUser(id);
  return NextResponse.json({ success: true });
}
