import { NextResponse } from "next/server";
import { readBoundedJson } from "@/lib/http/read-json";
import { requireUser } from "@/lib/auth/guards";
import { isSameOrigin } from "@/lib/security/request";
import { transitionRevision, WorkflowError } from "@/lib/services/revisions";
import { transitionInputSchema } from "@/lib/validation/revisions";
import { revalidatePath } from "next/cache";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1)
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  try {
    const parsed = transitionInputSchema.safeParse(await readBoundedJson(request, 65_536));
    if (!parsed.success)
      return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 422 });
    const { action, ...options } = parsed.data;
    const revision = transitionRevision(id, action, auth.user.id, options);
    revalidatePath("/", "layout");
    return NextResponse.json({ revision });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof WorkflowError ? error.message : "Không thực hiện được thao tác" },
      { status: error instanceof WorkflowError ? error.status : 500 },
    );
  }
}
