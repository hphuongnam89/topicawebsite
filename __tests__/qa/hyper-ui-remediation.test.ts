import { describe, expect, test } from "vitest";
import fs from "fs";
import path from "path";
import { partners } from "@/components/sections/PartnersSection";

describe("Phase E: Hyper UI Remediation Comprehensive Regression (HUI-01 - HUI-09)", () => {
  const rootDir = process.cwd();

  test("HUI-01: ProgramHero CTA trỏ tới #chuong-trinh có nhãn chính xác 'Xem chương trình'", () => {
    const heroCode = fs.readFileSync(
      path.join(rootDir, "components/program/ProgramHero.tsx"),
      "utf-8"
    );
    expect(heroCode).toContain('href="#chuong-trinh"');
    expect(heroCode).toContain("Xem chương trình");
    expect(heroCode).not.toContain("Xem trạng thái hồ sơ");
  });

  test("HUI-03: Typography H1 tại ProgramHero và PageHeader được giới hạn responsive an toàn", () => {
    const heroCode = fs.readFileSync(
      path.join(rootDir, "components/program/ProgramHero.tsx"),
      "utf-8"
    );
    // Áp dụng fluid clamp tránh font quá khổ > 54px gây tràn 3 dòng trên mobile/tablet
    expect(heroCode).toContain("text-[clamp(");
    expect(heroCode).toContain("leading-[1.15]");

    const pageHeaderCode = fs.readFileSync(
      path.join(rootDir, "components/layout/PageHeader.tsx"),
      "utf-8"
    );
    expect(pageHeaderCode).toContain("text-3xl");
    expect(pageHeaderCode).toContain("sm:text-4xl");
    expect(pageHeaderCode).toContain("lg:text-h1");
  });

  test("HUI-04: Trang chủ sắp xếp theo Narrative Workflow chuẩn (Chương trình trước Quy trình)", () => {
    const homeCode = fs.readFileSync(
      path.join(rootDir, "app/(main)/page.tsx"),
      "utf-8"
    );
    const programsIndex = homeCode.indexOf("<ProgramsSection");
    const admissionTimelineIndex = homeCode.indexOf("<AdmissionTimeline");
    const leadFormIndex = homeCode.indexOf('id="tu-van"');

    expect(programsIndex).toBeGreaterThan(-1);
    expect(admissionTimelineIndex).toBeGreaterThan(-1);
    expect(leadFormIndex).toBeGreaterThan(-1);

    // Người học phải nhìn thấy danh mục ngành trước khi đọc 5 bước nộp hồ sơ
    expect(programsIndex).toBeLessThan(admissionTimelineIndex);
    // Điểm tư vấn đặt sau quy trình
    expect(admissionTimelineIndex).toBeLessThan(leadFormIndex);

    // Kiểm tra anchor ID tương thích
    const programsSecCode = fs.readFileSync(
      path.join(rootDir, "components/sections/ProgramsSection.tsx"),
      "utf-8"
    );
    expect(programsSecCode).toContain('id="chuong-trinh-dao-tao"');

    const admissionTimelineCode = fs.readFileSync(
      path.join(rootDir, "components/sections/AdmissionTimeline.tsx"),
      "utf-8"
    );
    expect(admissionTimelineCode).toContain('id="quy-trinh-tuyen-sinh"');
  });

  test("HUI-05: Header tối ưu hoá không gian tablet 768px, ẩn email dài và rút gọn Thư viện số", () => {
    const headerCode = fs.readFileSync(
      path.join(rootDir, "components/layout/Header.tsx"),
      "utf-8"
    );
    // Email được ẩn tại tablet < 1024px để chống tràn thanh tiện ích
    expect(headerCode).toContain("hidden min-h-6 items-center gap-1.5 text-white/75 transition-colors hover:text-white lg:flex");
    expect(headerCode).toContain("(E-LIB)");
  });

  test("HUI-06: Ngôn ngữ giao diện chuẩn mực, không rò rỉ thuật ngữ kiểm kê nội bộ", () => {
    const quickFactsCode = fs.readFileSync(
      path.join(rootDir, "components/program/ProgramQuickFacts.tsx"),
      "utf-8"
    );
    expect(quickFactsCode).not.toContain("Những gì đã được xác minh");
    expect(quickFactsCode).toContain("Thông tin chương trình");

    const curriculumCode = fs.readFileSync(
      path.join(rootDir, "components/program/CurriculumExplorer.tsx"),
      "utf-8"
    );
    expect(curriculumCode).not.toContain("Khung học phần đã xác minh");
    expect(curriculumCode).toContain("Khung chương trình đào tạo");

    const tuitionHubCode = fs.readFileSync(
      path.join(rootDir, "components/tuition/TuitionHub.tsx"),
      "utf-8"
    );
    expect(tuitionHubCode).not.toContain("Chưa có tệp đầy đủ thông tin xác minh");

    const suppProgramCode = fs.readFileSync(
      path.join(rootDir, "data/supplemental-program-details.ts"),
      "utf-8"
    );
    expect(suppProgramCode).not.toContain("chương trình đào tạo-01.jpg");
    expect(suppProgramCode).not.toContain("chương trình đào tạo-02.jpg");
  });

  test("HUI-07: Danh sách đối tác chỉ chứa các đơn vị đã xác minh danh tính và văn bản", () => {
    expect(partners.length).toBe(5);
    partners.forEach((partner) => {
      expect(partner.name).not.toMatch(/Đối tác \d/);
      expect(partner.name.length).toBeGreaterThan(0);
    });
  });

  test("HUI-08: FloatingActions và ProgramStickyBar không xung đột z-index hoặc vị trí", () => {
    const floatingCode = fs.readFileSync(
      path.join(rootDir, "components/layout/FloatingActions.tsx"),
      "utf-8"
    );
    expect(floatingCode).toContain("z-40");
    expect(floatingCode).toContain("h-12 w-12");

    const stickyBarCode = fs.readFileSync(
      path.join(rootDir, "components/program/ProgramStickyBar.tsx"),
      "utf-8"
    );
    expect(stickyBarCode).toContain("z-30");

    const globalsCss = fs.readFileSync(
      path.join(rootDir, "app/globals.css"),
      "utf-8"
    );
    expect(globalsCss).toContain('body:has(aside[aria-label="Hành động tuyển sinh"]) [data-floating-actions]');
  });

  test("HUI-09: Thứ tự CSS cascade prefers-reduced-motion đảm bảo vô hiệu hoá animation", () => {
    const globalsCss = fs.readFileSync(
      path.join(rootDir, "app/globals.css"),
      "utf-8"
    );
    const marqueeIndex = globalsCss.indexOf(".animate-marquee {");
    const reducedMotionIndex = globalsCss.indexOf("@media (prefers-reduced-motion: reduce)");

    expect(marqueeIndex).toBeGreaterThan(-1);
    expect(reducedMotionIndex).toBeGreaterThan(-1);
    // Base rule phải đứng trước media query
    expect(marqueeIndex).toBeLessThan(reducedMotionIndex);

    // Block reduced-motion phải chứa animation: none !important
    const reducedMotionBlock = globalsCss.substring(reducedMotionIndex);
    expect(reducedMotionBlock).toContain("animation: none !important;");
  });
});
