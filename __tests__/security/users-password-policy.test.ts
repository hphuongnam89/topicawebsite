import { beforeEach, expect, test, vi } from "vitest";

const boundary = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  existing: vi.fn(() => null),
}));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: async () => ({ user: { id: "admin", name: "Admin", role: "admin" } }),
}));
vi.mock("@/lib/db", () => ({
  getUsers: vi.fn(),
  createUser: boundary.create,
  deleteUser: vi.fn(),
  getUserByUsername: boundary.existing,
  updateUser: boundary.update,
}));
vi.mock("@/lib/auth/password", () => ({ hashPassword: () => "hash", MIN_PASSWORD_LENGTH: 6 }));
vi.mock("@/lib/services/admin-audit", () => ({ recordAdminAudit: vi.fn() }));
vi.mock("@/lib/security/request", () => ({ isSameOrigin: () => true }));

import { POST, PUT } from "@/app/api/admin/users/route";

beforeEach(() => {
  boundary.create.mockReset();
  boundary.update.mockReset();
  boundary.existing.mockReturnValue(null);
});

test("rejects a short password when creating a user", async () => {
  const response = await POST(
    new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { Origin: "http://localhost", "Content-Type": "application/json" },
      body: JSON.stringify({ username: "short", password: "x", name: "Short", role: "editor" }),
    }),
  );
  expect(response.status).toBe(400);
  expect(boundary.create).not.toHaveBeenCalled();
});

test("rejects a short password when editing a user", async () => {
  const response = await PUT(
    new Request("http://localhost/api/admin/users", {
      method: "PUT",
      headers: { Origin: "http://localhost", "Content-Type": "application/json" },
      body: JSON.stringify({ id: "editor", password: "x", name: "Editor", role: "editor" }),
    }),
  );
  expect(response.status).toBe(400);
  expect(boundary.update).not.toHaveBeenCalled();
});
