import { describe, expect, test, vi } from "vitest";
import { NextResponse } from "next/server";

const boundary = vi.hoisted(() => ({ role: "editor", read: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: async () =>
    boundary.role === "admin"
      ? { user: { id: "qa-admin", role: "admin" } }
      : {
          response: NextResponse.json(
            { error: "Forbidden" },
            { status: boundary.role ? 403 : 401 },
          ),
        },
}));
vi.mock("@/lib/db", () => ({ getSetting: boundary.read, setSetting: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { GET } from "@/app/api/admin/homepage/route";

describe("homepage configuration authorization", () => {
  test("rejects editor and anonymous requests before reading editorial settings", async () => {
    for (const role of ["editor", ""]) {
      boundary.role = role;
      boundary.read.mockClear();
      expect((await GET()).status).toBe(role ? 403 : 401);
      expect(boundary.read).not.toHaveBeenCalled();
    }
  });
  test("lets admin load settings without invented testimonials or forced hero form", async () => {
    boundary.role = "admin";
    boundary.read.mockImplementation((_key, fallback) => fallback);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      hero: { showLeadForm: false },
      testimonials: [],
    });
  });
});
