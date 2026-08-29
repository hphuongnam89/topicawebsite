import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isSameOrigin } from "@/lib/security/request";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function detectImageType(buffer: Buffer): { extension: string; mimeType: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (buffer.length >= 8 && Buffer.from(buffer.subarray(0, 8)).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") {
    return { extension: "webp", mimeType: "image/webp" };
  }
  return null;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File phải có dung lượng từ 1 byte đến 5 MB." }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageType = detectImageType(buffer);
    if (!imageType || file.type !== imageType.mimeType) {
      return NextResponse.json({ error: "Chỉ chấp nhận file JPG, PNG hoặc WebP hợp lệ." }, { status: 415 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const randomName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${imageType.extension}`;
    const filePath = path.join(uploadsDir, randomName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${randomName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi tải file lên máy chủ." }, { status: 500 });
  }
}
