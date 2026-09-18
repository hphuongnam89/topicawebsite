import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPages, createPage } from "@/lib/db";
import { isSameOrigin } from "@/lib/security/request";
import { pageCreateSchema } from "@/lib/validation/admin";
import { revalidatePath } from "next/cache";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const pages = getPages();
    return NextResponse.json({ pages, totalPages: 1 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const parsed = pageCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu trang không hợp lệ." }, { status: 422 });
    }

    const newPage = createPage(parsed.data);

    revalidatePath("/");
    revalidatePath(`/${newPage.slug}`);

    return NextResponse.json({ success: true, page: newPage }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Đường dẫn (slug) đã tồn tại." }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
