import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import fs from "node:fs/promises";
import path from "node:path";
import { isSameOrigin } from "@/lib/security/request";
import { getDb } from "@/lib/db";
import {
  getPrivateMediaDirectory,
  getPrivateMediaUrl,
  getPublicMediaDirectory,
  getPublicMediaUrl,
  isSafeMediaName,
} from "@/lib/services/media-storage";
import { recordAdminAudit } from "@/lib/services/admin-audit";

const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const directories = [
      { access: "public" as const, directory: getPublicMediaDirectory(), url: getPublicMediaUrl },
      ...(auth.user.role === "admin"
        ? [
            {
              access: "private" as const,
              directory: getPrivateMediaDirectory(),
              url: getPrivateMediaUrl,
            },
          ]
        : []),
    ];
    const mediaList = (
      await Promise.all(
        directories.map(async ({ access, directory, url }) => {
          await fs.mkdir(directory, { recursive: true });
          const names = await fs.readdir(directory);
          return Promise.all(
            names.filter(isSafeMediaName).map(async (name) => {
              const stats = await fs.stat(path.join(directory, name));
              if (!stats.isFile()) return null;
              return {
                name,
                access,
                url: url(name),
                mimeType:
                  mimeTypes[path.extname(name).slice(1).toLowerCase()] ??
                  "application/octet-stream",
                size: stats.size,
                updatedAt: stats.mtime.toISOString(),
              };
            }),
          );
        }),
      )
    )
      .flat()
      .filter((item): item is NonNullable<typeof item> => item !== null);

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
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const access = searchParams.get("access") === "private" ? "private" : "public";
  if (access === "private" && auth.user.role !== "admin")
    return NextResponse.json(
      { error: "Chỉ quản trị viên được xóa tệp riêng tư." },
      { status: 403 },
    );
  if (!isSafeMediaName(name)) {
    return NextResponse.json({ error: "Tên file không hợp lệ." }, { status: 400 });
  }

  try {
    const filePath = path.join(
      access === "private" ? getPrivateMediaDirectory() : getPublicMediaDirectory(),
      name,
    );
    const db = getDb();
    const references = [
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM articles WHERE instr(coalesce(featured_image,''),?) > 0 OR instr(coalesce(content_html,''),?) > 0",
        )
        .get(name, name),
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM pages WHERE instr(coalesce(featured_image,''),?) > 0 OR instr(coalesce(content_html,''),?) > 0",
        )
        .get(name, name),
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM documents WHERE instr(coalesce(file_url,''),?) > 0 OR instr(coalesce(view_url,''),?) > 0",
        )
        .get(name, name),
      db
        .prepare("SELECT COUNT(*) AS count FROM content_revisions WHERE instr(payload,?) > 0")
        .get(name),
      db.prepare("SELECT COUNT(*) AS count FROM settings WHERE instr(value,?) > 0").get(name),
    ] as Array<{ count: number }>;
    if (references.some((row) => row.count > 0)) {
      return NextResponse.json(
        { error: "Tệp đang được nội dung sử dụng. Hãy thay hoặc gỡ liên kết trước khi xóa." },
        { status: 409 },
      );
    }
    await fs.unlink(filePath);
    recordAdminAudit(auth.user, "delete", "media", name, ["file", "access"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Không thể xóa file." }, { status: 500 });
  }
}
