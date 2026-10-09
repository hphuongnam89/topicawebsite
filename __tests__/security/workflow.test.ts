import { describe, test, expect, vi, beforeEach } from "vitest";
import { workflowService } from "@/lib/workflow/transition";
import { canTransition } from "@/lib/auth/policy";
import { getDb } from "@/lib/db/connection";

vi.mock("server-only", () => ({}));

// Mock Database
vi.mock("@/lib/db/connection", () => {
  const queryMock = vi.fn();
  return {
    getDb: () => ({
      query: queryMock,
    }),
    transaction: async (fn: () => Promise<unknown>) => fn(),
    __queryMock: queryMock,
  };
});

// Mock Session User
const mockAdmin = { id: "1", username: "admin", name: "Admin", role: "admin" as const };
const mockContributor = {
  id: "2",
  username: "contributor",
  name: "Cont",
  role: "contributor" as const,
};

const db = getDb();
const queryMock = (db as any).query;

describe("Workflow State Machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getRevisionState returns draft when no events exist", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const state = await workflowService.getRevisionState("rev-1");
    expect(state).toBe("draft");
  });

  test("getRevisionState returns the latest state", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ action: "in_review" }] });
    const state = await workflowService.getRevisionState("rev-1");
    expect(state).toBe("in_review");
  });

  test("transition throws error if role forbidden", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] }); // current state: draft

    // Contributor tries to publish (draft -> published)
    await expect(
      workflowService.transition("content-1", "rev-1", mockContributor, "published"),
    ).rejects.toThrow(/Forbidden: Role contributor cannot transition from draft to published/);
  });

  test("transition updates state if role allowed (admin publish)", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ action: "approved" }] }); // current state: approved
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "rev-1" }] }); // revision check pass
    queryMock.mockResolvedValueOnce({}); // insert event
    queryMock.mockResolvedValueOnce({}); // update content items

    // Admin tries to publish (approved -> published)
    const result = await workflowService.transition("content-1", "rev-1", mockAdmin, "published");
    expect(result).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(4);

    // check if it updated published_revision_id
    expect(queryMock).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining("UPDATE content_items SET published_revision_id = $1"),
      ["rev-1", "content-1"],
    );
  });
});
