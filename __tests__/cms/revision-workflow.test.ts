import { beforeEach, afterEach, describe, test, expect, vi } from "vitest";
import { getDb } from "@/lib/db";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";
import {
  createDraftRevision,
  transitionRevision,
  getRevisionById,
  getPublishedRevision,
} from "@/lib/services/revisions";
import { getPublicProgramById } from "@/lib/services/cms-models";
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
import { POST } from "@/app/api/admin/revisions/route";
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
});
