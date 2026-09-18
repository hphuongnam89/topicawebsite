import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { getPageById, updatePage, deletePage } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { pageUpdateSchema } from "@/lib/validation/admin";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const pageId = parseInt(id, 10);
  if (isNaN(pageId)) return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });

  const page = getPageById(pageId);
  if (!page) return NextResponse.json({ error: "Không tìm thấy trang." }, { status: 404 });

  return NextResponse.json({ page });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { id } = await params;
  const pageId = parseInt(id, 10);
  if (isNaN(pageId)) return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });

  try {
    const parsed = pageUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ." }, { status: 422 });
    }

    const updated = updatePage(pageId, parsed.data);
    if (!updated)
      return NextResponse.json({ error: "Không tìm thấy trang để cập nhật." }, { status: 404 });

    revalidatePath("/");
    revalidatePath(`/${updated.slug}`);

    return NextResponse.json({ success: true, page: updated });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại." }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { id } = await params;
  const pageId = parseInt(id, 10);
  if (isNaN(pageId)) return NextResponse.json({ error: "ID không hợp lệ." }, { status: 400 });

  const existing = getPageById(pageId);
  const success = deletePage(pageId);
  if (!success)
    return NextResponse.json({ error: "Không tìm thấy trang để xóa." }, { status: 404 });

  revalidatePath("/");
  if (existing?.slug) {
    revalidatePath(`/${existing.slug}`);
  }

  return NextResponse.json({ success: true });
}
