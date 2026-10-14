import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getPublicMediaDirectory, isSafeMediaName } from "@/lib/services/media-storage";

const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!isSafeMediaName(name))
    return NextResponse.json({ error: "Tên tệp không hợp lệ." }, { status: 400 });
  const mimeType = mimeTypes[path.extname(name).slice(1).toLowerCase()];
  if (!mimeType)
    return NextResponse.json({ error: "Loại tệp không được hỗ trợ." }, { status: 415 });
  try {
    const buffer = await fs.readFile(path.join(getPublicMediaDirectory(), name));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy tệp." }, { status: 404 });
  }
}
