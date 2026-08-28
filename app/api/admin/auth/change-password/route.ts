import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById, updateUserPassword } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    const user = getUserById(currentUser.id);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const isMatch = verifyPassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không chính xác." },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    updateUserPassword(currentUser.id, newHash);

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đổi mật khẩu." }, { status: 500 });
  }
}
