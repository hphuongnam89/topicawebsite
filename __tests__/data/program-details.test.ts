import { describe, expect, test } from "vitest";
import {
  businessAdministrationProgram,
  getProgramDetail,
  programDetails,
} from "@/data/program-details";

describe("business administration program data", () => {
  test("keeps verified programme totals aligned", () => {
    expect(businessAdministrationProgram.semesters).toHaveLength(9);
    expect(
      businessAdministrationProgram.semesters.reduce((sum, term) => sum + term.credits, 0),
    ).toBe(126);
    expect(businessAdministrationProgram.outcomes).toHaveLength(10);
    expect(businessAdministrationProgram.facts).toContainEqual(
      expect.objectContaining({ label: "Khối lượng", value: "126 tín chỉ", status: "verified" }),
    );
  });

  test("publishes the DOCX-backed course count", () => {
    expect(businessAdministrationProgram.facts).toContainEqual(
      expect.objectContaining({
        label: "Tổng học phần",
        value: "59 học phần",
        status: "verified",
        needsVerification: false,
      }),
    );
  });

  test("exposes five structured program pages", () => {
    expect(getProgramDetail("quan-tri-kinh-doanh-marketing")).toBe(businessAdministrationProgram);
    expect(programDetails).toHaveLength(5);
  });

  test("loads the complete tourism academic source", () => {
    const tourism = getProgramDetail("quan-tri-dich-vu-du-lich-va-lu-hanh");
    expect(tourism?.evidenceLevel).toBe("academic_source");
    expect(tourism?.code).toBe("7810103");
    expect(tourism?.outcomes).toHaveLength(10);
    expect(tourism?.semesters).toHaveLength(9);
    expect(tourism?.semesters.reduce((sum, term) => sum + term.credits, 0)).toBe(126);
  });

  test("keeps curriculum-backed plans complete with verified profile fields", () => {
    const expectedCodes = {
      "cong-nghe-thong-tin": "7480201",
      "ngon-ngu-anh": "7220201",
      "ngon-ngu-trung-quoc": "7220204",
    } as const;

    for (const slug of Object.keys(expectedCodes) as Array<keyof typeof expectedCodes>) {
      const program = getProgramDetail(slug);
      expect(program?.evidenceLevel).toBe("curriculum_source");
      expect(program?.curriculum.length).toBeGreaterThanOrEqual(10);
      expect(program?.semesters).toHaveLength(9);
      expect(program?.semesters.reduce((sum, term) => sum + term.credits, 0)).toBe(126);
      expect(program?.outcomes).toEqual([]);
      expect(program?.code).toBe(expectedCodes[slug]);
      expect(program?.admissions).toBeTruthy();
    }

    const expectedCourseCounts = {
      "cong-nghe-thong-tin": "53 học phần",
      "quan-tri-dich-vu-du-lich-va-lu-hanh": "57 học phần",
      "ngon-ngu-anh": "62 học phần",
      "ngon-ngu-trung-quoc": "54 học phần",
    } as const;

    for (const [slug, value] of Object.entries(expectedCourseCounts)) {
      expect(getProgramDetail(slug)?.facts).toContainEqual(
        expect.objectContaining({
          label: "Tổng học phần",
          value,
          status: "verified",
          needsVerification: false,
        }),
      );
    }
  });
});
