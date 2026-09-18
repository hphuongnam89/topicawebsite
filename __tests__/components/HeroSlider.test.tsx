import { fireEvent, render, screen, act } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { HeroSlider } from "@/components/sections/HeroSlider";

describe("HeroSlider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders all 3 full width slides and navigation dots", () => {
    render(<HeroSlider />);

    // Check full-width hero slider container
    expect(screen.getByRole("region", { name: /Hero banner carousel/i })).toBeInTheDocument();

    // Check slide 1 content (Heading & Form)
    expect(screen.getByRole("heading", { name: /Hoàn thiện bằng đại học/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nhận tư vấn theo hồ sơ của bạn" })).toBeInTheDocument();

    // Check navigation buttons
    expect(screen.getByRole("button", { name: "Slide trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slide tiếp theo" })).toBeInTheDocument();

    // Check 3 dots tabs
    expect(screen.getByRole("tab", { name: /Đăng ký tư vấn/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Tuyển sinh mới nhất/i })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: /Học bổng QTKD 30%/i })).toHaveAttribute("aria-selected", "false");
  });

  test("clicking navigation dots switches slides", () => {
    render(<HeroSlider />);

    // Click on slide 2 (Học bổng QTKD 30%)
    fireEvent.click(screen.getByRole("tab", { name: /Học bổng QTKD 30%/i }));
    expect(screen.getByRole("tab", { name: /Học bổng QTKD 30%/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Đăng ký tư vấn/i })).toHaveAttribute("aria-selected", "false");

    // Click on slide 1 (Tuyển sinh mới nhất)
    fireEvent.click(screen.getByRole("tab", { name: /Tuyển sinh mới nhất/i }));
    expect(screen.getByRole("tab", { name: /Tuyển sinh mới nhất/i })).toHaveAttribute("aria-selected", "true");
  });

  test("auto advances slide every 2 seconds", () => {
    render(<HeroSlider />);

    // Initially on slide 0
    expect(screen.getByRole("tab", { name: /Đăng ký tư vấn/i })).toHaveAttribute("aria-selected", "true");

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should be on slide 1
    expect(screen.getByRole("tab", { name: /Tuyển sinh mới nhất/i })).toHaveAttribute("aria-selected", "true");

    // Fast-forward another 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should be on slide 2
    expect(screen.getByRole("tab", { name: /Học bổng QTKD 30%/i })).toHaveAttribute("aria-selected", "true");

    // Fast-forward another 2 seconds (loop back to slide 0)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("tab", { name: /Đăng ký tư vấn/i })).toHaveAttribute("aria-selected", "true");
  });

  test("pauses auto advance when hovered", () => {
    render(<HeroSlider />);

    const slider = screen.getByRole("region", { name: /Hero banner carousel/i });

    // Hover mouse
    fireEvent.mouseEnter(slider);

    // Fast-forward 4 seconds while hovered
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Should still be on slide 0
    expect(screen.getByRole("tab", { name: /Đăng ký tư vấn/i })).toHaveAttribute("aria-selected", "true");

    // Leave mouse
    fireEvent.mouseLeave(slider);

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now it advances
    expect(screen.getByRole("tab", { name: /Tuyển sinh mới nhất/i })).toHaveAttribute("aria-selected", "true");
  });
});
