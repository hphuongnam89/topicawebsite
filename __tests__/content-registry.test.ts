import {
  claimRegistryMeta,
  contentSourceOfTruth,
  getPublicClaim,
  isPublicClaimApproved,
} from "@/CONTENT_SOURCE_OF_TRUTH";

describe("public content registry", () => {
  test("every claim has owner, evidence version, effective dates and approval state", () => {
    for (const claim of contentSourceOfTruth) {
      const meta = claimRegistryMeta[claim.id];
      expect(meta).toMatchObject({
        owner: expect.any(String),
        evidenceVersion: expect.any(String),
        effectiveFrom: expect.any(String),
        approvalStatus: expect.any(String),
      });
    }
  });

  test("blocked claims never become public", () => {
    const blocked = contentSourceOfTruth.find((claim) => !claim.approvedForPublic)!;
    expect(getPublicClaim(blocked.id)).toBeNull();
    expect(isPublicClaimApproved(blocked.id)).toBe(false);
  });
});
