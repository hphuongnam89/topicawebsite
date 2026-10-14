import { describe, expect, it } from "vitest";
import { generateSlug, escapeCsvCell } from "@/lib/utils";
import { translateText, reverseTranslateText } from "@/lib/i18n/translate";
import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";
import { generateMetadata as generateContactMetadata } from "@/app/(main)/lien-he/page";
import { generateMetadata as generateProgramsMetadata } from "@/app/(main)/nganh-dao-tao/page";
import { generateMetadata as generateEnglishCatchallMetadata } from "@/app/en/[...slug]/page";

import { env } from "@/lib/env";

const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

describe("Frontend Audit Remediation — F-01: Metadata, Canonical & Hreflang Localization", () => {
  it("buildLocalizedMetadata produces consistent canonical and hreflang for English", () => {
    const meta = buildLocalizedMetadata({
      locale: "en",
      title: "Liên hệ",
      description: "Học chủ động",
      viPath: "/lien-he",
      enPath: "/en/contact",
    });

    expect(meta.title).toBe("Contact");
    expect(meta.description).toBe("Learn your way");
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/en/contact`);
    expect(meta.alternates?.languages?.vi).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.en).toBe(`${siteUrl}/en/contact`);
    expect(meta.alternates?.languages?.["x-default"]).toBe(`${siteUrl}/lien-he`);
    expect(meta.openGraph?.locale).toBe("en_US");
    expect(meta.openGraph?.title).toBe("Contact");
  });

  it("buildLocalizedMetadata produces consistent canonical and hreflang for Vietnamese", () => {
    const meta = buildLocalizedMetadata({
      locale: "vi",
      title: "Liên hệ",
      description: "Học chủ động",
      viPath: "/lien-he",
      enPath: "/en/contact",
    });

    expect(meta.title).toBe("Liên hệ");
    expect(meta.description).toBe("Học chủ động");
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.vi).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.en).toBe(`${siteUrl}/en/contact`);
    expect(meta.openGraph?.locale).toBe("vi_VN");
    expect(meta.openGraph?.title).toBe("Liên hệ");
  });

  it("resolveRequestLocale extracts locale from Promise or object searchParams", async () => {
    expect(await resolveRequestLocale(Promise.resolve({ lang: "en" }))).toBe("en");
    expect(await resolveRequestLocale(Promise.resolve({ lang: "vi" }))).toBe("vi");
    expect(await resolveRequestLocale({ lang: "en" })).toBe("en");
    expect(await resolveRequestLocale({ lang: "vi" })).toBe("vi");
    expect(await resolveRequestLocale(Promise.resolve({}))).toBe("vi");
    expect(await resolveRequestLocale(undefined)).toBe("vi");
  });

  it("generates English metadata on /lien-he when ?lang=en is present", async () => {
    const meta = await generateContactMetadata({
      searchParams: Promise.resolve({ lang: "en" }),
    });

    expect(meta.title).toMatch(/Contact/i);
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/en/contact`);
    expect(meta.openGraph?.locale).toBe("en_US");
  });

  it("generates English metadata on /nganh-dao-tao when ?lang=en is present", async () => {
    const meta = await generateProgramsMetadata({
      searchParams: Promise.resolve({ lang: "en" }),
    });

    expect(meta.title).toMatch(/Online Bachelor’s Programmes/i);
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/en/programs`);
    expect(meta.openGraph?.locale).toBe("en_US");
  });

  it("generates proper metadata on /en/contact catchall route", async () => {
    const meta = await generateEnglishCatchallMetadata({
      params: Promise.resolve({ slug: ["contact"] }),
    });

    expect(meta.title).toBe("Contact");
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/en/contact`);
    expect(meta.alternates?.languages?.vi).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.en).toBe(`${siteUrl}/en/contact`);
  });
});

describe("Frontend Audit Remediation — F-03: Program Card Accessible Alt Text and I18n", () => {
  it("translates program illustration alts to English accurately", () => {
    expect(translateText("Ảnh minh họa cho ngành Quản trị kinh doanh", "en")).toBe(
      "Illustration for Business Administration",
    );
    expect(translateText("Ảnh minh họa cho ngành Quản trị du lịch và lữ hành", "en")).toBe(
      "Illustration for Tourism and Travel Management",
    );
    expect(translateText("Ảnh minh họa cho ngành Công nghệ thông tin", "en")).toBe(
      "Illustration for Information Technology",
    );
    expect(translateText("Ảnh minh họa cho ngành Ngôn ngữ Anh", "en")).toBe(
      "Illustration for English Language",
    );
    expect(translateText("Ảnh minh họa cho ngành Ngôn ngữ Trung Quốc", "en")).toBe(
      "Illustration for Chinese Language",
    );
  });

  it("translates program explore aria-labels to English accurately", () => {
    expect(translateText("Tìm hiểu chương trình Quản trị kinh doanh", "en")).toBe(
      "Explore Business Administration",
    );
    expect(translateText("Tìm hiểu chương trình Công nghệ thông tin", "en")).toBe(
      "Explore Information Technology",
    );
  });

  it("handles title with Topica suffix translation in both directions", () => {
    expect(translateText("Liên hệ | Topica", "en")).toBe("Contact | Topica");
    expect(reverseTranslateText("Contact | Topica")).toBe("Liên hệ | Topica");
    expect(reverseTranslateText("Business Administration")).toBe("Quản trị kinh doanh");
  });
});

describe("Frontend Audit Remediation — F-04: Shared Helpers between Production and Tests", () => {
  it("generateSlug converts Vietnamese diacritics and special characters correctly", () => {
    expect(generateSlug("Thông Tin Tuyển Sinh & Đào Tạo")).toBe("thong-tin-tuyen-sinh-dao-tao");
    expect(generateSlug("Đại Học Phú Xuân — 2026")).toBe("dai-hoc-phu-xuan-2026");
    expect(generateSlug("Quản trị kinh doanh & Marketing")).toBe("quan-tri-kinh-doanh-marketing");
  });

  it("escapeCsvCell prevents CSV injection and handles quotes", () => {
    expect(escapeCsvCell("Topica Education")).toBe('"Topica Education"');
    expect(escapeCsvCell('Hello "World"')).toBe('"Hello ""World"""');
    expect(escapeCsvCell("=CMD('calc')")).toBe("\"'=CMD('calc')\"");
    expect(escapeCsvCell("+123456789")).toBe('"\'+123456789"');
    expect(escapeCsvCell("-500")).toBe('"\'-500"');
    expect(escapeCsvCell("@admin")).toBe('"\'@admin"');
  });
});
