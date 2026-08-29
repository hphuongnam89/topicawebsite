import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "./session";
import { apiError } from "@/lib/http/response";

type AuthResult = { user: SessionUser } | { response: NextResponse };

export async function requireUser(): Promise<AuthResult> {
  const user = await getCurrentUser();
  return user
    ? { user }
    : { response: apiError("Unauthorized", 401, "UNAUTHORIZED") };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireUser();
  if ("response" in result) return result;
  return result.user.role === "admin"
    ? result
    : { response: apiError("Forbidden", 403, "FORBIDDEN") };
}
