import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { TuitionHub } from "@/components/tuition/TuitionHub";
import { AdmissionHub } from "@/components/admission/AdmissionHub";
import { OFFICIAL_TUITION_PROGRAMS, SCHOLARSHIPS } from "@/data/tuition";

// Mock CMS calls
vi.mock("@/lib/cms", () => ({
  cms: {
    getArticles: vi.fn().mockResolvedValue({ articles: [], total: 0 }),
    getLatestArticles: vi.fn().mockResolvedValue([]),
  },
}));

// Mock motion/react for deterministic rendering in jsdom
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, className, style, role, id, ...props }: any) => (
      <div className={className} style={style} role={role} id={id} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useReducedMotion: () => false,
}));

describe("Task R13: Tuyển sinh và Học phí (Mobile Cards & Bảng biểu phí)", () => {
  describe("1. TuitionHub Mobile & Desktop Readability", () => {
    test("hiển thị thẻ học phí 5 ngành đào tạo không cần cuộn ngang trên mobile", () => {
      render(<TuitionHub />);

      // Tiêu đề chính
      expect(screen.getByText("Học phí theo chương trình và đối tượng")).toBeInTheDocument();
      expect(
        screen.getByText(/Trường Đại học Phú Xuân/i, { selector: "strong" }),
      ).toBeInTheDocument();

      // Kiểm tra 5 chương trình học phí
      OFFICIAL_TUITION_PROGRAMS.forEach((prog) => {
        const programLinks = screen.getAllByRole("link", {
          name: new RegExp(prog.programName, "i"),
        });
        expect(programLinks.length).toBeGreaterThanOrEqual(1);
      });

      // Đơn giá 600.000 đ / tín chỉ
      const unitPrices = screen.getAllByText(/600\.000/);
      expect(unitPrices.length).toBeGreaterThanOrEqual(5);

      // Học phí toàn khóa 75.600.000 đ
      const totalTuitions = screen.getAllByText(/75\.600\.000/);
      expect(totalTuitions.length).toBeGreaterThanOrEqual(5);

      // Nhãn văn bằng cử nhân ĐH Phú Xuân
      const degreeLabels = screen.getAllByText(
        /Bằng Cử nhân do Trường Đại học Phú Xuân cấp/i,
      );
      expect(degreeLabels.length).toBeGreaterThanOrEqual(1);
    });

    test("hiển thị các gói học bổng với điều kiện minh bạch (học bổng Talent 30%)", () => {
      render(<TuitionHub />);

      expect(screen.getByText("Chính sách Học bổng năm 2026")).toBeInTheDocument();

      const talentScholarship = SCHOLARSHIPS.find((s) => s.id === "talent");
      expect(talentScholarship).toBeDefined();

      expect(screen.getByText(talentScholarship!.title)).toBeInTheDocument();
      expect(screen.getAllByText("30%").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(talentScholarship!.criteria)).toBeInTheDocument();
    });

    test("tài liệu và biểu mẫu sử dụng viewUrl nội bộ hợp lệ, không link tải giả mạo", () => {
      const { container } = render(<TuitionHub />);

      const docLinks = container.querySelectorAll("a[href^='/']");
      expect(docLinks.length).toBeGreaterThan(0);

      // Không có link rỗng href="#"
      const hashLinks = container.querySelectorAll('a[href="#"]');
      expect(hashLinks.length).toBe(0);
    });
  });

  describe("2. AdmissionHub Components & Information", () => {
    test("AdmissionHub render các thông tin tuyển sinh và phương thức xét tuyển", async () => {
      const mockPage: any = {
        title: "Tuyển sinh năm 2026",
        slug: "thong-tin-tuyen-sinh-nam-2026",
        content_html: "<p>Nội dung tuyển sinh</p>",
      };

      const result = await AdmissionHub({ page: mockPage });
      render(result);

      // Phương thức xét tuyển trong FAQ hoặc nội dung
      expect(
        screen.getByText(/Topica xét tuyển bằng những phương thức nào\?/i),
      ).toBeInTheDocument();

      // Thông tin học phí trong FAQ
      expect(
        screen.getByText(/Học phí tại Topica được đóng như thế nào\?/i),
      ).toBeInTheDocument();
    });
  });
});
