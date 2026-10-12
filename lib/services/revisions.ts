import "server-only";
import { getDb, getUserById } from "@/lib/db";
import type { ContentRevisionRecord } from "@/lib/db/types";
import { contentRevisionSchema } from "@/lib/validation/cms-schemas";
import {
  programSchema,
  organizationSchema,
  admissionRoundSchema,
  tuitionPolicySchema,
  scholarshipSchema,
  documentSchema,
} from "@/lib/validation/cms-schemas";
import { entityTables } from "./content-entities";
import { articleCreateSchema } from "@/lib/validation/admin";

export class WorkflowError extends Error {
  constructor(
    message: string,
    public status = 422,
  ) {
    super(message);
  }
}
export interface CreateDraftRevisionInput {
  entityType: ContentRevisionRecord["entity_type"];
  entityId: string;
  title: string;
  payload: Record<string, unknown> | string;
  reviewerNotes?: string;
  actorId: string;
  actorName: string;
  baseRevisionId?: number;
}
function actor(id: string, admin = false) {
  const user = getUserById(id);
  if (!user || !["admin", "editor"].includes(user.role))
    throw new WorkflowError("Unauthorized", 401);
  if (admin && user.role !== "admin") throw new WorkflowError("Forbidden", 403);
  return user;
}
function transaction<T>(action: () => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const value = action();
    db.exec("COMMIT");
    return value;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function audit(id: string, action: string, revision: ContentRevisionRecord, reason: string) {
  const user = actor(id);
  getDb()
    .prepare(
      `INSERT INTO audit_logs(actor_id,actor_name,action,entity_type,entity_id,revision_id,timestamp,changed_fields,reason)
    VALUES(?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      id,
      user.name,
      action,
      revision.entity_type,
      revision.entity_id,
      revision.id,
      new Date().toISOString(),
      JSON.stringify(["workflow_state", "payload"]),
      reason,
    );
}
export function getRevisionById(id: number): ContentRevisionRecord | null {
  return (
    (getDb().prepare("SELECT * FROM content_revisions WHERE id=?").get(id) as
      ContentRevisionRecord | undefined) ?? null
  );
}
export function getRevisions(type: string, id: string): ContentRevisionRecord[] {
  return getDb()
    .prepare(
      "SELECT * FROM content_revisions WHERE entity_type=? AND entity_id=? ORDER BY version DESC",
    )
    .all(type, id) as unknown as ContentRevisionRecord[];
}
export function getPublishedRevision(
  type: string,
  id: string,
  at = new Date(),
): ContentRevisionRecord | null {
  // Pick the latest effective publication first, then apply expiry/archive. Never revive an older policy.
  const row = getDb()
    .prepare(
      `SELECT * FROM content_revisions WHERE entity_type=? AND entity_id=?
    AND workflow_state IN ('published','archived') AND published_at IS NOT NULL AND published_at<=?
    ORDER BY published_at DESC,version DESC LIMIT 1`,
    )
    .get(type, id, at.toISOString()) as ContentRevisionRecord | undefined;
  if (
    !row ||
    row.workflow_state !== "published" ||
    (row.expired_at && row.expired_at <= at.toISOString())
  )
    return null;
  return row;
}
export function createDraftRevision(input: CreateDraftRevisionInput): ContentRevisionRecord {
  actor(input.actorId);
  if (!Object.hasOwn(entityTables, input.entityType))
    throw new WorkflowError("Loại nội dung không hợp lệ");
  return transaction(() => {
    const latest = getRevisions(input.entityType, input.entityId)[0];
    if (input.baseRevisionId !== undefined && (latest?.id ?? 0) !== input.baseRevisionId)
      throw new WorkflowError("Nội dung đã được sửa ở phiên khác. Tải lại trước khi lưu.", 409);
    const now = new Date().toISOString();
    const value = typeof input.payload === "string" ? JSON.parse(input.payload) : input.payload;
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new WorkflowError("Payload phải là object");
    const base =
      getDb()
        .prepare(`SELECT * FROM ${entityTables[input.entityType]} WHERE id=?`)
        .get(input.entityId) ?? {};
    const published = getPublishedRevision(input.entityType, input.entityId);
    const payload = JSON.stringify({
      ...base,
      ...(published ? JSON.parse(published.payload) : {}),
      ...value,
      id: input.entityId,
    });
    const parsed = contentRevisionSchema.parse({
      entity_type: input.entityType,
      entity_id: input.entityId,
      version: (latest?.version ?? 0) + 1,
      title: input.title,
      payload,
      workflow_state: "draft",
      created_by: input.actorId,
    });
    const result = getDb()
      .prepare(
        `INSERT INTO content_revisions(entity_type,entity_id,version,title,payload,workflow_state,created_by,created_at,updated_at) VALUES(?,?,?,?,?,'draft',?,?,?)`,
      )
      .run(
        parsed.entity_type,
        parsed.entity_id,
        parsed.version,
        parsed.title,
        parsed.payload,
        input.actorId,
        now,
        now,
      );
    const revision = getRevisionById(Number(result.lastInsertRowid))!;
    audit(input.actorId, "create", revision, "Tạo bản nháp mới; bản public giữ nguyên");
    return revision;
  });
}
type Action = "submit_review" | "approve" | "reject" | "publish" | "archive";
export interface TransitionOptions {
  expectedUpdatedAt?: string;
  publishAt?: string;
  expireAt?: string | null;
  highlightUntil?: string | null;
  reason?: string;
}
export function transitionRevision(
  id: number,
  action: Action,
  actorId: string,
  options: TransitionOptions = {},
): ContentRevisionRecord {
  actor(actorId, action !== "submit_review");
  return transaction(() => {
    const revision = getRevisionById(id);
    if (!revision) throw new WorkflowError("Revision không tồn tại", 404);
    if (options.expectedUpdatedAt && revision.updated_at !== options.expectedUpdatedAt)
      throw new WorkflowError("Revision đã thay đổi. Tải lại trước khi tiếp tục.", 409);
    const allowed: Record<Action, string[]> = {
      submit_review: ["draft"],
      approve: ["in_review"],
      reject: ["in_review"],
      publish: ["approved"],
      archive: ["published"],
    };
    if (!allowed[action].includes(revision.workflow_state))
      throw new WorkflowError("Chuyển trạng thái không hợp lệ");
    const now = new Date(Math.max(Date.now(), Date.parse(revision.updated_at) + 1)).toISOString();
    const state = {
      submit_review: "in_review",
      approve: "approved",
      reject: "draft",
      publish: "published",
      archive: "archived",
    }[action];
    if (action === "reject" && !options.reason?.trim())
      throw new WorkflowError("Cần lý do từ chối");
    let published = revision.published_at,
      expired = revision.expired_at,
      highlight = revision.highlight_until;
    if (action === "publish") {
      if (!revision.approved_by) throw new WorkflowError("Revision chưa được phê duyệt");
      const payload = JSON.parse(revision.payload);
      const base =
        getDb()
          .prepare(`SELECT * FROM ${entityTables[revision.entity_type]} WHERE id=?`)
          .get(revision.entity_id) ?? {};
      const candidate = { ...base, ...payload, id: revision.entity_id };
      for (const key of [
        "locations",
        "service_urls",
        "aliases",
        "duration_credits",
        "program_ids",
        "documents",
        "other_fees",
        "assumptions",
      ]) {
        if (typeof candidate[key] === "string") {
          try {
            candidate[key] = JSON.parse(candidate[key]);
          } catch {
            throw new WorkflowError(`Trường ${key} phải chứa JSON hợp lệ`);
          }
        }
      }
      const schemas = {
        program: programSchema,
        organization: organizationSchema,
        admission_round: admissionRoundSchema,
        tuition_policy: tuitionPolicySchema,
        scholarship: scholarshipSchema,
        document: documentSchema,
      };
      if (revision.entity_type in schemas) {
        const schema = schemas[revision.entity_type as keyof typeof schemas];
        const parsed = schema.safeParse(candidate);
        if (!parsed.success)
          throw new WorkflowError(parsed.error.issues[0]?.message ?? "Nội dung không hợp lệ");
      } else {
        if (typeof candidate.is_featured === "number")
          candidate.is_featured = Boolean(candidate.is_featured);
        const fields = Object.fromEntries(
          Object.entries(candidate).filter(([key]) => key in articleCreateSchema.shape),
        );
        if (!articleCreateSchema.safeParse(fields).success)
          throw new WorkflowError("Nội dung trang/bài viết không hợp lệ");
      }
      if (candidate.slug) {
        const collision = getDb()
          .prepare(
            `SELECT id FROM ${entityTables[revision.entity_type]} WHERE slug=? AND CAST(id AS TEXT)<>?`,
          )
          .get(candidate.slug, revision.entity_id);
        const other = getDb()
          .prepare(
            "SELECT payload FROM content_revisions WHERE entity_type=? AND entity_id<>? AND published_at IS NOT NULL",
          )
          .all(revision.entity_type, revision.entity_id) as { payload: string }[];
        if (collision || other.some((row) => JSON.parse(row.payload).slug === candidate.slug))
          throw new WorkflowError("Đường dẫn đã thuộc nội dung khác", 409);
      }
      published = options.publishAt ?? new Date().toISOString();
      expired = options.expireAt ?? null;
      highlight = options.highlightUntil ?? null;
      for (const date of [published, expired, highlight])
        if (date && (!date.endsWith("Z") || !Number.isFinite(Date.parse(date))))
          throw new WorkflowError("Thời gian phải là UTC ISO");
      published = new Date(published).toISOString();
      expired = expired ? new Date(expired).toISOString() : null;
      highlight = highlight ? new Date(highlight).toISOString() : null;
      if (expired && expired <= published) throw new WorkflowError("Hết hạn phải sau công bố");
      if (highlight && (highlight <= published || (expired && highlight > expired)))
        throw new WorkflowError("Khoảng ưu tiên không hợp lệ");
      if (published <= new Date().toISOString())
        getDb()
          .prepare(
            `UPDATE content_revisions SET workflow_state='archived',updated_at=? WHERE entity_type=? AND entity_id=? AND workflow_state='published' AND published_at<=? AND id<>?`,
          )
          .run(now, revision.entity_type, revision.entity_id, published, id);
    }
    getDb()
      .prepare(
        `UPDATE content_revisions SET workflow_state=?, approved_by=?,reviewer_notes=?,published_at=?,expired_at=?,highlight_until=?,updated_at=? WHERE id=?`,
      )
      .run(
        state,
        action === "approve" ? actorId : action === "reject" ? null : revision.approved_by,
        options.reason ?? revision.reviewer_notes,
        published,
        expired,
        highlight,
        now,
        id,
      );
    const result = getRevisionById(id)!;
    audit(actorId, action, result, options.reason ?? action);
    return result;
  });
}
export const submitRevisionForReview = (id: number, actorId: string, _actorName: string) =>
  transitionRevision(id, "submit_review", actorId);
export const approveRevision = (id: number, actorId: string, _actorName: string, notes?: string) =>
  transitionRevision(id, "approve", actorId, { reason: notes });
export const publishRevision = (id: number, actorId: string, _actorName: string) =>
  transitionRevision(id, "publish", actorId);
export const rejectRevision = (id: number, actorId: string, _actorName: string, reason: string) =>
  transitionRevision(id, "reject", actorId, { reason });
