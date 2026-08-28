import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const ext = path.extname(file.name) || ".jpg";
    const randomName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
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
