import { describe, expect, it } from "vitest";
import { buildLocalizedMetadata, resolveRequestLocale } from "@/lib/i18n/metadata";
import { translateText } from "@/lib/i18n/translate";
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";
import { env } from "@/lib/env";

describe("Localized Metadata and Canonical Hreflang", () => {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  it("resolves locale from searchParams", async () => {
    expect(await resolveRequestLocale(Promise.resolve({ lang: "en" }))).toBe("en");
    expect(await resolveRequestLocale(Promise.resolve({ lang: "vi" }))).toBe("vi");
    expect(await resolveRequestLocale(Promise.resolve({}))).toBe("vi");
    expect(await resolveRequestLocale(undefined)).toBe("vi");
  });

  it("builds correct Vietnamese metadata with reciprocal hreflang", () => {
    const meta = buildLocalizedMetadata({
      locale: "vi",
      title: "Liên hệ",
      description: "Trao đổi về ngành học",
      viPath: "/lien-he",
      enPath: "/en/contact",
    });

    expect(meta.title).toBe("Liên hệ");
    expect(meta.description).toBe("Trao đổi về ngành học");
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.vi).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.en).toBe(`${siteUrl}/en/contact`);
    expect(meta.openGraph?.locale).toBe("vi_VN");
    expect(meta.openGraph?.title).toBe("Liên hệ");
    expect(meta.openGraph?.url).toBe(`${siteUrl}/lien-he`);
  });

  it("builds correct English metadata with translated title, English canonical and OG", () => {
    const meta = buildLocalizedMetadata({
      locale: "en",
      title: "Liên hệ",
      description: "Trao đổi về ngành học",
      viPath: "/lien-he",
      enPath: "/en/contact",
    });

    expect(meta.title).toBe("Contact");
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/en/contact`);
    expect(meta.alternates?.languages?.vi).toBe(`${siteUrl}/lien-he`);
    expect(meta.alternates?.languages?.en).toBe(`${siteUrl}/en/contact`);
    expect(meta.openGraph?.locale).toBe("en_US");
    expect(meta.openGraph?.title).toBe("Contact");
    expect(meta.openGraph?.url).toBe(`${siteUrl}/en/contact`);
  });

  it("translates composite titles with Topica suffix", () => {
    expect(translateText("Liên hệ | Topica", "en")).toBe("Contact | Topica");
    expect(translateText("Tuyển sinh | Topica", "en")).toBe("Admissions | Topica");
    expect(translateText("Học phí & Học bổng | Topica", "en")).toBe(
      "Tuition & Scholarships | Topica",
    );
    expect(translateText("Giới thiệu | Topica", "en")).toBe("About | Topica");
  });

  it("translates program illustration alt texts", () => {
    expect(translateText("Ảnh minh họa cho ngành Quản trị kinh doanh", "en")).toBe(
      "Illustration for Business Administration",
    );
    expect(translateText("Ảnh minh họa cho ngành Ngôn ngữ Anh", "en")).toBe(
      "Illustration for English Language",
    );
  });
});

describe("Proxy English Route Rewrites", () => {
  it("rewrites /en/contact to /lien-he?lang=en with x-topica-locale header", () => {
    const req = new NextRequest("http://localhost:3000/en/contact");
    const res = proxy(req);

    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/lien-he?lang=en");
    expect(res.headers.get("x-topica-locale")).toBe("en");
    expect(res.headers.get("x-pathname")).toBe("/en/contact");
  });

  it("rewrites /en to /?lang=en with x-topica-locale header", () => {
    const req = new NextRequest("http://localhost:3000/en");
    const res = proxy(req);

    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/?lang=en");
    expect(res.headers.get("x-topica-locale")).toBe("en");
    expect(res.headers.get("x-pathname")).toBe("/en");
  });

  it("rewrites /en/programs/it to correct Vietnamese program slug with lang=en", () => {
    const req = new NextRequest("http://localhost:3000/en/programs/it");
    const res = proxy(req);

    expect(res.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/cong-nghe-thong-tin?lang=en",
    );
    expect(res.headers.get("x-topica-locale")).toBe("en");
  });

  it("passes /lien-he through normally with x-topica-locale vi", () => {
    const req = new NextRequest("http://localhost:3000/lien-he");
    const res = proxy(req);

    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("x-topica-locale")).toBe("vi");
    expect(res.headers.get("x-pathname")).toBe("/lien-he");
  });
});
