import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import fs from "node:fs/promises";
import path from "node:path";
import { isSameOrigin } from "@/lib/security/request";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileNames = await fs.readdir(uploadsDir);

    const mediaList = await Promise.all(
      fileNames
        .filter((file) => !file.startsWith("."))
        .map(async (fileName) => {
          const filePath = path.join(uploadsDir, fileName);
          const stats = await fs.stat(filePath);

          return {
            name: fileName,
            url: `/uploads/${fileName}`,
            size: stats.size,
            updatedAt: stats.mtime.toISOString(),
          };
        })
    );

    // Sort by newest first
    mediaList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ media: mediaList });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách media." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || name.includes("..") || name.includes("/")) {
    return NextResponse.json({ error: "Tên file không hợp lệ." }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "uploads", name);
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Không thể xóa file." }, { status: 500 });
  }
}
