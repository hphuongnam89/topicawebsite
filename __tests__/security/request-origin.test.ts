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

test("accepts matching origin behind reverse proxy terminating HTTPS", () => {
  expect(
    isSameOrigin(
      new Request("http://0.0.0.0:3000/api/admin/users", {
        headers: {
          Origin: "https://topica-edu-demo-production.up.railway.app",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "topica-edu-demo-production.up.railway.app",
        },
      }),
    ),
  ).toBe(true);

  expect(
    isSameOrigin(
      new Request("http://topica-edu-demo-production.up.railway.app/api/admin/users", {
        headers: {
          Origin: "https://topica-edu-demo-production.up.railway.app",
        },
      }),
    ),
  ).toBe(true);

  expect(
    isSameOrigin(
      new Request("http://0.0.0.0:3000/api/admin/users", {
        headers: {
          Origin: "https://evil-attacker.com",
          "x-forwarded-proto": "https",
          "x-forwarded-host": "topica-edu-demo-production.up.railway.app",
        },
      }),
    ),
  ).toBe(false);
});
