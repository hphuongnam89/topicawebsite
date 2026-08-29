import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { LeadForm } from "@/components/forms/LeadForm";

describe("LeadForm", () => {
  test("shows field errors and does not submit empty data", async () => {
    const onSubmit = vi.fn();

    render(<LeadForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký tư vấn miễn phí" }));

    await waitFor(() => {
      expect(screen.getByText("Vui lòng kiểm tra lại thông tin bên dưới.")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Họ tên/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Số điện thoại/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Ngành quan tâm/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Trình độ học vấn hiện tại/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
