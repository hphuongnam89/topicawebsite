import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgramPageView } from "@/components/cms/ProgramPageView";
import { programDetails, getProgramDetail } from "@/data/program-details";
import ProgramsDirectoryPage from "@/app/(main)/nganh-dao-tao/page";

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

describe("Task R12: Danh mục và 5 Trang Ngành Đào tạo (Template T02 & T03)", () => {
  describe("1. ProgramsDirectoryPage (T02 Directory Hub)", () => {
    test("hiển thị đầy đủ thông tin pháp lý ĐH Phú Xuân và 5 ngành đào tạo", () => {
      render(<ProgramsDirectoryPage />);

      expect(screen.getByText("Ngành Đào tạo Cử nhân Trực tuyến")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Văn bằng tốt nghiệp do Trường Đại học Phú Xuân cấp/i,
      );

      const detailLinks = screen.getAllByRole("link", {
        name: /Chi tiết & Khung học/i,
      });
      expect(detailLinks).toHaveLength(5);
      expect(screen.queryByText("Đang tuyển sinh")).not.toBeInTheDocument();
    });
  });

  describe("2. ProgramPageView (T03 Program Landing Pages)", () => {
    test.each(programDetails.map((p) => [p.slug, p.officialName]))(
      "render thành công trang chi tiết ngành %s (%s)",
      (slug) => {
        const program = getProgramDetail(slug);
        expect(program).toBeDefined();
        if (!program) return;

        const { container } = render(<ProgramPageView program={program} />);

        // Tiêu đề chính
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(program.officialName);
        const factsAwaitingConfirmation = program.facts.filter(
          (fact) => fact.status === "need_confirmation",
        );
        factsAwaitingConfirmation.forEach((fact) => {
          expect(screen.queryByText(fact.label, { exact: true })).not.toBeInTheDocument();
          expect(screen.queryByText(fact.value, { exact: true })).not.toBeInTheDocument();
        });
        expect(screen.queryByText(/\.docx/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Sẽ cập nhật sau khi chốt/i)).not.toBeInTheDocument();

        // Khối lượng tín chỉ 126
        const credits = screen.getAllByText(/126 tín chỉ/i);
        expect(credits.length).toBeGreaterThanOrEqual(1);

        // Thời gian và đơn vị cấp bằng
        const institutions = screen.getAllByText(/Trường Đại học Phú Xuân/i);
        expect(institutions.length).toBeGreaterThanOrEqual(1);

        // CTA buttons
        const applyBtns = screen.getAllByRole("link", { name: /Đăng ký xét tuyển/i });
        expect(applyBtns.length).toBeGreaterThanOrEqual(1);
        expect(applyBtns[0]).toHaveAttribute("href", "https://www.tuyensinh.topicauni.edu.vn/");

        const tuitionBtns = screen.getAllByRole("link", { name: /Xem biểu phí & học bổng/i });
        expect(tuitionBtns.length).toBeGreaterThanOrEqual(1);
        expect(tuitionBtns[0].getAttribute("href")).toMatch(/^\/tuyen-sinh\/hoc-phi-hoc-bong\/?$/);

        // JSON-LD schema
        const scripts = container.querySelectorAll('script[type="application/ld+json"]');
        expect(scripts.length).toBeGreaterThanOrEqual(2);
      },
    );
  });
});
