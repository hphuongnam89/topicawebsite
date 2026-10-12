// @vitest-environment node
import { beforeEach, afterEach, describe, expect, test } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createQaWorkspace, qaBaseEnvironment } from "@/scripts/qa-workspace";

describe("QA copies source without live storage, secrets or generated helpers", () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "topica-qa-copy-"));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
  function write(file: string, value: string) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, value);
  }
  test("copies exact source, excludes env/live data and rejects accidental reuse", () => {
    for (const file of [
      "app/page.tsx",
      "lib/value.ts",
      "public/image.svg",
      "package.json",
      "tsconfig.json",
    ])
      write(file, "fixture-source");
    for (const file of [
      ".env",
      "public/.env.private",
      "data/topica.db",
      "public/uploads/live.png",
      "public/qa-uploads/old.png",
      "next-env.d.ts",
      ".next/BUILD_ID",
    ])
      write(file, "must-not-copy");
    const destination = path.join(root, "scratch", "qa-one", "workspace");
    const snapshot = createQaWorkspace(root, destination);
    expect(snapshot.files.map((file) => file.path)).toEqual([
      "app/page.tsx",
      "lib/value.ts",
      "package.json",
      "public/image.svg",
      "tsconfig.json",
    ]);
    expect(fs.readFileSync(path.join(destination, "app/page.tsx"), "utf8")).toBe("fixture-source");
    expect(fs.existsSync(path.join(destination, "next-env.d.ts"))).toBe(false);
    expect(snapshot.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(() => createQaWorkspace(root, destination)).toThrow(/đã tồn tại/);
    write("app/page.tsx", "changed-source");
    expect(
      createQaWorkspace(root, path.join(root, "scratch", "qa-two", "workspace")).fingerprint,
    ).not.toBe(snapshot.fingerprint);
  });
  test("forbids a destination outside scratch/qa-* and strips credential/preload environment", () => {
    expect(() => createQaWorkspace(root, path.join(root, "public", "copy"))).toThrow(/scratch/);
    expect(
      qaBaseEnvironment({
        PATH: "fixture-path",
        TELEGRAM_BOT_TOKEN: "fixture-token",
        ADMIN_SESSION_SECRET: "fixture-secret",
        NODE_OPTIONS: "--require fixture",
        NEXT_PUBLIC_SITE_URL: "https://fixture.invalid",
      }),
    ).toEqual({ PATH: "fixture-path" });
  });
});
