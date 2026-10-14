import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "@/lib/db";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";
import { getAdminPrograms } from "@/lib/services/admin-content";

describe("Admin Programs Service", () => {
  beforeEach(() => {
    const db = getDb();
    cmsDomainFixture.up(db);
  });

  it("returns all base and revision programs with structured statistics", () => {
    const list = getAdminPrograms();
    expect(list.length).toBeGreaterThanOrEqual(5);

    const ids = list.map((p) => p.id);
    expect(ids).toContain("it");
    expect(ids).toContain("ba");
    expect(ids).toContain("tourism");
    expect(ids).toContain("english");
    expect(ids).toContain("chinese");

    const itProgram = list.find((p) => p.id === "it");
    expect(itProgram).toBeDefined();
    expect(itProgram?.name).toContain("Công nghệ thông tin");
    expect(itProgram?.code).toBe("7480201");
    expect(itProgram?.group_id).toBe("technology");
    expect(itProgram?.status).toBe("published");
    expect(itProgram?.credits).toBeGreaterThan(0);
    expect(itProgram?.semesters).toBeGreaterThan(0);
  });

  it("filters programs by search keyword and group", () => {
    const techOnly = getAdminPrograms({ group: "technology" });
    expect(techOnly.length).toBeGreaterThanOrEqual(1);
    expect(techOnly.every((p) => p.group_id === "technology")).toBe(true);

    const itOnly = getAdminPrograms({ search: "7480201" });
    expect(itOnly.length).toBe(1);
    expect(itOnly[0].id).toBe("it");
  });

  it("keeps missing or malformed academic facts empty instead of inventing defaults", () => {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO content_revisions (
        entity_type, entity_id, version, title, payload, workflow_state, created_by, created_at, updated_at
      ) VALUES ('program', 'it', 99, 'Test payload thiếu facts', ?, 'draft', 'test', ?, ?)`,
    ).run(JSON.stringify({ duration_credits: "broken JSON" }), now, now);

    const program = getAdminPrograms().find((item) => item.id === "it");
    expect(program).toMatchObject({
      degree_name: null,
      awarding_institution: null,
      credits: null,
      semesters: null,
    });
  });
});
