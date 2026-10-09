import type { UserRole } from "@/lib/db/schema";

export type ResourceKind =
  "article" | "page" | "program" | "category" | "lead" | "media" | "user" | "setting";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "submit_for_review"
  | "review"
  | "approve"
  | "publish"
  | "unpublish"
  | "archive"
  | "export";

export interface PolicyContext {
  role: UserRole;
  userId?: string;
  isOwner?: boolean;
}

/**
 * Ma trận phân quyền RBAC chuẩn theo nguyên tắc Deny-by-default
 */
const ROLE_PERMISSIONS: Record<UserRole, Record<ResourceKind, Action[]>> = {
  admin: {
    article: [
      "create",
      "read",
      "update",
      "delete",
      "submit_for_review",
      "review",
      "approve",
      "publish",
      "unpublish",
      "archive",
    ],
    page: [
      "create",
      "read",
      "update",
      "delete",
      "submit_for_review",
      "review",
      "approve",
      "publish",
      "unpublish",
      "archive",
    ],
    program: ["create", "read", "update", "delete", "publish", "archive"],
    category: ["create", "read", "update", "delete"],
    lead: ["read", "update", "delete", "export"],
    media: ["create", "read", "update", "delete"],
    user: ["create", "read", "update", "delete"],
    setting: ["read", "update"],
  },
  publisher: {
    article: [
      "create",
      "read",
      "update",
      "submit_for_review",
      "review",
      "approve",
      "publish",
      "unpublish",
    ],
    page: [
      "create",
      "read",
      "update",
      "submit_for_review",
      "review",
      "approve",
      "publish",
      "unpublish",
    ],
    program: ["read", "update", "publish"],
    category: ["create", "read", "update"],
    lead: ["read"],
    media: ["create", "read", "update"],
    user: ["read"],
    setting: ["read"],
  },
  reviewer: {
    article: ["read", "review", "approve"],
    page: ["read", "review", "approve"],
    program: ["read", "review", "approve"],
    category: ["read"],
    lead: ["read"],
    media: ["read"],
    user: [],
    setting: ["read"],
  },
  editor: {
    article: ["create", "read", "update", "submit_for_review", "archive"],
    page: ["create", "read", "update", "submit_for_review"],
    program: ["read", "update"],
    category: ["create", "read"],
    lead: ["read", "update"],
    media: ["create", "read"],
    user: [],
    setting: [],
  },
  contributor: {
    article: ["create", "read", "update", "submit_for_review"],
    page: ["read"],
    program: ["read"],
    category: ["read"],
    lead: [],
    media: ["create", "read"],
    user: [],
    setting: [],
  },
};

/**
 * State machine cho vòng đời nội dung: Revision State Transitions
 */
export type RevisionState = "draft" | "in_review" | "approved" | "published" | "archived";

const VALID_STATE_TRANSITIONS: Record<RevisionState, RevisionState[]> = {
  draft: ["in_review", "archived"],
  in_review: ["approved", "draft", "archived"],
  approved: ["published", "draft", "archived"],
  published: ["draft", "archived"],
  archived: ["draft"],
};

/**
 * Kiểm tra quyền thực hiện hành động trên tài nguyên (Deny-by-default)
 */
export function can(context: PolicyContext, resource: ResourceKind, action: Action): boolean {
  if (!context || !context.role) return false;

  const roleRules = ROLE_PERMISSIONS[context.role];
  if (!roleRules) return false;

  const allowedActions = roleRules[resource];
  if (!allowedActions) return false;

  // Đối với contributor, chỉ được sửa bài do chính mình tạo (isOwner = true)
  if (context.role === "contributor" && resource === "article" && action === "update") {
    return !!context.isOwner;
  }

  return allowedActions.includes(action);
}

/**
 * Kiểm tra xem việc chuyển đổi trạng thái revision có hợp lệ không
 */
export function canTransition(
  currentState: RevisionState,
  nextState: RevisionState,
  role: string,
): boolean {
  const allowedNext = VALID_STATE_TRANSITIONS[currentState];
  if (!allowedNext || !allowedNext.includes(nextState)) {
    return false;
  }

  // Phân quyền cho transition
  if (nextState === "approved") {
    return role === "admin" || role === "reviewer" || role === "publisher";
  }
  if (nextState === "published") {
    return role === "admin" || role === "publisher";
  }

  return true;
}
