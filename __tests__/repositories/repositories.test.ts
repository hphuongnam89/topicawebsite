import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock the database connection module
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

// Import repositories after mock
import { leadRepository } from "@/lib/repositories/lead.repository";
import { userRepository } from "@/lib/repositories/user.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { contentRepository } from "@/lib/repositories/content.repository";
import * as dbModule from "@/lib/db/connection";

const queryMock = (dbModule as unknown as { __queryMock: ReturnType<typeof vi.fn> }).__queryMock;

describe("Repositories Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LeadRepository", () => {
    it("should insert and return a new lead", async () => {
      const mockLead = {
        id: "lead-123",
        full_name: "Nguyen Van A",
        phone: "0901234567",
        status: "new",
        ip_hash: "hash123",
      };

      queryMock.mockResolvedValueOnce({ rows: [mockLead], rowCount: 1 });

      const result = await leadRepository.create({
        full_name: "Nguyen Van A",
        phone: "0901234567",
        ip_hash: "hash123",
      });

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLead);
    });

    it("should query leads list with filters", async () => {
      queryMock
        .mockResolvedValueOnce({ rows: [{ count: 1 }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ id: "lead-1", status: "new" }], rowCount: 1 });

      const result = await leadRepository.list({ status: "new", limit: 10, offset: 0 });

      expect(result.total).toBe(1);
      expect(result.leads).toHaveLength(1);
    });
  });

  describe("UserRepository", () => {
    it("should find user by username", async () => {
      const mockUser = {
        id: "usr-1",
        username: "admin",
        name: "Admin User",
        role: "admin",
      };

      queryMock.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const user = await userRepository.findByUsername("admin");
      expect(user).toEqual(mockUser);
    });

    it("should increment session version on logout/revoke", async () => {
      queryMock.mockResolvedValueOnce({ rows: [{ session_version: 2 }], rowCount: 1 });

      const version = await userRepository.incrementSessionVersion("usr-1");
      expect(version).toBe(2);
    });
  });

  describe("CategoryRepository", () => {
    it("should create category with slug", async () => {
      const mockCat = {
        id: "cat-1",
        name: "Công nghệ thông tin",
        slug: "cong-nghe-thong-tin",
        parent_id: null,
      };

      queryMock.mockResolvedValueOnce({ rows: [mockCat], rowCount: 1 });

      const cat = await categoryRepository.create({
        name: "Công nghệ thông tin",
        slug: "cong-nghe-thong-tin",
      });

      expect(cat.slug).toBe("cong-nghe-thong-tin");
    });
  });

  describe("ContentRepository", () => {
    it("should create content item and initial revision in a transaction", async () => {
      const mockItem = { id: "item-1", kind: "article", locale: "vi", title: "Test Article" };
      const mockRev = { id: "rev-1", content_id: "item-1", revision_no: 1, title: "Test Article" };

      queryMock
        .mockResolvedValueOnce({ rows: [mockItem], rowCount: 1 }) // insert content_item
        .mockResolvedValueOnce({ rows: [mockRev], rowCount: 1 }) // insert revision
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // update draft_revision_id

      const result = await contentRepository.create({
        kind: "article",
        title: "Test Article",
      });

      expect(result.item.id).toBe("item-1");
      expect(result.revision.revision_no).toBe(1);
    });
  });
});

describe("ContentRepository Optimistic Locking", () => {
  it("should reject createRevision if expectedRevisionNo does not match current max_no", async () => {
    // Mock db returns max_no = 5
    queryMock.mockResolvedValueOnce({ rows: [{ max_no: 5 }] });

    await expect(
      contentRepository.createRevision("content-1", { title: "Test" }, 4), // Expected 4, but it is 5
    ).rejects.toThrow(
      "Conflict: Content has been modified by another user. Optimistic lock failed.",
    );
  });

  it("should accept createRevision if expectedRevisionNo matches current max_no", async () => {
    // max_no = 5
    queryMock.mockResolvedValueOnce({ rows: [{ max_no: 5 }] });
    // Insert revision
    queryMock.mockResolvedValueOnce({ rows: [{ id: "rev-2", revision_no: 6 }] });
    // Update draft
    queryMock.mockResolvedValueOnce({});

    const rev = await contentRepository.createRevision("content-1", { title: "Test" }, 5);
    expect(rev.revision_no).toBe(6);
  });
});
