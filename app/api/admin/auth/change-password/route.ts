import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getUserById, updateUserPassword } from "@/lib/db";
import { verifyPassword, hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { isSameOrigin } from "@/lib/security/request";
import { recordAdminAudit } from "@/lib/services/admin-audit";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." },
        { status: 400 },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Mật khẩu mới phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` },
        { status: 400 },
      );
    }

    const user = getUserById(auth.user.id);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const isMatch = verifyPassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    updateUserPassword(auth.user.id, newHash);
    recordAdminAudit(auth.user, "update", "user", auth.user.id, ["password"]);

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đổi mật khẩu." }, { status: 500 });
  }
}
