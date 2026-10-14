import { expect, test } from "vitest";
import { isSameOrigin } from "@/lib/security/request";

test("accepts equivalent loopback hostnames used by local QA browser/server", () => {
  expect(
    isSameOrigin(new Request("http://127.0.0.1:3114/api", { headers: { Origin: "http://localhost:3114" } })),
  ).toBe(true);
});

test("does not broaden origin checks to another host or port", () => {
  expect(
    isSameOrigin(new Request("http://127.0.0.1:3114/api", { headers: { Origin: "http://evil.test:3114" } })),
  ).toBe(false);
  expect(
    isSameOrigin(new Request("http://127.0.0.1:3114/api", { headers: { Origin: "http://localhost:3115" } })),
  ).toBe(false);
});
