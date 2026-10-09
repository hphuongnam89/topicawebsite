import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DegreeImage } from "@/components/ui/DegreeImage";

vi.mock("next/image", () => ({
  default: ({ unoptimized, fill: _fill, ...props }: { unoptimized?: boolean; fill?: boolean }) => (
    // Exercise both the optimized request and original-file fallback.
    // eslint-disable-next-line jsx-a11y/alt-text
    <img {...props} data-original={String(Boolean(unoptimized))} />
  ),
}));

describe("DegreeImage", () => {
  test("removes loading feedback only after the image loads", () => {
    render(<DegreeImage />);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải");
    fireEvent.load(screen.getByRole("img"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("falls back to the original, reports failure, and permits retry", () => {
    render(<DegreeImage />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute("data-original", "true");
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("alert")).toHaveTextContent("Chưa tải được");
    expect(screen.getByRole("link", { name: "Mở ảnh gốc" })).toHaveAttribute(
      "href",
      "/official-assets/mau-phoi-bang.png",
    );
    fireEvent.click(screen.getByRole("button", { name: "Thử tải lại" }));
    fireEvent.load(screen.getByRole("img"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
