import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getRevisionById } from "@/lib/services/revisions";
import { createPreviewToken } from "@/lib/auth/preview";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const id = Number((await params).id),
    revision = getRevisionById(id);
  if (!revision) return NextResponse.json({ error: "Không tìm thấy bản sửa" }, { status: 404 });
  const token = createPreviewToken(auth.user.id, id, revision.updated_at);
  return NextResponse.json(
    { url: `/admin/preview/${id}?token=${encodeURIComponent(token)}` },
    { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
