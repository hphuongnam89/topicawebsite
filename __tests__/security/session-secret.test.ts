// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
const account = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("@/lib/db", () => ({ getUserById: account.get }));
import { createSessionToken, getCurrentUser } from "@/lib/auth/session";

const user = { id: "fixture-admin", username: "fixture", name: "Fixture", role: "admin" };
afterEach(() => {
  vi.unstubAllEnvs();
  cookieStore.get.mockReset();
});

test("production without a strong configured secret cannot mint or accept a session", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("ADMIN_SESSION_SECRET", "");
  vi.stubEnv("SESSION_SECRET", "");
  expect(() => createSessionToken(user)).toThrow(/ADMIN_SESSION_SECRET/);
  cookieStore.get.mockReturnValue({ value: "fixture-untrusted-token" });
  expect(await getCurrentUser()).toBeNull();
  vi.stubEnv("ADMIN_SESSION_SECRET", "short");
  expect(() => createSessionToken(user)).toThrow(/ADMIN_SESSION_SECRET/);
});

test("production configured secret accepts its own token and rejects it after rotation", async () => {
  account.get.mockReturnValue(user);
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("ADMIN_SESSION_SECRET", "fixture-random-secret-with-at-least-32-characters");
  cookieStore.get.mockReturnValue({ value: createSessionToken(user) });
  expect(await getCurrentUser()).toEqual(user);
  vi.stubEnv("ADMIN_SESSION_SECRET", "another-fixture-secret-with-at-least-32-characters");
  expect(await getCurrentUser()).toBeNull();
});

test("a valid cookie cannot retain a revoked or deleted database role", async () => {
  account.get.mockReturnValue({ ...user, role: "editor" });
  cookieStore.get.mockReturnValue({ value: createSessionToken(user) });
  expect((await getCurrentUser())?.role).toBe("editor");
  account.get.mockReturnValue(null);
  expect(await getCurrentUser()).toBeNull();
});
