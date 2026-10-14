import { describe, expect, test } from "vitest";
import { shouldHideExpiredUrgentNotice } from "@/lib/news/homepage-freshness";

describe("homepage news freshness", () => {
  const reviewDate = new Date(2026, 9, 12);

  test("hides a dated enrollment alert after its stated intake date", () => {
    expect(
      shouldHideExpiredUrgentNotice(
        "Chỉ còn 2 ngày đăng ký nhập học lớp khai giảng ngày 20/07/2026",
        "Thông báo nhập học lớp khai giảng ngày 20/07/2026",
        reviewDate,
      ),
    ).toBe(true);
  });

  test("keeps ordinary archive stories and future notices", () => {
    expect(
      shouldHideExpiredUrgentNotice(
        "Học phí một kỳ đại học tại Topica",
        "Ngày 14/07/2026",
        reviewDate,
      ),
    ).toBe(false);
    expect(
      shouldHideExpiredUrgentNotice(
        "Đăng ký trước hạn để dự khai giảng ngày 20/12/2026",
        "",
        reviewDate,
      ),
    ).toBe(false);
  });
});
