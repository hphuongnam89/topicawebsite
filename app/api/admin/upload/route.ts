import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isSameOrigin } from "@/lib/security/request";
import { assertFixturePath } from "@/lib/db/safety";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getPrivateMediaDirectory,
  getPrivateMediaUrl,
  getPublicMediaDirectory,
  getPublicMediaUrl,
} from "@/lib/services/media-storage";
import { recordAdminAudit } from "@/lib/services/admin-audit";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

function detectImageType(buffer: Buffer): { extension: string; mimeType: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (
    buffer.length >= 8 &&
    Buffer.from(buffer.subarray(0, 8)).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }
  return null;
}

function detectVideoType(buffer: Buffer): { extension: string; mimeType: string } | null {
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString() === "ftyp") {
    return { extension: "mp4", mimeType: "video/mp4" };
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return { extension: "webm", mimeType: "video/webm" };
  }
  return null;
}

function detectDocumentType(buffer: Buffer): { extension: string; mimeType: string } | null {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString() === "%PDF-"
    ? { extension: "pdf", mimeType: "application/pdf" }
    : null;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  let writtenFilePath: string | undefined;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const access = formData.get("access") === "private" ? "private" : "public";
    if (access === "private") {
      const admin = await requireAdmin();
      if ("response" in admin) return admin.response;
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "File phải có dung lượng từ 1 byte đến 25 MB." },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mediaType =
      detectImageType(buffer) || detectVideoType(buffer) || detectDocumentType(buffer);
    if (!mediaType || file.type !== mediaType.mimeType) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận ảnh JPG, PNG, WebP; video MP4, WebM; hoặc PDF hợp lệ." },
        { status: 415 },
      );
    }
    if (mediaType.mimeType.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Ảnh phải có dung lượng tối đa 5 MB." }, { status: 413 });
    }
    if (mediaType.mimeType === "application/pdf" && file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { error: "Tài liệu PDF phải có dung lượng tối đa 20 MB." },
        { status: 413 },
      );
    }

    const uploadsDir =
      access === "private" ? getPrivateMediaDirectory() : getPublicMediaDirectory();
    if (process.env.NODE_ENV === "test") assertFixturePath(path.join(uploadsDir, "upload.bin"));
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const randomName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${mediaType.extension}`;
    const filePath = path.join(uploadsDir, randomName);

    await fs.writeFile(filePath, buffer);
    writtenFilePath = filePath;

    const url =
      access === "private" ? getPrivateMediaUrl(randomName) : getPublicMediaUrl(randomName);
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
    recordAdminAudit(auth.user, "create", "media", randomName, ["file", "access"]);

    return NextResponse.json({
      success: true,
      url,
      name: file.name,
      size: file.size,
      mimeType: mediaType.mimeType,
      checksumSha256: checksum,
      access,
    });
  } catch (error) {
    if (writtenFilePath) await fs.unlink(writtenFilePath).catch(() => undefined);
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi tải file lên máy chủ." }, { status: 500 });
  }
}
