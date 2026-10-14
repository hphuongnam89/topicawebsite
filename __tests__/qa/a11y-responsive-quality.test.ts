import { describe, expect, test } from "vitest";
import { programDetails } from "@/data/program-details";
import { OFFICIAL_TUITION_PROGRAMS, SCHOLARSHIPS } from "@/data/tuition";
import { leadFormSchema } from "@/lib/form-schema";
import fs from "fs";
import path from "path";

// WCAG relative luminance calculator
function getLuminance(hex: string): number {
  const rgb = hex.replace("#", "");
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrast(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Phase 9: Comprehensive QA, Accessibility WCAG 2.2 AA & Responsive Quality", () => {
  // -------------------------------------------------------------
  // 1. Kiểm tra tính thống nhất dữ liệu 5 ngành đào tạo & Học phí
  // -------------------------------------------------------------
  describe("1. Thống nhất dữ liệu 5 ngành đào tạo & Học phí 600k", () => {
    test("chính xác 5 ngành đào tạo chính thức được hỗ trợ", () => {
      expect(programDetails).toHaveLength(5);
      const expectedSlugs = [
        "quan-tri-kinh-doanh-marketing",
        "quan-tri-dich-vu-du-lich-va-lu-hanh",
        "cong-nghe-thong-tin",
        "ngon-ngu-anh",
        "ngon-ngu-trung-quoc",
      ];
      const actualSlugs = programDetails.map((p) => p.slug);
      expect(actualSlugs).toEqual(expect.arrayContaining(expectedSlugs));
    });

    test("học phí và học bổng đạt đúng quy chuẩn 600k/tín chỉ và giảm 30% Talent", () => {
      expect(OFFICIAL_TUITION_PROGRAMS).toHaveLength(5);
      OFFICIAL_TUITION_PROGRAMS.forEach((prog) => {
        expect(prog.pricePerCredit).toBe(600_000);
        expect(prog.credits).toBe(126);
        expect(prog.semesters).toBe(9);
        expect(prog.totalTuition).toBe(75_600_000);
        expect(prog.tuitionPerSemester).toBe(8_400_000);
        expect(prog.awardingInstitution).toBe("Trường Đại học Phú Xuân");
      });

      const talentScholarship = SCHOLARSHIPS.find((s) => s.id === "talent");
      expect(talentScholarship).toBeDefined();
      expect(talentScholarship?.percentage).toBe("30%");
      expect(talentScholarship?.title).toContain("Talent");
    });

    test("mọi chương trình đào tạo đều cấp bằng bởi Trường Đại học Phú Xuân (PXU)", () => {
      OFFICIAL_TUITION_PROGRAMS.forEach((prog) => {
        expect(prog.degreeAwarded).toMatch(/Cử nhân/i);
        expect(prog.awardingInstitution).toBe("Trường Đại học Phú Xuân");
        expect(prog.semesters).toBe(9);
        expect(prog.credits).toBe(126);
      });

      programDetails.forEach((prog) => {
        const degreeFact = prog.facts.find((f) => f.label === "Văn bằng");
        expect(degreeFact?.value).toMatch(/Cử nhân/i);
        expect(prog.semesters).toHaveLength(9);
      });
    });
  });

  // -------------------------------------------------------------
  // 2. Kiểm tra Khả năng tiếp cận WCAG 2.2 AA (Accessibility)
  // -------------------------------------------------------------
  describe("2. Tiêu chuẩn Khả năng tiếp cận WCAG 2.2 AA", () => {
    test("độ tương phản màu sắc chữ thường đạt tối thiểu 4.5:1 (Level AA) từ bảng token thực tế", () => {
      // Primary Navy 900 (#00264D) trên White Canvas (#FFFFFF)
      const navyOnWhite = getContrast("#00264D", "#FFFFFF");
      expect(navyOnWhite).toBeGreaterThanOrEqual(4.5);
      expect(navyOnWhite).toBeGreaterThan(13); // Chuẩn AAA > 7:1

      // Secondary Navy (#16466B) trên White Canvas (#FFFFFF)
      const navySecOnWhite = getContrast("#16466B", "#FFFFFF");
      expect(navySecOnWhite).toBeGreaterThanOrEqual(4.5);
      expect(navySecOnWhite).toBeGreaterThan(7); // Chuẩn AAA > 7:1

      // High-legibility Body Ink (#243447) trên White Canvas (#FFFFFF)
      const bodyInkOnWhite = getContrast("#243447", "#FFFFFF");
      expect(bodyInkOnWhite).toBeGreaterThanOrEqual(4.5);
      expect(bodyInkOnWhite).toBeGreaterThan(10); // Chuẩn AAA > 7:1

      // Muted Ink 600 (#625E58) trên White Canvas (#FFFFFF)
      const mutedInkOnWhite = getContrast("#625E58", "#FFFFFF");
      expect(mutedInkOnWhite).toBeGreaterThanOrEqual(4.5);

      // Dark Gold 700 (#946727) trên White Canvas (#FFFFFF)
      const goldTextOnWhite = getContrast("#946727", "#FFFFFF");
      expect(goldTextOnWhite).toBeGreaterThanOrEqual(4.5);

      // Gold 400 (#C49F63) trên Navy 900 (#00264D)
      const goldOnNavy = getContrast("#C49F63", "#00264D");
      expect(goldOnNavy).toBeGreaterThanOrEqual(4.5);
    });

    test("CSS định nghĩa hỗ trợ prefers-reduced-motion và focus-visible", () => {
      const globalsCss = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf-8");
      expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");
      expect(globalsCss).toContain(":focus-visible");
      expect(globalsCss).toContain("scroll-behavior: auto !important");
    });

    test("giao diện chứa skip-to-main-content link", () => {
      const headerContent = fs.readFileSync(
        path.join(process.cwd(), "components/layout/Header.tsx"),
        "utf-8",
      );
      expect(headerContent).toContain('href="#main-content"');
      expect(headerContent).toContain("Chuyển đến nội dung chính");

      const layoutContent = fs.readFileSync(
        path.join(process.cwd(), "app/(main)/layout.tsx"),
        "utf-8",
      );
      expect(layoutContent).toContain('id="main-content"');
    });
  });

  // -------------------------------------------------------------
  // 3. Kiểm tra Tính hoàn thiện Form & Bảo vệ dữ liệu người học
  // -------------------------------------------------------------
  describe("3. Xác thực Form và Bảo mật thông tin người học", () => {
    test("chấp nhận dữ liệu form hợp lệ với đầy đủ consent", () => {
      const validData = {
        fullName: "Nguyễn Văn An",
        phone: "0912345678",
        email: "nguyenvanan@gmail.com",
        program: "ba",
        educationLevel: "tot-nghiep-thpt",
        consent: true,
      };

      const result = leadFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("từ chối dữ liệu thiếu sự đồng ý bảo mật (consent = false)", () => {
      const invalidData = {
        fullName: "Nguyễn Văn An",
        phone: "0912345678",
        email: "nguyenvanan@gmail.com",
        program: "quan-tri-kinh-doanh-marketing",
        educationLevel: "tot-nghiep-thpt",
        consent: false,
      };

      const result = leadFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("consent"))).toBe(true);
      }
    });

    test("từ chối số điện thoại không hợp lệ tại Việt Nam", () => {
      const invalidPhones = ["123456", "0123456789", "abcdefghij", "+1234567890", "0912345"];
      invalidPhones.forEach((phone) => {
        const result = leadFormSchema.safeParse({
          fullName: "Trần Minh",
          phone,
          email: "tranminh@gmail.com",
          program: "cong-nghe-thong-tin",
          educationLevel: "tot-nghiep-thpt",
          consent: true,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  // -------------------------------------------------------------
  // 4. Kiểm tra Responsive & Vùng chạm di động (Mobile Touch Targets)
  // -------------------------------------------------------------
  describe("4. Responsive & Vùng chạm tối thiểu 44px trên Mobile", () => {
    test("MobileStickyBar sử dụng các nút có kích thước đạt chuẩn tối thiểu 44px", () => {
      const stickyBarContent = fs.readFileSync(
        path.join(process.cwd(), "components/layout/MobileStickyBar.tsx"),
        "utf-8",
      );
      expect(stickyBarContent).toContain("min-h-[44px]");
      expect(stickyBarContent).toContain('size="default"');
    });

    test("FloatingActions trên desktop/tablet có kích thước >= 44x44px", () => {
      const floatingContent = fs.readFileSync(
        path.join(process.cwd(), "components/layout/FloatingActions.tsx"),
        "utf-8",
      );
      expect(floatingContent).toContain("h-12 w-12");
      expect(floatingContent).toContain("aria-label");
    });
  });
});
