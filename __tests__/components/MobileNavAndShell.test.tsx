import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { Header } from "@/components/layout/Header";

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
}));

describe("Task R10: Khung trang, điều hướng, MobileNav và Sticky Bar", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  describe("1. MobileNav Keyboard, Focus Trap & Scroll Lock", () => {
    test("khoá scroll của body khi mở và trả lại trạng thái khi đóng", () => {
      const onClose = vi.fn();
      const { rerender } = render(<MobileNav open={true} onClose={onClose} />);

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileNav open={false} onClose={onClose} />);
      expect(document.body.style.overflow).toBe("");
    });

    test("đóng drawer khi nhấn phím Escape", () => {
      const onClose = vi.fn();
      render(<MobileNav open={true} onClose={onClose} />);

      const drawer = screen.getByRole("dialog");
      expect(drawer).toBeInTheDocument();
      expect(drawer).toHaveAttribute("id", "mobile-nav-drawer");

      fireEvent.keyDown(drawer, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("hỗ trợ focus trap: Tab từ phần tử cuối cùng vòng lại phần tử đầu tiên", () => {
      const onClose = vi.fn();
      render(<MobileNav open={true} onClose={onClose} />);

      const drawer = screen.getByRole("dialog");
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      expect(focusable.length).toBeGreaterThan(1);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Khi focus ở phần tử cuối cùng và bấm Tab
      last.focus();
      expect(document.activeElement).toBe(last);

      fireEvent.keyDown(drawer, { key: "Tab", shiftKey: false });
      // Event preventDefault được gọi và first được focus
      expect(document.activeElement).toBe(first);

      // Khi focus ở phần tử đầu tiên và bấm Shift+Tab
      first.focus();
      expect(document.activeElement).toBe(first);

      fireEvent.keyDown(drawer, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(last);
    });

    test("đóng khi click vào backdrop", () => {
      const onClose = vi.fn();
      const { container } = render(<MobileNav open={true} onClose={onClose} />);

      const backdrop = container.querySelector(".fixed.inset-0");
      expect(backdrop).toBeInTheDocument();
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("2. MobileNav Accordion & CTAs", () => {
    test("mở và đóng accordion khi bấm vào danh mục chính", async () => {
      const onClose = vi.fn();
      render(<MobileNav open={true} onClose={onClose} />);

      // Chọn nhóm 'Ngành học'
      const programsTrigger = screen.getByRole("button", { name: /Ngành học/i });
      expect(programsTrigger).toBeInTheDocument();
      expect(programsTrigger).toHaveAttribute("aria-expanded", "false");

      // Click để mở
      fireEvent.click(programsTrigger);
      expect(programsTrigger).toHaveAttribute("aria-expanded", "true");

      // Kiểm tra sự xuất hiện của các link ngành
      expect(screen.getByText("Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số")).toBeInTheDocument();
      expect(screen.getByText("Quản trị kinh doanh")).toBeInTheDocument();

      // Click lần nữa để đóng
      fireEvent.click(programsTrigger);
      expect(programsTrigger).toHaveAttribute("aria-expanded", "false");
    });

    test("hiển thị đầy đủ các CTA tuyển sinh và tư vấn với độ tương phản cao", () => {
      const onClose = vi.fn();
      render(<MobileNav open={true} onClose={onClose} />);

      const applyBtn = screen.getByRole("link", { name: "Đăng ký xét tuyển" });
      expect(applyBtn).toBeInTheDocument();
      expect(applyBtn).toHaveAttribute("href", "https://www.tuyensinh.topicauni.edu.vn/");

      const consultBtn = screen.getByRole("link", { name: "Nhận tư vấn" });
      expect(consultBtn).toBeInTheDocument();
      expect(consultBtn.getAttribute("href")).toMatch(/^\/lien-he\/?$/);

      // Cổng E-learning
      const elearningLink = screen.getByRole("link", { name: "Cổng Elearning" });
      expect(elearningLink.getAttribute("href")).toMatch(/^\/he-thong\/?$/);
    });
  });

  describe("3. MobileStickyBar Hành vi thông minh", () => {
    test("hiển thị 2 nút CTA với safe area và kích thước tối thiểu 44px", () => {
      const { container } = render(<MobileStickyBar />);
      const bar = container.querySelector("[data-mobile-sticky-bar]");
      expect(bar).toBeInTheDocument();

      const consultLink = screen.getByRole("link", { name: "Nhận tư vấn" });
      expect(consultLink.getAttribute("href")).toMatch(/^\/lien-he\/?$/);
      expect(consultLink.className).toContain("min-h-[44px]");

      const applyLink = screen.getByRole("link", { name: "Đăng ký xét tuyển" });
      expect(applyLink).toHaveAttribute("href", "https://www.tuyensinh.topicauni.edu.vn/");
      expect(applyLink.className).toContain("min-h-[44px]");
    });

    test("ẩn thanh sticky bar khi người dùng focus vào input form", () => {
      const { container } = render(
        <div>
          <input type="text" data-testid="test-input" />
          <MobileStickyBar />
        </div>,
      );

      const bar = container.querySelector("[data-mobile-sticky-bar]");
      const input = screen.getByTestId("test-input");

      // Giả lập scroll qua 300px
      Object.defineProperty(window, "scrollY", { value: 400, writable: true });
      fireEvent.scroll(window);
      expect(bar?.className).toContain("translate-y-0");

      // Focus vào input -> phải ẩn thanh sticky để tránh che bàn phím ảo
      fireEvent.focusIn(input);
      expect(bar?.className).toContain("translate-y-full");

      // Blur khỏi input -> hiển thị lại thanh sticky
      fireEvent.focusOut(input);
      expect(bar?.className).toContain("translate-y-0");
    });
  });

  describe("4. Header Accessibility & Search Controls", () => {
    test("chứa liên kết nhảy đến nội dung chính (skip-to-content)", () => {
      render(<Header />);
      const skipLink = screen.getByRole("link", { name: "Chuyển đến nội dung chính" });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    test("nút mở menu mobile có aria-expanded và liên kết tới mobile-nav-drawer", () => {
      render(<Header />);
      const menuButton = screen.getByRole("button", { name: "Mở menu" });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
      expect(menuButton).toHaveAttribute("aria-controls", "mobile-nav-drawer");

      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });

    test("nút tìm kiếm bật tắt form tìm kiếm với role search", () => {
      render(<Header />);
      const searchButton = screen.getByRole("button", { name: "Tìm kiếm" });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(searchButton);
      expect(searchButton).toHaveAttribute("aria-expanded", "true");

      const searchForm = screen.getByRole("search");
      expect(searchForm).toBeInTheDocument();
      expect(searchForm).toHaveAttribute("action", "/tim-kiem/");

      const searchInput = screen.getByPlaceholderText("Bạn muốn tìm gì?");
      expect(searchInput).toBeInTheDocument();
    });
  });
});
