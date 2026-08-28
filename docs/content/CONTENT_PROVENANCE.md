# Content Provenance Register

> Last updated: 2026-08-28

This document tracks the source and verification status of all public-facing content claims on the Topica website.

## Provenance Status Legend

| Status | Meaning |
|--------|---------|
| ✅ verified | Content confirmed against official source |
| ❌ missing | No official source found; section hidden or placeholder shown |
| ⏳ pending owner approval | Content exists but needs owner sign-off |

---

## Homepage (`/`)

| Section | Claim / Content | Source URL / API | Status | Date |
|---------|----------------|------------------|--------|------|
| HeroSection | "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest" | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| HeroSection | "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận" | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| HeroSection | Background image URL | https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg | ✅ verified | 2026-08-28 |
| HeroSection | CTA "Đăng ký xét tuyển" → tuyensinh.topicauni.edu.vn | https://www.tuyensinh.topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| TrustSection | "Trực thuộc ĐH Phú Xuân" | https://topicauni.edu.vn/ (text in footer/header) | ✅ verified | 2026-08-28 |
| TrustSection | "Bằng cấp được Bộ GD&ĐT công nhận" | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| TrustSection | "Đào tạo từ xa" | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| TrustSection | "Đại học 3 năm" | https://topicauni.edu.vn/ (hero banner) | ✅ verified | 2026-08-28 |
| TrustSection | "6 trung tâm toàn quốc" | https://topicauni.edu.vn/ (footer addresses) | ✅ verified | 2026-08-28 |
| TrustSection | "Thành viên EQuest" | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |
| TrustSection | ~~"15,000+ sinh viên"~~ | Not found on live site | ❌ missing — removed | 2026-08-28 |
| TrustSection | ~~"9 ngành đào tạo"~~ | Live site says "5 Ngành" | ❌ missing — removed | 2026-08-28 |
| ProgramsSection | 9 program names & slugs | https://topicauni.edu.vn/ (homepage program carousel) | ⏳ pending owner approval | 2026-08-28 |
| ProgramsSection | Short descriptions per program | Generated descriptions, not from official source | ⏳ pending owner approval | 2026-08-28 |
| TestimonialSection | ~~"Nguyễn Văn A", "Trần Thị B" etc.~~ | Mock data — no real source | ❌ missing — section hidden | 2026-08-28 |
| AdmissionTimeline | 5-step admission process | Generic process, not a legal claim | ✅ verified | 2026-08-28 |
| CampusSection | 6 campus addresses | https://topicauni.edu.vn/ (footer) | ✅ verified | 2026-08-28 |
| CampusSection | Phone: 0901795580 | https://topicauni.edu.vn/ (footer icon link) | ✅ verified | 2026-08-28 |
| CampusSection | Email: info@topicauni.edu.vn | https://topicauni.edu.vn/ (footer icon link) | ✅ verified | 2026-08-28 |
| CampusSection | ~~Per-campus phone/email (1900.1234 etc.)~~ | Not found on live site | ❌ missing — removed | 2026-08-28 |
| WhyTopicaSection | Feature descriptions | Generic marketing copy | ⏳ pending owner approval | 2026-08-28 |
| AdmissionCTA | CTA text & links | Internal navigation | ✅ verified | 2026-08-28 |
| NewsPreview | Articles from WordPress | WP REST API `/wp-json/wp/v2/posts` | ✅ verified | 2026-08-28 |
| JSON-LD | Organization name, logo, sameAs | https://topicauni.edu.vn/ | ✅ verified | 2026-08-28 |

---

## `/tuyen-sinh`

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| Full page | WordPress page content | WP REST API page ID 410, slug `tuyen-sinh` | ✅ verified | 2026-08-28 |

---

## `/gioi-thieu`

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| Full page | WordPress page content | WP REST API page ID 404, slug `gioi-thieu` | ✅ verified | 2026-08-28 |

---

## `/nhung-cau-hoi-thuong-gap`

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| Full page | WordPress page content | WP REST API, slug `nhung-cau-hoi-thuong-gap` | ✅ verified | 2026-08-28 |

---

## `/lien-he`

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| Full page | WordPress page content | WP REST API, slug `lien-he` | ✅ verified | 2026-08-28 |

---

## `/tin-tuc` and article routes

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| News index | Post listings | WP REST API `/wp-json/wp/v2/posts` | ✅ verified | 2026-08-28 |
| Article detail | Post content | WP REST API per-post slug | ✅ verified | 2026-08-28 |
| Categories | Category data | WP REST API `/wp-json/wp/v2/categories` | ✅ verified | 2026-08-28 |

---

## Catch-all `[...slug]` routes

| Section | Content | Source | Status | Date |
|---------|---------|--------|--------|------|
| CMS pages | WordPress page by path | WP REST API `pages?slug=<path>` | ✅ verified | 2026-08-28 |
| Navigation hubs | Hub layout from NAVIGATION.json | `data/navigation.ts` | ✅ verified | 2026-08-28 |

---

## Content Gaps (Blocking Items)

| Route | Gap | Required Action | Owner |
|-------|-----|-----------------|-------|
| All program detail pages (`/quan-tri-kinh-doanh-marketing/` etc.) | Short descriptions in `data/programs.ts` are generated, not from official source | Content owner to verify or provide official descriptions | Marketing |
| Homepage WhyTopicaSection | Feature copy is generic marketing | Content owner to verify | Marketing |
| TestimonialSection | No real testimonials in CMS | Content owner to add verified testimonials via Admin | Marketing |
| Homepage ProgramsSection | Program count discrepancy (9 in code vs 5 on live site homepage) | Content owner to clarify official count | Academic Affairs |

---

## Removed Mock Content Log

| Date | File | What was removed | Reason |
|------|------|-----------------|--------|
| 2026-08-28 | `data/testimonials.ts` | 4 fake testimonials ("Nguyễn Văn A" etc.) | No real source, fabricated names |
| 2026-08-28 | `data/campuses.ts` | Fake per-campus phone numbers (1900.1234 etc.) and emails | Not found on official website |
| 2026-08-28 | `data/admissions.ts` | 5 mock FAQ items with unverified claims | Claims about admission conditions, degree value, training time not verified |
| 2026-08-28 | `components/sections/TrustSection.tsx` | "15,000+ sinh viên" and "9 ngành đào tạo" | Not found on live site; site says "5 Ngành" |
| 2026-08-28 | `app/(main)/page.tsx` | Logo reference `/logo.png` | File doesn't exist; changed to `/topica-logo.png` |
