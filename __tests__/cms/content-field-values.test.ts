import { expect, test } from "vitest";
import { getEditableFieldValue } from "@/components/admin/content-fields";

test("document access defaults to public when the select has not emitted a change", () => {
  expect(getEditableFieldValue("access", {})).toBe("public");
  expect(getEditableFieldValue("access", { access: "private" })).toBe("private");
});
