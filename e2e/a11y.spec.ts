import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("core pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/tuyen-sinh/", "/lien-he/", "/admin/login", "/tin-tuc/", "/en/"]) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForTimeout(150);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(serious, `${path}: ${JSON.stringify(serious)}`).toEqual([]);
  }
});
