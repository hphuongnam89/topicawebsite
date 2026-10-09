import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock NEXT cookies and API error
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn(),
  };
});
vi.mock("@/lib/http/response", () => {
  return {
    apiError: (message: string, status: number, code: string) => ({ message, status, code }),
  };
});

// Mock Session (we mock the session.ts functions directly to avoid mocking crypto & cookies deeper)
vi.mock("@/lib/auth/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/session")>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
  };
});

import { requireUser, requireAdmin, requireRole, requirePermission } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("requireUser returns unauthorized if no user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await requireUser();
    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect((result.response as any).status).toBe(401);
    }
  });

  test("requireUser returns user if logged in", async () => {
    const mockUser = { id: "1", username: "admin", name: "Admin", role: "admin" as const };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
    const result = await requireUser();
    expect("user" in result).toBe(true);
    if ("user" in result) {
      expect(result.user).toEqual(mockUser);
    }
  });

  test("requireAdmin returns forbidden for non-admin", async () => {
    const mockUser = { id: "1", username: "editor", name: "Editor", role: "editor" as const };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
    const result = await requireAdmin();
    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect((result.response as any).status).toBe(403);
    }
  });

  test("requireRole allows specified roles", async () => {
    const mockUser = { id: "1", username: "editor", name: "Editor", role: "editor" as const };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
    const result = await requireRole(["editor", "admin"]);
    expect("user" in result).toBe(true);
  });

  test("requirePermission allows authorized action", async () => {
    const mockUser = { id: "1", username: "editor", name: "Editor", role: "editor" as const };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);

    // editor can create article according to policy
    const result = await requirePermission("article", "create");
    expect("user" in result).toBe(true);
  });

  test("requirePermission denies unauthorized action", async () => {
    const mockUser = { id: "1", username: "editor", name: "Editor", role: "editor" as const };
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);

    // editor cannot publish article
    const result = await requirePermission("article", "publish");
    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect((result.response as any).status).toBe(403);
    }
  });
});
