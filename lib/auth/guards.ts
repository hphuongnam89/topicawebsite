import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "./session";
import { apiError } from "@/lib/http/response";
import { can, type ResourceKind, type Action } from "./policy";
import type { UserRole } from "@/lib/db/schema";

type AuthResult = { user: SessionUser } | { response: NextResponse };

export async function requireUser(): Promise<AuthResult> {
  const user = await getCurrentUser();
  return user ? { user } : { response: apiError("Unauthorized", 401, "UNAUTHORIZED") };
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireUser();
  if ("response" in result) return result;
  return result.user.role === "admin"
    ? result
    : { response: apiError("Forbidden", 403, "FORBIDDEN") };
}

export async function requireRole(roles: UserRole[]): Promise<AuthResult> {
  const result = await requireUser();
  if ("response" in result) return result;
  return roles.includes(result.user.role as UserRole)
    ? result
    : { response: apiError("Forbidden", 403, "FORBIDDEN") };
}

export async function requirePermission(
  resource: ResourceKind,
  action: Action,
  isOwner = false,
): Promise<AuthResult> {
  const result = await requireUser();
  if ("response" in result) return result;
  const context = { role: result.user.role as UserRole, userId: result.user.id, isOwner };
  return can(context, resource, action)
    ? result
    : { response: apiError("Forbidden", 403, "FORBIDDEN") };
}
