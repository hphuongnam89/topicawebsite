import { expect, test } from "vitest";
import { getEditableFieldValue } from "@/components/admin/content-fields";

test("document access defaults to public when the select has not emitted a change", () => {
  expect(getEditableFieldValue("access", {})).toBe("public");
  expect(getEditableFieldValue("access", { access: "private" })).toBe("private");
});

test("nullable fields never return literal string 'null' or undefined", () => {
  expect(getEditableFieldValue("excerpt", { excerpt: "null" })).toBe("");
  expect(getEditableFieldValue("source", { source: "null" })).toBe("");
  expect(getEditableFieldValue("notes", { notes: null as any })).toBe("");
  expect(getEditableFieldValue("notes", {})).toBe("");
  expect(getEditableFieldValue("access", { access: "null" })).toBe("public");
});
