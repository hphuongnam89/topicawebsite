import { beforeEach, afterEach, describe, test, expect, vi } from "vitest";
import { getAnalyticsStats, getDb } from "@/lib/db";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";
import {
  createDraftRevision,
  transitionRevision,
  getRevisionById,
  getPublishedRevision,
  getReviewQueueCount,
} from "@/lib/services/revisions";
import {
  getAuditLogs,
  getCmsOperationsHealth,
  getPublicProgramById,
} from "@/lib/services/cms-models";
import { createPreviewToken, verifyPreviewToken } from "@/lib/auth/preview";
const actor = vi.hoisted(() => ({
  user: { id: "editor", username: "editor", name: "Fixture Editor", role: "editor" },
}));
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(async () => actor.user),
  getSessionSecret: () => "fixture-preview-secret-at-least-32-characters",
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { PATCH } from "@/app/api/admin/revisions/[id]/route";
import { GET, POST } from "@/app/api/admin/revisions/route";
function draft(name = "Fixture changed") {
  return createDraftRevision({
    entityType: "program",
    entityId: "ba",
    title: name,
    payload: { name },
    actorId: "editor",
    actorName: "Ignored spoofed name",
  });
}
describe("Revision authorization, atomicity and time", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-12T11:00:00.000Z"));
    const db = getDb();
    db.exec(
      "DELETE FROM content_revisions;DELETE FROM audit_logs;DELETE FROM users;DELETE FROM programs;DELETE FROM organizations;DELETE FROM tuition_policies;DELETE FROM admission_rounds;DELETE FROM scholarships;DELETE FROM documents;",
    );
    cmsDomainFixture.up(db);
    for (const role of ["editor", "admin"])
      db.prepare(
        "INSERT INTO users(id,username,name,role,password_hash,created_at)VALUES(?,?,?,?,?,?)",
      ).run(role, role, `Fixture ${role}`, role, "fixture-only", new Date().toISOString());
    actor.user = { id: "editor", username: "editor", name: "Fixture Editor", role: "editor" };
  });
  afterEach(() => {
    getDb().exec("DROP TRIGGER IF EXISTS fail_audit;");
    vi.useRealTimers();
  });
  test("direct editor API cannot approve/publish; admin cannot skip review", async () => {
    const row = draft();
    expect(() => transitionRevision(row.id, "approve", "admin")).toThrow();
    transitionRevision(row.id, "submit_review", "editor");
    const current = getRevisionById(row.id)!;
    for (const action of ["approve", "publish"]) {
      const response = await PATCH(
        new Request(`http://localhost/api/admin/revisions/${row.id}`, {
          method: "PATCH",
          headers: { origin: "http://localhost", "Content-Type": "application/json" },
          body: JSON.stringify({ action, expectedUpdatedAt: current.updated_at }),
        }),
        { params: Promise.resolve({ id: String(row.id) }) },
      );
      expect(response.status).toBe(403);
    }
    expect(() => transitionRevision(row.id, "publish", "admin")).toThrow();
    expect(getPublicProgramById("ba")?.name).toBe("Quản trị kinh doanh");
  });
  test("review queue count and audit date filters reflect fixture workflow events", () => {
    expect(getReviewQueueCount()).toBe(0);
    const row = draft();
    expect(getReviewQueueCount()).toBe(0);
    transitionRevision(row.id, "submit_review", "editor");
    expect(getReviewQueueCount()).toBe(1);
    transitionRevision(row.id, "approve", "admin");
    expect(getReviewQueueCount()).toBe(0);

    const sameDay = getAuditLogs({
      entityType: "program",
      startDate: "2026-10-12T00:00:00.000Z",
      endDate: "2026-10-13T00:00:00.000Z",
    });
    const wrongType = getAuditLogs({ entityType: "article" });
    expect(sameDay).toHaveLength(3);
    expect(wrongType).toHaveLength(0);
  });
  test("dashboard analytics period narrows real page-view rows on the isolated fixture", () => {
    const db = getDb();
    db.prepare("INSERT INTO page_views(path,date,views) VALUES(?,?,?)").run(
      "/today",
      "2026-10-12",
      2,
    );
    db.prepare("INSERT INTO page_views(path,date,views) VALUES(?,?,?)").run(
      "/month",
      "2026-09-22",
      3,
    );
    db.prepare("INSERT INTO page_views(path,date,views) VALUES(?,?,?)").run(
      "/old",
      "2026-07-01",
      5,
    );

    expect(getAnalyticsStats(7).totalViews).toBe(2);
    expect(getAnalyticsStats(30).totalViews).toBe(5);
  });
  test("future publication uses [start,end), leaves previous public until start and never revives it after expiry", () => {
    const row = draft();
    transitionRevision(row.id, "submit_review", "editor");
    transitionRevision(row.id, "approve", "admin");
    const start = "2026-10-12T11:01:00.000Z",
      end = "2026-10-12T11:02:00.000Z";
    transitionRevision(row.id, "publish", "admin", { publishAt: start, expireAt: end });
    expect(getPublicProgramById("ba")?.name).toBe("Quản trị kinh doanh");
    vi.setSystemTime(new Date(start));
    expect(getPublicProgramById("ba")?.name).toBe("Fixture changed");
    vi.setSystemTime(new Date(end));
    expect(getPublishedRevision("program", "ba")).toBeNull();
    expect(getPublicProgramById("ba")).toBeNull();
  });
  test("two tabs cannot silently save over a newer revision", () => {
    const row = draft();
    createDraftRevision({
      entityType: "program",
      entityId: "ba",
      title: "Tab one",
      payload: { name: "Tab one" },
      actorId: "editor",
      actorName: "Editor",
      baseRevisionId: row.id,
    });
    expect(() =>
      createDraftRevision({
        entityType: "program",
        entityId: "ba",
        title: "Tab two",
        payload: { name: "Tab two" },
        actorId: "editor",
        actorName: "Editor",
        baseRevisionId: row.id,
      }),
    ).toThrow(/phiên khác/);
  });
  test("audit failure rolls back workflow state", () => {
    const row = draft();
    getDb().exec(
      "CREATE TRIGGER fail_audit BEFORE INSERT ON audit_logs BEGIN SELECT RAISE(ABORT,'fixture audit failure');END;",
    );
    expect(() => transitionRevision(row.id, "submit_review", "editor")).toThrow(/fixture audit/);
    expect(getRevisionById(row.id)?.workflow_state).toBe("draft");
  });
  test("stale transition and revoked role are rejected", () => {
    const row = draft();
    const updated = transitionRevision(row.id, "submit_review", "editor");
    expect(updated.updated_at).not.toBe(row.updated_at);
    expect(() =>
      transitionRevision(row.id, "approve", "admin", { expectedUpdatedAt: row.updated_at }),
    ).toThrow(/thay đổi/);
    getDb().prepare("UPDATE users SET role='editor' WHERE id='admin'").run();
    expect(() => transitionRevision(row.id, "approve", "admin")).toThrow(/Forbidden/);
  });
  test("preview token binds actor, revision content and five minute expiry", () => {
    const row = draft();
    const token = createPreviewToken("editor", row.id, row.updated_at);
    expect(verifyPreviewToken(token, "editor", row.id, row.updated_at)).toBe(true);
    expect(verifyPreviewToken(token, "admin", row.id, row.updated_at)).toBe(false);
    expect(verifyPreviewToken(token, "editor", row.id, "changed")).toBe(false);
    vi.advanceTimersByTime(300000);
    expect(verifyPreviewToken(token, "editor", row.id, row.updated_at)).toBe(false);
  });
  test("cross origin draft write cannot mutate database", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/revisions", {
        method: "POST",
        headers: { origin: "https://outside.invalid", "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "program",
          entityId: "ba",
          title: "Injected",
          payload: { name: "Injected" },
          baseRevisionId: 0,
        }),
      }),
    );
    expect(response.status).toBe(403);
  });
  test("revision list filters literally and returns bounded pagination metadata", async () => {
    draft("Scholarship 100% award");
    draft("Scholarship award");

    const response = await GET(
      new Request(
        "http://localhost/api/admin/revisions?entityType=program&search=%25&page=1&limit=10",
      ),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.revisions).toHaveLength(1);
    expect(body.revisions[0].title).toBe("Scholarship 100% award");
    expect(body).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });
  test("CMS health surfaces missing sources and near deadlines on currently published revisions", () => {
    const db = getDb();
    db.prepare("UPDATE programs SET source='' WHERE id='ba'").run();
    const publishedAt = "2026-10-01T00:00:00.000Z";
    const insert = db.prepare(
      `INSERT INTO content_revisions(
        entity_type,entity_id,version,title,payload,workflow_state,created_by,
        published_at,expired_at,created_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
    );
    insert.run(
      "admission_round",
      "health-round",
      1,
      "Kỳ xét tuyển sắp đến hạn",
      JSON.stringify({ deadline_at: "2026-10-15T00:00:00.000Z" }),
      "published",
      "admin",
      publishedAt,
      null,
      publishedAt,
      publishedAt,
    );
    insert.run(
      "scholarship",
      "health-archived",
      1,
      "Học bổng đã lưu trữ",
      JSON.stringify({ deadline_at: "2026-10-15T00:00:00.000Z" }),
      "archived",
      "admin",
      publishedAt,
      null,
      publishedAt,
      publishedAt,
    );

    const health = getCmsOperationsHealth(new Date("2026-10-12T11:00:00.000Z"));
    expect(health.sourceGaps.find((item) => item.entityType === "program")?.count).toBe(1);
    expect(health.expiringItems).toContainEqual(
      expect.objectContaining({ entityId: "health-round", title: "Kỳ xét tuyển sắp đến hạn" }),
    );
    expect(health.expiringItems.some((item) => item.entityId === "health-archived")).toBe(false);
    insert.run(
      "admission_round",
      "health-past",
      1,
      "Kỳ đã quá hạn",
      JSON.stringify({ deadline_at: "2026-10-01T00:00:00.000Z" }),
      "published",
      "admin",
      publishedAt,
      null,
      publishedAt,
      publishedAt,
    );
    const refreshed = getCmsOperationsHealth(new Date("2026-10-12T11:00:00.000Z"));
    expect(refreshed.expiringItems.some((item) => item.entityId === "health-past")).toBe(false);
  });

  test("CMS health identifies documents with missing file links", () => {
    const db = getDb();
    db.prepare(
      `INSERT INTO documents(
        id,title,type,file_url,view_url,mime_type,byte_size,checksum_sha256,published_date,
        version,source,rights,access,created_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      "health-document",
      "Tài liệu thiếu tệp",
      "other",
      "",
      "",
      "application/pdf",
      0,
      "a".repeat(64),
      "2026-01-01",
      "1.0",
      "Fixture source",
      "Fixture rights",
      "public",
      new Date().toISOString(),
      new Date().toISOString(),
    );

    const health = getCmsOperationsHealth();
    expect(health.missingDocumentFiles).toBe(1);
    expect(health.missingDocumentItems).toContainEqual({
      id: "health-document",
      title: "Tài liệu thiếu tệp",
    });
  });
});
