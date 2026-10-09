import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the conversion path without horizontal overflow", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Topica/);
    await expect(page.getByRole("heading", { name: /Hoàn thiện bằng đại học/ })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Nhận tư vấn theo hồ sơ của bạn" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chương trình đào tạo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bạn có phù hợp không?" })).toBeVisible();

    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport?.width ?? scrollWidth);
  });

  test("validates the lead form before submission", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("form")
      .getByRole("button", { name: /Kiểm tra điều kiện|Nhận tư vấn/ })
      .click();

    await expect(page.locator("#fullName-error")).toContainText("Vui lòng nhập họ tên");
    await expect(page.locator("#consent-error")).toContainText("Vui lòng đồng ý");
    await expect(page.getByLabel(/Họ tên/)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  test("analytics waits for consent and supports withdrawal", async ({ page }) => {
    const analyticsRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/public/hit") || request.url().includes("/api/public/event"))
        analyticsRequests.push(request.url());
    });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Cho phép" })).toBeVisible();
    await page.waitForTimeout(300);
    expect(analyticsRequests).toEqual([]);
    await page.getByRole("button", { name: "Cho phép" }).click();
    await expect(page.getByRole("button", { name: "Cài đặt đo lường" })).toBeVisible();
    await page.waitForTimeout(300);
    analyticsRequests.length = 0;
    await page.getByRole("button", { name: "Cài đặt đo lường" }).click();
    await page.getByRole("button", { name: "Rút lại / từ chối" }).click();
    await expect(page.getByRole("button", { name: "Cài đặt đo lường" })).toBeVisible();
    await page.reload();
    await page.waitForTimeout(300);
    expect(analyticsRequests).toEqual([]);
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
