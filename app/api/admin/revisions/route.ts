import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { isSameOrigin } from "@/lib/security/request";
import { getDb } from "@/lib/db";
import { createDraftRevision, WorkflowError } from "@/lib/services/revisions";
import { draftInputSchema } from "@/lib/validation/revisions";
import { entityTables } from "@/lib/services/content-entities";
import { getPublishedRevision, getRevisions } from "@/lib/services/revisions";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";
export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const url = new URL(request.url),
    type = url.searchParams.get("entityType"),
    id = url.searchParams.get("entityId");
  if (type && id) {
    if (!Object.hasOwn(entityTables, type))
      return NextResponse.json({ error: "Loại nội dung không hợp lệ" }, { status: 422 });
    const base = getDb()
      .prepare(`SELECT * FROM ${entityTables[type as keyof typeof entityTables]} WHERE id=?`)
      .get(id);
    const revisions = getRevisions(type, id),
      published = getPublishedRevision(type, id);
    if (!base && !revisions.length)
      return NextResponse.json({ error: "Không tìm thấy nội dung với mã này" }, { status: 404 });
    const latest = revisions[0];
    return NextResponse.json(
      {
        payload: latest
          ? JSON.parse(latest.payload)
          : published
            ? JSON.parse(published.payload)
            : base,
        baseRevisionId: latest?.id ?? 0,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const revisions = getDb()
    .prepare("SELECT * FROM content_revisions ORDER BY updated_at DESC,id DESC LIMIT 200")
    .all();
  return NextResponse.json(
    { revisions, serverTime: Date.now() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const parsed = draftInputSchema.safeParse(await readBoundedJson(request, 500000));
    if (!parsed.success)
      return NextResponse.json({ error: "Thông tin bản nháp không hợp lệ" }, { status: 422 });
    if (JSON.stringify(parsed.data.payload).length > 500000)
      return NextResponse.json({ error: "Nội dung quá lớn" }, { status: 413 });
    const revision = createDraftRevision({
      ...parsed.data,
      actorId: auth.user.id,
      actorName: auth.user.name,
    });
    return NextResponse.json({ revision }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof WorkflowError ? error.message : "Không lưu được bản nháp" },
      {
        status:
          error instanceof WorkflowError
            ? error.status
            : error instanceof BodyLimitError
              ? 413
              : 422,
      },
    );
  }
}
