import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { programs } from "@/data/programs";

describe("homepage program images", () => {
  test("uses present local assets for every program", () => {
    for (const program of programs) {
      expect(program.image).toMatch(/^\/images\/programs\/[a-z0-9-]+\.jpg$/);

      const assetPath = path.join(process.cwd(), "public", program.image);
      expect(existsSync(assetPath)).toBe(true);
      expect(statSync(assetPath).size).toBeGreaterThan(0);
    }
  });
});
