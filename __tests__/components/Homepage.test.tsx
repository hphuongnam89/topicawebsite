import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
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
    test("ưu tiên tuyên ngôn thương hiệu và 2 CTA chính", () => {
      render(<HeroSection />);

      // The institution relationship stays in the trust rail below the hero, not as an eyebrow.
      expect(
        screen.queryByText("Trường Đại học Phú Xuân — Viện Đào tạo Quốc tế Topica"),
      ).not.toBeInTheDocument();

      // Heading chính
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveAccessibleName("Học chủ động — Kiến tạo tương lai");

      // 2 CTA buttons
      const applyBtn = screen.getByRole("link", { name: "Đăng ký xét tuyển" });
      expect(applyBtn).toHaveAttribute("href", "https://www.tuyensinh.topicauni.edu.vn/");

      const programsBtn = screen.getByRole("link", { name: "Xem ngành học" });
      expect(programsBtn.getAttribute("href")).toMatch(/^\/nganh-dao-tao\/?$/);
      expect(screen.getAllByRole("link").indexOf(programsBtn)).toBeLessThan(
        screen.getAllByRole("link").indexOf(applyBtn),
      );

      // The hero always lets the learner explore before asking for personal data.
      expect(
        screen.queryByRole("button", { name: "Đăng ký tư vấn miễn phí" }),
      ).not.toBeInTheDocument();
    });

    test("không nhúng form vào hero ngay cả khi CMS bật form tư vấn", () => {
      render(<HeroSection data={{ showLeadForm: true }} />);

      expect(
        screen.queryByRole("button", { name: "Đăng ký tư vấn miễn phí" }),
      ).not.toBeInTheDocument();
    });

    test("không để dấu gạch ngang đứng riêng do xuống dòng trong nội dung CMS", () => {
      render(<HeroSection data={{ title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI" }} />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "HỌC CHỦ ĐỘNG — KIẾN TẠO TƯƠNG LAI",
      );
    });

    test("tự chuyển qua ba banner, đặt chấm điều hướng sau nội dung và không có nút play/pause", () => {
      vi.useFakeTimers();
      const { unmount } = render(<HeroSection />);

      expect(screen.getAllByRole("button", { name: /Hiển thị banner/ })).toHaveLength(3);

      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "5 ngành học — Chọn đúng hướng đi",
      );

      expect(screen.queryByRole("button", { name: /tạm dừng|tiếp tục tự động/i })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Hiển thị banner 3/ }));
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "Sáng tạo — Thế giới số trong tay bạn",
      );

      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "Học chủ động — Kiến tạo tương lai",
      );

      unmount();
      vi.useRealTimers();
    });

    test("phát hết video hero không tiếng rồi tự chuyển banner, giữ ảnh làm poster", () => {
      const { container } = render(<HeroSection data={{ videoUrl: "/uploads/intro.mp4" }} />);
      const video = container.querySelector("video");

      expect(video).toHaveAttribute("src", "/uploads/intro.mp4");
      expect(video).toHaveAttribute("poster");
      expect(video).toHaveProperty("muted", true);
      expect(video).toHaveProperty("playsInline", true);
      expect(video).not.toHaveAttribute("controls");

      fireEvent.ended(video!);
      expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
        "5 ngành học — Chọn đúng hướng đi",
      );
    });
  });

  describe("2. AdmissionTimeline", () => {
    test("hiển thị quy trình 5 bước tuyển sinh chuẩn mực, không có đồng hồ đếm ngược ảo", () => {
      render(<AdmissionTimeline />);

      expect(screen.getByText("Lộ trình trở thành sinh viên Topica")).toBeInTheDocument();
      expect(screen.getByText("5 bước đơn giản để bắt đầu hành trình học tập")).toBeInTheDocument();

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

      expect(screen.queryByText("Đang tuyển sinh")).not.toBeInTheDocument();

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
