import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getAdminPrograms } from "@/lib/services/admin-content";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const group = searchParams.get("group") || undefined;

  const programs = getAdminPrograms({ search, group });

  return NextResponse.json({
    programs,
    total: programs.length,
  });
}
