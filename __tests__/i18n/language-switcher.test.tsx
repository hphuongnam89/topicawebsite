import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { translateText, translateHtml } from "@/lib/i18n/translate";
import { localizedPath } from "@/lib/i18n/routes";
import { programs } from "@/data/programs";
import Link from "@/components/i18n/LocalizedLink";

afterEach(cleanup);

function ExistingPage() {
  const [value, setValue] = useState("");
  return <>
    <LanguageSwitcher />
    <section className="existing-layout" data-testid="page">
      <h1><LocalizedText>Quản trị kinh doanh</LocalizedText></h1>
      <Link href="/tuyen-sinh/"><LocalizedText>Đăng ký xét tuyển</LocalizedText></Link>
      <LocalizedElement as="input" aria-label="Họ tên" placeholder="Nhập họ tên của bạn" value={value} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)} />
      <details open><summary><LocalizedText>Thông tin chi tiết</LocalizedText></summary><p><LocalizedText>Học phí</LocalizedText></p></details>
      <img src="/images/programs/program-business.webp" alt="Business" />
    </section>
  </>;
}

describe("language switching preserves the existing page", () => {
  it("changes only text and language preference, keeping elements, input, links and open panels", () => {
    window.history.replaceState({}, "", "/quan-tri-kinh-doanh-marketing?category=kept#chuong-trinh");
    render(<LanguageProvider initialLocale="vi"><ExistingPage /></LanguageProvider>);
    const page = screen.getByTestId("page");
    const input = screen.getByRole("textbox");
    const originalHref = page.querySelector("a")!.getAttribute("href");
    fireEvent.change(input, { target: { value: "QA existing input" } });
    const structure = page.innerHTML.replace(/>[^<]*</g, "><").replace(/(?:aria-label|placeholder)="[^"]*"/g, "");
    fireEvent.click(screen.getByRole("button", { name: "Read this page in English" }));
    expect(screen.getByRole("heading").textContent).toBe("Business Administration");
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input).toHaveValue("QA existing input");
    expect(input).toHaveAttribute("placeholder", "Enter your full name");
    expect(page.querySelector("details")).toHaveAttribute("open");
    expect(page.querySelector("a")).toHaveAttribute("href", originalHref);
    expect(page.querySelector("img")).toHaveAttribute("src", "/images/programs/program-business.webp");
    expect(window.location.pathname).toBe("/quan-tri-kinh-doanh-marketing");
    expect(window.location.search).toBe("?category=kept&lang=en");
    expect(window.location.hash).toBe("#chuong-trinh");
    expect(document.documentElement.lang).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Đọc trang này bằng tiếng Việt" }));
    expect(screen.getByRole("heading").textContent).toBe("Quản trị kinh doanh");
    expect(input).toHaveValue("QA existing input");
    expect(document.documentElement.lang).toBe("vi");
    expect(page.innerHTML.replace(/>[^<]*</g, "><").replace(/(?:aria-label|placeholder)="[^"]*"/g, "")).toBe(structure);
  });

  it("uses the same elements when initially opened in English", () => {
    render(<LanguageProvider initialLocale="en"><ExistingPage /></LanguageProvider>);
    expect(screen.getByRole("heading").textContent).toBe("Business Administration");
    expect(screen.getByTestId("page").children.length).toBe(5);
  });

  it("keeps original data and whitespace and translates split hero headings", () => {
    expect(translateText(" \nHỌC CHỦ ĐỘNG  ", "en")).toBe(" \nLEARN YOUR WAY  ");
    expect(translateText("126", "en")).toBe("126");
    expect(translateText("Phạm Duy Khánh", "en")).toBe("Phạm Duy Khánh");
    expect(translateText("Học phí", "vi")).toBe("Học phí");
    const html = '<h2 class="kept">Học phí &amp; Học bổng</h2><a href="/lien-he">Liên hệ</a><img src="/pxu.jpg">';
    expect(translateHtml(html, "en")).toBe('<h2 class="kept">Tuition &amp; Scholarships</h2><a href="/lien-he">Contact</a><img src="/pxu.jpg">');
    expect(translateHtml(html, "vi")).toBe(html);
  });

  it("old EN links return to the equivalent existing route for all programmes and other pages", () => {
    for (const program of programs) {
      expect(localizedPath(`/en/programs/${program.id}`, "vi")).toBe(program.href);
      expect(localizedPath(program.href, "en")).toBe(`/en/programs/${program.id}`);
    }
    expect(localizedPath("/en/contact", "vi")).toBe("/lien-he");
    expect(localizedPath("/en/about", "vi")).toBe("/gioi-thieu");
    expect(localizedPath("/en/tuition", "vi")).toBe("/tuyen-sinh/hoc-phi-hoc-bong");
    expect(localizedPath("/en/tin-tuc/a", "vi")).toBe("/tin-tuc/a");
    expect(localizedPath("/en/contact", "en")).toBe("/en/contact");
  });
});
