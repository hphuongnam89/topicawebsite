import fs from "node:fs";

describe("release provenance", () => {
  test("every official asset has source, license/consent, owner and approval", () => {
    const manifest = JSON.parse(
      fs.readFileSync("public/official-assets/manifest.json", "utf8"),
    ) as { owner?: string; assets?: Array<Record<string, unknown>> };
    expect(manifest.owner).toEqual(expect.any(String));
    expect(manifest.assets?.length).toBeGreaterThan(0);
    for (const asset of manifest.assets ?? []) {
      expect(asset.path).toEqual(expect.any(String));
      expect(asset.sourceUrl).toEqual(expect.stringMatching(/^https?:\/\//));
      expect(asset.licenseOrConsent).toEqual(expect.any(String));
      expect(asset.capturedAt).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      expect(asset.approvalStatus).toBe("approved");
    }
  });
});
