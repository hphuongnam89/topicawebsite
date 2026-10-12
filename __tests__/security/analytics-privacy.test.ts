import { test, expect } from "vitest";
import { safePublicPath } from "@/lib/analytics-path";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";

test("route labels remove search, fragments and arbitrary personal URL segments", () => {
  expect(safePublicPath("/tim-kiem?email=fixture@example.invalid#phone=0900000000")).toBe(
    "/tim-kiem",
  );
  expect(safePublicPath("/tin-tuc/fixture@example.invalid")).toBe("/tin-tuc/[slug]");
  expect(safePublicPath("/0900000000")).toBe("/[page]");
  expect(safePublicPath("https://outside.invalid/")).toBeNull();
  expect(safePublicPath("/admin/preview/1?token=secret")).toBeNull();
});
test("request size limit is enforced on the stream even without Content-Length", async () => {
  const request = new Request("http://localhost/api/public/lead", {
    method: "POST",
    body: JSON.stringify({ notes: "x".repeat(20000) }),
  });
  await expect(readBoundedJson(request)).rejects.toBeInstanceOf(BodyLimitError);
});
