import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { LeadForm } from "@/components/forms/LeadForm";

describe("LeadForm", () => {
  test("shows field errors and does not submit empty data", async () => {
    const onSubmit = vi.fn();

    render(<LeadForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra điều kiện & nhận lộ trình/ }));

    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập họ tên")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng đồng ý với chính sách bảo mật")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Họ tên/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Số điện thoại/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });
  test("reports submission failure without clearing the user's fields", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("offline"));
    render(<LeadForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Họ tên/), { target: { value: "Nguyen Test" } });
    fireEvent.change(screen.getByLabelText(/Số điện thoại/), { target: { value: "0912345678" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra điều kiện/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể gửi thông tin lúc này");
    expect(screen.getByLabelText(/Họ tên/)).toHaveValue("Nguyen Test");
    expect(screen.getByLabelText(/Số điện thoại/)).toHaveValue("0912345678");
    expect(screen.getByRole("button", { name: /Kiểm tra điều kiện/ })).toBeEnabled();
  });
});
