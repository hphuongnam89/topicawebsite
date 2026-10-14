import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentCard } from "@/components/ui/DocumentCard";

describe("Task R06: DocumentCard Component", () => {
  test("hiển thị tiêu đề, loại tài liệu và ngày ban hành", () => {
    render(
      <DocumentCard
        title="Quyết định ban hành Đề án tuyển sinh 2026"
        type="Đề án tuyển sinh"
        date="Ban hành: 15/01/2026"
      />,
    );

    expect(screen.getByText("Quyết định ban hành Đề án tuyển sinh 2026")).toBeDefined();
    expect(screen.getByText("Đề án tuyển sinh")).toBeDefined();
    expect(screen.getByText("Ban hành: 15/01/2026")).toBeDefined();
  });

  test("hiển thị 'Bản số đang cập nhật' khi không có link xem hoặc tải", () => {
    render(<DocumentCard title="Biểu mẫu lưu hành nội bộ" />);

    expect(screen.getByText("Bản số đang cập nhật")).toBeDefined();
    expect(screen.queryByText("Tải xuống")).toBeNull();
    expect(screen.queryByText("Xem")).toBeNull();
  });

  test("tự động bỏ qua nút tải xuống khi downloadUrl là '#' hoặc rỗng", () => {
    render(
      <DocumentCard
        title="Thông tư pháp lý"
        viewUrl="/chat-luong-dao-tao/"
        downloadUrl="#"
        fileSize="1.5 MB PDF"
      />,
    );

    // Không render nút tải xuống với '#'
    expect(screen.queryByText("Tải xuống")).toBeNull();
    // Không render dung lượng giả khi không có download thực
    expect(screen.queryByText("1.5 MB PDF")).toBeNull();
    // Vẫn hiển thị nút Xem văn bản hợp lệ
    expect(screen.getByText("Xem văn bản")).toBeDefined();
  });

  test("hiển thị nút tải xuống khi có file downloadUrl thực tế", () => {
    render(
      <DocumentCard
        title="Mẫu phôi bằng Cử nhân"
        downloadUrl="/official-assets/mau-phoi-bang.png"
        fileSize="1.6 MB PNG"
      />,
    );

    expect(screen.getByText("Tải xuống")).toBeDefined();
    expect(screen.getByText("1.6 MB PNG")).toBeDefined();
  });
});
