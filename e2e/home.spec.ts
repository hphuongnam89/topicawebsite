import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the conversion path without horizontal overflow", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Topica/);
    await expect(
      page.getByRole("heading", { name: /Hoàn thiện bằng đại học/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Nhận tư vấn theo hồ sơ của bạn" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chương trình đào tạo" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "5 bước để bắt đầu" }),
    ).toBeVisible();

    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport?.width ?? scrollWidth);
  });

  test("validates the lead form before submission", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Nhận lộ trình & học phí" }).first().click();

    await expect(page.getByRole("alert")).toContainText("Vui lòng kiểm tra lại thông tin");
    await expect(page.getByLabel(/Họ tên/)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  test("desktop navigation exposes its mega menu", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop navigation only");

    await page.goto("/");
    const programsMenu = page.getByRole("button", { name: "Ngành đào tạo" });
    await programsMenu.hover();

    await expect(programsMenu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Quản Trị Kinh Doanh/ }).first()).toBeVisible();
  });
});
