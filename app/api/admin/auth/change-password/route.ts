import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getUserById, updateUserPassword, writeAuditLog } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { isSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." },
        { status: 400 }
      );
    }

    if (newPassword.length < 12 || newPassword.length > 256) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có từ 12 đến 256 ký tự." },
        { status: 400 }
      );
    }

    const user = getUserById(auth.user.id);
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
    updateUserPassword(auth.user.id, newHash);
    writeAuditLog({ action: "auth.password_changed", actorId: auth.user.id, ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "unknown" });

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đổi mật khẩu." }, { status: 500 });
  }
}
