import { describe, expect, test } from "vitest";
import {
  programs,
  getProgramById,
  getProgramBySlug,
  getProgramByMajorCode,
  PROGRAM_ID_MAP,
  ProgramId,
  TargetAudienceId,
} from "@/data/programs";
import {
  OFFICIAL_TUITION_PROGRAMS,
  calculateProgramTuition,
  COHORT_2026_POLICY,
  SCHOLARSHIPS,
  SUPPORTED_COHORTS,
} from "@/data/tuition";

describe("Task R05: Hợp đồng dữ liệu chương trình, học phí và văn bằng", () => {
  describe("1. ID chương trình ổn định & Ánh xạ Legacy Slugs", () => {
    const expectedIds: ProgramId[] = ["ba", "tourism", "it", "english", "chinese"];

    test("đầy đủ 5 chương trình đào tạo với ID chuẩn", () => {
      expect(programs.length).toBe(5);
      expectedIds.forEach((id) => {
        const found = getProgramById(id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(id);
      });
    });

    test("ánh xạ legacy slugs về đúng ProgramId qua PROGRAM_ID_MAP", () => {
      expect(PROGRAM_ID_MAP["quan-tri-kinh-doanh-marketing"]).toBe("ba");
      expect(PROGRAM_ID_MAP["quan-tri-kinh-doanh"]).toBe("ba");
      expect(PROGRAM_ID_MAP["quan-tri-dich-vu-du-lich-va-lu-hanh"]).toBe("tourism");
      expect(PROGRAM_ID_MAP["du-lich-lu-hanh"]).toBe("tourism");
      expect(PROGRAM_ID_MAP["cong-nghe-thong-tin"]).toBe("it");
      expect(PROGRAM_ID_MAP["cntt"]).toBe("it");
      expect(PROGRAM_ID_MAP["ngon-ngu-anh"]).toBe("english");
      expect(PROGRAM_ID_MAP["tieng-anh"]).toBe("english");
      expect(PROGRAM_ID_MAP["ngon-ngu-trung-quoc"]).toBe("chinese");
      expect(PROGRAM_ID_MAP["tieng-trung"]).toBe("chinese");
    });

    test("tra cứu theo slug hoặc legacy slug đều trả về đối tượng Program chính xác", () => {
      const progFromSlug = getProgramBySlug("/cong-nghe-thong-tin/");
      const progFromLegacy = getProgramBySlug("cntt");
      expect(progFromSlug?.id).toBe("it");
      expect(progFromLegacy?.id).toBe("it");
    });
  });

  describe("2. Tính chuẩn mực văn bằng & Pháp lý đào tạo", () => {
    test("hình thức đào tạo là 'Đào tạo từ xa', cấp bằng bởi 'Trường Đại học Phú Xuân'", () => {
      programs.forEach((prog) => {
        expect(prog.trainingMode).toBe("Đào tạo từ xa");
        expect(prog.awardingInstitution).toBe("Trường Đại học Phú Xuân");
        expect(prog.collaboratingUnit).toBe("Viện Đào tạo Quốc tế Topica");
      });
    });

    test("tên văn bằng KHÔNG dùng nhãn mạo nhận 'Cử nhân chính quy' cho hệ từ xa", () => {
      programs.forEach((prog) => {
        expect(prog.degreeAwarded.toLowerCase()).not.toContain("chính quy");
        expect(prog.degreeAwarded).toContain("Trường Đại học Phú Xuân");
      });

      OFFICIAL_TUITION_PROGRAMS.forEach((prog) => {
        expect(prog.degreeAwarded.toLowerCase()).not.toContain("chính quy");
        expect(prog.degreeAwarded).toContain("Cử nhân");
      });
    });

    test("mã ngành cấp IV của Bộ Giáo dục & Đào tạo chính xác", () => {
      const codeMap: Record<ProgramId, string> = {
        ba: "7340101",
        tourism: "7810103",
        it: "7480201",
        english: "7220201",
        chinese: "7220204",
      };

      programs.forEach((prog) => {
        expect(prog.majorCode).toBe(codeMap[prog.id]);
        const foundByCode = getProgramByMajorCode(prog.majorCode);
        expect(foundByCode?.id).toBe(prog.id);
      });
    });
  });

  describe("3. Đối tượng người học & Khung tín chỉ theo đối tượng", () => {
    const audienceIds: TargetAudienceId[] = ["thpt", "trung_cap", "cao_dang", "van_bang_2"];

    test("mỗi chương trình đều có đầy đủ 4 lộ trình đào tạo theo đối tượng tuyển sinh", () => {
      programs.forEach((prog) => {
        expect(prog.targetAudiences.length).toBe(4);
        audienceIds.forEach((audId) => {
          const track = prog.targetAudiences.find((a) => a.audienceId === audId);
          expect(track).toBeDefined();
          expect(track?.estimatedCredits).toBeGreaterThan(0);
          expect(track?.durationYears).toBeGreaterThan(0);
          expect(track?.durationSemesters).toBeGreaterThan(0);
        });
      });
    });

    test("khung thời gian và tín chỉ phản ánh đúng tính chất liên thông / văn bằng 2", () => {
      const itProgram = getProgramById("it");
      expect(itProgram).toBeDefined();

      const thpt = itProgram?.targetAudiences.find((a) => a.audienceId === "thpt");
      const caoDang = itProgram?.targetAudiences.find((a) => a.audienceId === "cao_dang");
      const vb2 = itProgram?.targetAudiences.find((a) => a.audienceId === "van_bang_2");

      expect(thpt?.estimatedCredits).toBe(126);
      expect(thpt?.durationYears).toBe(3.5);

      expect(caoDang?.estimatedCredits).toBe(56);
      expect(caoDang?.durationYears).toBe(1.5);

      expect(vb2?.estimatedCredits).toBe(56);
      expect(vb2?.durationYears).toBe(1.5);
    });
  });

  describe("4. Đơn giá & Tính toán học phí", () => {
    test("đơn giá niêm yết khóa 2026 là 600.000 VNĐ / tín chỉ", () => {
      expect(COHORT_2026_POLICY.pricePerCredit).toBe(600000);
      expect(COHORT_2026_POLICY.currency).toBe("VND");
      expect(SUPPORTED_COHORTS).toContain("2026");
    });

    test("tính học phí chuẩn cho đối tượng THPT: 126 tín chỉ = 75.600.000 VNĐ", () => {
      const result = calculateProgramTuition({
        programId: "ba",
        audienceId: "thpt",
      });

      expect(result).not.toBeNull();
      expect(result?.credits).toBe(126);
      expect(result?.pricePerCredit).toBe(600000);
      expect(result?.baseTotalTuition).toBe(75600000);
      expect(result?.netTotalTuition).toBe(75600000);
      expect(result?.semesters).toBe(9);
      expect(result?.tuitionPerSemester).toBe(8400000); // 75.6M / 9
      expect(result?.discountAmount).toBe(0);
      expect(result?.isOfficialPolicy).toBe(true);
    });

    test("tính học phí cho đối tượng liên thông Cao đẳng: 56 tín chỉ = 33.600.000 VNĐ", () => {
      const result = calculateProgramTuition({
        programId: "it",
        audienceId: "cao_dang",
      });

      expect(result).not.toBeNull();
      expect(result?.credits).toBe(56);
      expect(result?.baseTotalTuition).toBe(33600000);
      expect(result?.semesters).toBe(4);
      expect(result?.tuitionPerSemester).toBe(8400000); // 33.6M / 4
    });

    test("áp dụng học bổng Tài năng (30% toàn khóa)", () => {
      const talentScholarship = SCHOLARSHIPS.find((s) => s.id === "talent");
      expect(talentScholarship).toBeDefined();

      const result = calculateProgramTuition({
        programId: "english",
        audienceId: "thpt",
        scholarshipId: "talent",
      });

      expect(result).not.toBeNull();
      expect(result?.baseTotalTuition).toBe(75600000);
      expect(result?.discountAmount).toBe(22680000); // 75.6M * 30%
      expect(result?.netTotalTuition).toBe(52920000); // 75.6M - 22.68M
      expect(result?.discountPercentText).toBe("30%");
      expect(result?.tuitionPerSemester).toBe(5880000); // 52.92M / 9
    });

    test("tính kịch bản học bổng Leadership 20% toàn khóa sau khi đủ điều kiện", () => {
      const encouragement = SCHOLARSHIPS.find((s) => s.id === "leadership");
      expect(encouragement).toBeDefined();

      const result = calculateProgramTuition({
        programId: "chinese",
        audienceId: "thpt",
        scholarshipId: "leadership",
      });

      expect(result).not.toBeNull();
      expect(result?.discountAmount).toBe(15120000);
      expect(result?.netTotalTuition).toBe(60480000);
    });
  });

  describe("5. Rào chắn bảo vệ: Không tự ý fallback khi thiếu policy", () => {
    test("từ chối tính toán khi truyền cohort chưa công bố chính thức", () => {
      const result2024 = calculateProgramTuition({
        programId: "ba",
        cohort: "2024",
      });
      expect(result2024).toBeNull();

      const result2025 = calculateProgramTuition({
        programId: "ba",
        cohort: "2025",
      });
      expect(result2025).toBeNull();

      const result2027 = calculateProgramTuition({
        programId: "ba",
        cohort: "2027",
      });
      expect(result2027).toBeNull();
    });

    test("từ chối tính toán khi mã chương trình không tồn tại", () => {
      const resultInvalidProg = calculateProgramTuition({
        programId: "y-khoa",
      });
      expect(resultInvalidProg).toBeNull();
    });

    test("từ chối tính toán khi mã học bổng không có trong chính sách", () => {
      const resultInvalidScholarship = calculateProgramTuition({
        programId: "ba",
        scholarshipId: "hoc-bong-gia-dinh-100%",
      });
      expect(resultInvalidScholarship).toBeNull();
    });
  });
});
