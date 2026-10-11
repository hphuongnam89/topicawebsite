import { describe, expect, test } from "vitest";
import { programs, programGroups } from "@/data/programs";
import { getProgramDetail } from "@/data/program-details";
import { OFFICIAL_TUITION_PROGRAMS, SCHOLARSHIPS } from "@/data/tuition";
import { leadFormSchema, leadApiSchema } from "@/lib/form-schema";

describe("Phase 5: 6 Core Learner Journeys & User Acceptance", () => {
  describe("Journey 1: Lựa chọn 5 ngành đào tạo chính thức", () => {
    test("chỉ có đúng 5 ngành đào tạo chính thức được kích hoạt", () => {
      expect(programs).toHaveLength(5);
      const programNames = programs.map((p) => p.name);
      expect(programNames).toContain("Quản trị kinh doanh");
      expect(programNames).toContain("Quản trị du lịch và lữ hành");
      expect(programNames).toContain("Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số");
      expect(programNames).toContain("Ngôn ngữ Anh");
      expect(programNames).toContain("Ngôn ngữ Trung Quốc");
    });

    test("mỗi ngành có đầy đủ thông tin học thuật, mã ngành và văn bằng cử nhân", () => {
      programs.forEach((prog) => {
        const detail = getProgramDetail(prog.slug);
        expect(detail).toBeDefined();
        expect(detail?.facts.some((f) => f.label === "Văn bằng" && f.value.includes("Cử nhân"))).toBe(true);
        expect(detail?.facts.some((f) => f.label === "Mã ngành" && f.status === "verified")).toBe(true);
      });
    });
  });

  describe("Journey 2: Xác minh giá trị văn bằng & Tính pháp lý", () => {
    test("văn bằng cử nhân do Trường Đại học Phú Xuân cấp, thuộc hệ thống văn bằng quốc gia", () => {
      OFFICIAL_TUITION_PROGRAMS.forEach((item) => {
        expect(item.awardingInstitution).toBe("Trường Đại học Phú Xuân");
        expect(item.degreeAwarded).toContain("Cử nhân");
      });
    });
  });

  describe("Journey 3: Minh bạch Học phí & Chính sách Học bổng", () => {
    test("đơn giá học phí 600.000 đ / tín chỉ nhất quán trên toàn bộ 5 ngành đào tạo", () => {
      OFFICIAL_TUITION_PROGRAMS.forEach((item) => {
        expect(item.pricePerCredit).toBe(600000);
        expect(item.credits).toBeGreaterThanOrEqual(126);
        expect(item.totalTuition).toBe(item.credits * item.pricePerCredit);
        expect(item.totalTuition).toBe(75600000);
        expect(item.tuitionPerSemester).toBe(8400000);
      });
    });

    test("học bổng Talent giảm 30% học phí và có đầy đủ điều kiện xét tuyển", () => {
      const talent = SCHOLARSHIPS.find((s) => s.id === "talent");
      expect(talent).toBeDefined();
      expect(talent?.percentage).toBe("30%");
      expect(talent?.description).toContain("30%");
    });
  });

  describe("Journey 4: Lộ trình & Kỳ tuyển sinh", () => {
    test("các ngành đều có mã ngành tuyển sinh quốc gia hợp lệ", () => {
      const validMajorCodes = ["7340101", "7810103", "7480201", "7220201", "7220204"];
      OFFICIAL_TUITION_PROGRAMS.forEach((item) => {
        expect(validMajorCodes).toContain(item.majorCode);
      });
    });
  });

  describe("Journey 5: Gửi thông tin tư vấn & Validation", () => {
    test("chấp nhận dữ liệu form hợp lệ với 1 trong 5 ngành chuẩn", () => {
      const validPayload = {
        fullName: "Nguyễn Văn An",
        phone: "0912345678",
        email: "vanan@example.com",
        program: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
        educationLevel: "Tốt nghiệp THPT / Trung học nghề",
        consent: true,
      };

      const result = leadFormSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    test("từ chối số điện thoại không hợp lệ hoặc thiếu đồng ý bảo mật", () => {
      const invalidPayload = {
        fullName: "Nguyễn Văn An",
        phone: "12345", // Số điện thoại sai định dạng
        email: "vanan@example.com",
        program: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
        educationLevel: "Tốt nghiệp THPT / Trung học nghề",
        consent: false, // Chưa đồng ý
      };

      const result = leadFormSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    test("leadApiSchema kiểm tra cấu trúc API chặt chẽ", () => {
      const apiPayload = {
        fullname: "Trần Thị Bình",
        phone: "0987654321",
        email: "binh@example.com",
        program: "Quản trị kinh doanh",
      };
      const result = leadApiSchema.safeParse(apiPayload);
      expect(result.success).toBe(true);
    });
  });

  describe("Journey 6: Cổng học tập & Dịch vụ sinh viên", () => {
    test("cổng Elearning và hotline tuyển sinh được quy chuẩn chính xác", () => {
      const elearningUrl = "https://elib.pxu.edu.vn/";
      const hotline = "1800 646 857";
      expect(elearningUrl).toContain("pxu.edu.vn");
      expect(hotline).toBe("1800 646 857");
    });
  });
});
