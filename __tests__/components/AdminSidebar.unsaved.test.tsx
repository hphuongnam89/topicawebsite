import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/content",
  useRouter: () => ({ push, refresh: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  push.mockReset();
});

test("blocks sidebar navigation when the workbench reports unsaved changes", () => {
  render(<AdminSidebar user={{ name: "QA Admin", username: "qa-admin", role: "admin" }} />);
  act(() => {
    window.dispatchEvent(new CustomEvent("topica:unsaved-changes", { detail: { dirty: true } }));
  });
  vi.spyOn(window, "confirm").mockReturnValue(false);

  const link = screen.getByRole("link", { name: "Tổng quan" });
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  act(() => {
    link.dispatchEvent(event);
  });

  expect(event.defaultPrevented).toBe(true);
  expect(window.confirm).toHaveBeenCalled();
});
