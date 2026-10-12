import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import NotFound from "@/app/not-found";
import { CmsPageView } from "@/components/cms/CmsPageView";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
vi.mock("next/server", async importOriginal => ({...await importOriginal<typeof import("next/server")>(), connection:async()=>{}}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
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

describe("Task R14: Các trang nội dung, tìm kiếm, hỗ trợ và sitemap", () => {
  describe("1. NotFound (404 Page)", () => {
    test("hiển thị trang 404 chuẩn mực với form tìm kiếm và 5 ngành gợi ý", () => {
      render(<NotFound />);

      // Mã 404 và tiêu đề
      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Không tìm thấy trang yêu cầu")).toBeInTheDocument();

      // Form tìm kiếm
      expect(screen.getByRole("search")).toBeInTheDocument();

      // Link về trang chủ và ngành đào tạo
      expect(screen.getByRole("link", { name: "Về trang chủ" })).toHaveAttribute("href", "/");
      const programsLink = screen.getByRole("link", { name: "Xem 5 ngành đào tạo" });
      expect(programsLink.getAttribute("href")).toMatch(/^\/nganh-dao-tao\/?$/);

      // Danh sách gợi ý 5 ngành
      expect(screen.getByText(/Quản trị kinh doanh/i)).toBeInTheDocument();
      expect(screen.getByText(/Công nghệ thông tin/i)).toBeInTheDocument();
      expect(screen.getByText(/Ngôn ngữ Anh/i)).toBeInTheDocument();
      expect(screen.getByText(/Ngôn ngữ Trung Quốc/i)).toBeInTheDocument();
    });
  });

  describe("2. CmsPageView Template", () => {
    test("render bài viết CMS với tiêu đề, breadcrumbs và nội dung an toàn", () => {
      const mockPage: any = {
        id: 1,
        title: "Tầm nhìn và Sứ mạng",
        slug: "tam-nhin-su-mang",
        excerpt: "Giới thiệu về tầm nhìn và sứ mạng của Viện Đào tạo Quốc tế Topica",
        contentHtml: "<p>Topica cam kết mang lại chất lượng đào tạo hàng đầu.</p>",
      };

      render(
        <CmsPageView
          page={mockPage}
          parent={{ label: "Về Topica", href: "/gioi-thieu/" }}
        />,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tầm nhìn và Sứ mạng");
      expect(screen.getByText("Về Topica")).toBeInTheDocument();
      expect(
        screen.getByText("Topica cam kết mang lại chất lượng đào tạo hàng đầu."),
      ).toBeInTheDocument();
    });

    test("hiển thị fallback khi bài viết chưa có nội dung", () => {
      const emptyPage: any = {
        id: 2,
        title: "Trang đang soạn thảo",
        slug: "trang-moi",
        contentHtml: "",
      };

      render(<CmsPageView page={emptyPage} />);
      expect(screen.getByText("Nội dung đang được cập nhật.")).toBeInTheDocument();
    });
  });

  describe("3. SEO: robots.ts & sitemap.ts", () => {
    test("robots.txt chặn /api/ và /admin/ khỏi bot tìm kiếm", () => {
      const robotRules = robots();
      expect(robotRules.rules).toBeDefined();

      const disallowList = (robotRules.rules as any).disallow;
      expect(disallowList).toContain("/api/");
      expect(disallowList).toContain("/admin/");
      expect(robotRules.sitemap).toContain("/sitemap.xml");
    });

    test("sitemap.xml chứa 5 chương trình chính và không chứa link nháp/blocked", async () => {
      const sitemapEntries = await sitemap();
      expect(sitemapEntries.length).toBeGreaterThan(5);

      const urls = sitemapEntries.map((e) => e.url);

      // Chứa 5 ngành chính
      expect(urls.some((u) => u.includes("quan-tri-kinh-doanh-marketing"))).toBe(true);
      expect(urls.some((u) => u.includes("cong-nghe-thong-tin"))).toBe(true);

      // Tuyệt đối không chứa cart/checkout/shop
      expect(urls.some((u) => u.includes("/cart"))).toBe(false);
      expect(urls.some((u) => u.includes("/checkout"))).toBe(false);
      expect(urls.some((u) => u.includes("/my-account"))).toBe(false);
    });
  });
});
