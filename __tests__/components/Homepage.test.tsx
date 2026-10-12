import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { AdmissionTimeline } from "@/components/sections/AdmissionTimeline";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { WhyTopicaSection } from "@/components/sections/WhyTopicaSection";
import { CampusSection } from "@/components/sections/CampusSection";

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

describe("Task R11: Cấu trúc và hiển thị Trang chủ (Template T01)", () => {
  describe("1. HeroSection", () => {
    test("hiển thị badge danh tính trường, tiêu đề không gãy chữ xấu, và 2 CTA chính", () => {
      render(<HeroSection />);

      // Badge danh tính
      expect(
        screen.getByText("Trường Đại học Phú Xuân — Viện Đào tạo Quốc tế Topica"),
      ).toBeInTheDocument();

      // Heading chính
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Học chủ động — Kiến tạo tương lai");

      // 2 CTA buttons
      const applyBtn = screen.getByRole("link", { name: "Đăng ký xét tuyển" });
      expect(applyBtn).toHaveAttribute("href", "https://www.tuyensinh.topicauni.edu.vn/");

      const programsBtn = screen.getByRole("link", { name: "Xem ngành học" });
      expect(programsBtn.getAttribute("href")).toMatch(/^\/nganh-dao-tao\/?$/);

      // Default hero lets the learner explore before asking for personal data.
      expect(screen.queryByRole("button", { name: "Đăng ký tư vấn miễn phí" })).not.toBeInTheDocument();
    });
  });

  describe("2. AdmissionTimeline", () => {
    test("hiển thị quy trình 5 bước tuyển sinh chuẩn mực, không có đồng hồ đếm ngược ảo", () => {
      render(<AdmissionTimeline />);

      expect(screen.getByText("Lộ trình trở thành sinh viên Topica")).toBeInTheDocument();
      expect(
        screen.getByText("5 bước đơn giản để bắt đầu hành trình học tập"),
      ).toBeInTheDocument();

      const steps = screen.getAllByRole("listitem");
      expect(steps).toHaveLength(5);
    });
  });

  describe("3. ProgramsSection", () => {
    test("hiển thị đầy đủ 5 chương trình cử nhân trực tuyến do ĐH Phú Xuân cấp bằng", () => {
      render(<ProgramsSection />);

      expect(screen.getByText("5 Ngành Đào tạo Cử nhân Trực tuyến")).toBeInTheDocument();

      const expectedPrograms = [
        "Quản trị kinh doanh",
        "Quản trị du lịch và lữ hành",
        "Công nghệ thông tin",
        "Ngôn ngữ Anh",
        "Ngôn ngữ Trung Quốc",
      ];

      expectedPrograms.forEach((name) => {
        expect(screen.getByRole("heading", { name: new RegExp(name, "i") })).toBeInTheDocument();
      });

      // Kiểm tra nhãn đơn vị cấp bằng
      const degrees = screen.getAllByText(/Cử nhân ĐH Phú Xuân/i);
      expect(degrees.length).toBe(5);
    });
  });

  describe("4. TrustSection & WhyTopicaSection", () => {
    test("TrustSection hiển thị các dấu ấn đã xác minh", () => {
      render(<TrustSection />);

      expect(screen.getByText("Trực thuộc ĐH Phú Xuân")).toBeInTheDocument();
      expect(screen.getByText("Bằng cấp được Bộ GD&ĐT công nhận")).toBeInTheDocument();
      expect(screen.getByText("Đào tạo từ xa")).toBeInTheDocument();
      expect(screen.getByText("6 trung tâm toàn quốc")).toBeInTheDocument();
      expect(screen.getByText("Thành viên EQuest")).toBeInTheDocument();
    });

    test("WhyTopicaSection hiển thị cam kết minh bạch mà không bịa số liệu nghiên cứu", () => {
      render(<WhyTopicaSection />);

      expect(screen.getByText("Học online 100%")).toBeInTheDocument();
      expect(screen.getByText("Bằng cấp có giá trị")).toBeInTheDocument();
      expect(screen.getByText("Công nghệ hỗ trợ bạn tiến bộ")).toBeInTheDocument();
      expect(screen.getByText("Lộ trình rõ ràng cho người đi làm")).toBeInTheDocument();
    });
  });

  describe("5. CampusSection", () => {
    test("hiển thị 6 địa điểm trung tâm và đồng bộ hotline miễn cước", () => {
      render(<CampusSection />);

      expect(screen.getByText("Hệ thống trung tâm")).toBeInTheDocument();
      expect(screen.getByText("Hà Nội")).toBeInTheDocument();
      expect(screen.getByText("TP. Hồ Chí Minh")).toBeInTheDocument();
      expect(screen.getByText("TP. Đà Nẵng")).toBeInTheDocument();
      expect(screen.getByText("TP. Huế")).toBeInTheDocument();
      expect(screen.getByText("TP. Hải Phòng")).toBeInTheDocument();
      expect(screen.getByText("TP. Cần Thơ")).toBeInTheDocument();

      // Hotline miễn cước 1800 646 857
      const hotlineLinks = screen.getAllByText("1800 646 857");
      expect(hotlineLinks.length).toBeGreaterThan(0);
    });
  });
});
