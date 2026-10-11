import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";
import {
  Button,
  ButtonLink,
  Badge,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  EmptyState,
  Skeleton,
  SkeletonText,
  DocumentCard,
  Pagination,
} from "@/components/ui";

describe("Design System Components (Phase 3)", () => {
  describe("Button Component", () => {
    test("renders primary navy button correctly", () => {
      render(<Button variant="primary">Nộp hồ sơ</Button>);
      const btn = screen.getByRole("button", { name: "Nộp hồ sơ" });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain("bg-navy-900");
    });

    test("renders accent gold button correctly", () => {
      render(<Button variant="accent">Đăng ký xét tuyển</Button>);
      const btn = screen.getByRole("button", { name: "Đăng ký xét tuyển" });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain("bg-gold-500");
    });

    test("handles disabled and loading state", () => {
      render(
        <Button loading disabled>
          Đang xử lý
        </Button>,
      );
      const btn = screen.getByRole("button", { name: "Đang xử lý" });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Badge & StatusBadge Component", () => {
    test("renders verified status badge with accessible label", () => {
      render(<StatusBadge variant="verified" />);
      expect(screen.getByText("Đã kiểm định")).toBeInTheDocument();
    });

    test("renders active admission badge", () => {
      render(<StatusBadge variant="active" />);
      expect(screen.getByText("Đang tuyển sinh")).toBeInTheDocument();
    });

    test("renders Badge variants with custom text", () => {
      render(<Badge variant="navy">Topica Uni</Badge>);
      expect(screen.getByText("Topica Uni")).toBeInTheDocument();
    });
  });

  describe("Card Component", () => {
    test("renders Card with Header, Title and Description", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Công nghệ thông tin</CardTitle>
            <CardDescription>Chuyên ngành Đồ hoạ kỹ thuật số</CardDescription>
          </CardHeader>
          <CardContent>132 tín chỉ</CardContent>
        </Card>,
      );
      expect(screen.getByText("Công nghệ thông tin")).toBeInTheDocument();
      expect(
        screen.getByText("Chuyên ngành Đồ hoạ kỹ thuật số"),
      ).toBeInTheDocument();
      expect(screen.getByText("132 tín chỉ")).toBeInTheDocument();
    });
  });

  describe("Alert Component", () => {
    test("renders warning alert with title and content", () => {
      render(
        <Alert variant="warning" title="Hạn nộp hồ sơ">
          Hạn chót ngày 30/10/2026
        </Alert>,
      );
      expect(screen.getByText("Hạn nộp hồ sơ")).toBeInTheDocument();
      expect(screen.getByText("Hạn chót ngày 30/10/2026")).toBeInTheDocument();
    });
  });

  describe("EmptyState Component", () => {
    test("renders empty state with recovery link", () => {
      render(
        <EmptyState
          title="Không tìm thấy ngành học"
          description="Vui lòng thử tìm kiếm với từ khóa khác."
          actionHref="/nganh-dao-tao"
          actionLabel="Xem 5 ngành đào tạo"
        />,
      );
      expect(screen.getByText("Không tìm thấy ngành học")).toBeInTheDocument();
      const link = screen.getByRole("link", { name: "Xem 5 ngành đào tạo" });
      expect(link).toHaveAttribute("href", "/nganh-dao-tao");
    });
  });

  describe("Skeleton Component", () => {
    test("renders skeleton placeholder with aria-hidden", () => {
      const { container } = render(<Skeleton className="h-6 w-24" />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute("aria-hidden", "true");
      expect(el.className).toContain("animate-pulse");
    });
  });

  describe("DocumentCard Component", () => {
    test("renders academic document card with title, type and date", () => {
      render(
        <DocumentCard
          title="Quy chế đào tạo từ xa trình độ đại học"
          type="Quy chế đào tạo"
          date="Ban hành: 10/01/2026"
          fileSize="1.5 MB PDF"
          viewUrl="/chat-luong-dao-tao"
          downloadUrl="/files/quy-che.pdf"
        />,
      );
      expect(screen.getByText("Quy chế đào tạo từ xa trình độ đại học")).toBeInTheDocument();
      expect(screen.getByText("Quy chế đào tạo")).toBeInTheDocument();
      expect(screen.getByText("Ban hành: 10/01/2026")).toBeInTheDocument();
      expect(screen.getByLabelText("Xem tài liệu: Quy chế đào tạo từ xa trình độ đại học")).toBeInTheDocument();
      expect(screen.getByLabelText("Tải xuống: Quy chế đào tạo từ xa trình độ đại học")).toBeInTheDocument();
    });
  });

  describe("Pagination Component", () => {
    test("renders navigation controls with active page and page links", () => {
      render(
        <Pagination
          currentPage={2}
          totalPages={5}
          baseUrl="/tin-tuc"
        />,
      );
      expect(screen.getByRole("navigation", { name: "Điều hướng trang" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Trang trước" })).toHaveAttribute("href", "/tin-tuc?page=1");
      expect(screen.getByRole("link", { name: "Trang tiếp theo" })).toHaveAttribute("href", "/tin-tuc?page=3");
    });
  });
});
