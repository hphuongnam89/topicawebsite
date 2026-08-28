# TOPICA Website Rebuild - Phase 1 Audit

Ngày audit: 2026-08-28  
Website nguồn: [topicauni.edu.vn](https://topicauni.edu.vn/)  
Phạm vi: website public, sitemap, WordPress REST API, các template đại diện, desktop 1440 px, mobile 375 px và source code Next.js hiện tại.

## Kết luận điều hành

Website hiện tại cần rebuild, không phù hợp để chỉ sửa CSS. Ba rủi ro lớn nhất là:

1. **Mất chuyển đổi:** form tư vấn hero nằm ngoài viewport ở cả desktop và mobile.
2. **SEO sai dữ liệu:** homepage khai báo Organization là `NBS CYBER UNIVERSITY` và trỏ đến domain demo `tuyensinhnew.maudemo.vip`; nhiều page không có `H1` và dùng schema sai loại.
3. **Inventory nhiễu:** 137 bản ghi public từ REST API, gồm 21 category rỗng, 8 UX block trả `200` nhưng body rỗng, các route WooCommerce/test và một URL bị Page/Post cùng sở hữu.

Khuyến nghị: giữ Next.js hiện tại, dùng WordPress mới làm headless CMS, bảo toàn URL đã có traffic, dọn taxonomy/indexability trước khi chuyển giao SEO.

## 1. Current Website Audit

### Nền tảng hiện tại

| Hạng mục | Phát hiện |
| --- | --- |
| CMS | WordPress, theme Flatsome 3.19.12 |
| Server | Nginx 1.28.1, PHP 7.4.33 |
| SEO | Rank Math, canonical và sitemap đang hoạt động |
| Form | Contact Form 7 |
| Frontend | jQuery 3.7.1, jQuery Migrate, Flatsome JS/CSS |
| Plugin/UI | GTranslate, TablePress, Font Awesome 4.7, Flatsome icon font, Button Contact VR |
| Font | `GT-America-Standard-Regular-Trial`, Canela; có URL font lẫn HTTP/HTTPS |

PHP 7.4 đã hết vòng đời; WordPress hiện khuyến nghị PHP 8.3 trở lên cho baseline an toàn và hiệu năng tốt hơn: [WordPress requirements](https://wordpress.org/about/requirements/).

### Quy mô public

| Nguồn | Số bản ghi |
| --- | ---: |
| Pages | 70 |
| Posts | 31 |
| Categories | 28 |
| UX Blocks | 8 |
| Tổng | 137 |
| URL duy nhất | 136 |

Tất cả 136 URL duy nhất trả HTTP 200 tại thời điểm audit. Tuy nhiên, 8 URL `/blocks/*` trả body 0 byte, vì vậy là URL rỗng chứ không phải trang hợp lệ.

### Homepage thực tế

| Chỉ số | Kết quả |
| --- | ---: |
| H1 | 0 |
| H2 | 21 trong DOM |
| Ảnh | 69 |
| Ảnh thiếu/alt rỗng | 63 |
| Link | 155 |
| Form | 3, gồm 2 search form và 1 lead form |
| Script ngoài | 13 tag, 12 URL duy nhất |
| Stylesheet | 8 |

Các lỗi đã xác nhận trực tiếp:

- Desktop 1440 px: lead form rộng 480 px nhưng bắt đầu tại `x=-152`; một phần form nằm ngoài màn hình.
- Mobile 375 px: form bắt đầu tại `x=-240`, kết thúc tại `x=-116`; toàn bộ form nằm ngoài viewport.
- Form lead không có `<label>`, không có `aria-label` và các field hiển thị không có `required`.
- Homepage dùng `H3` cho “Đăng ký nhận tư vấn” và không có `H1` định vị thương hiệu/nội dung chính.
- Desktop vẫn dùng hamburger thay vì navigation chính; các mục “Đảm bảo chất lượng”, “E-Learning”, “Thông tin Sinh viên” có link cấp một là `#`.
- Mobile drawer có accordion và hoạt động, nhưng không có CTA xét tuyển nổi bật trong vùng menu đầu tiên.
- Các template dùng lặp ID `search-lightbox`, `s`, `google_translate_element2`.

W3C yêu cầu mọi form control có nhãn được liên kết rõ ràng; placeholder không thay thế cho label: [WAI - Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/).

### Source code Next.js hiện tại

Codebase mới mới chỉ là foundation rất nhỏ:

- `app/page.tsx`: chỉ render `HeroSection` và `Footer`.
- `app/layout.tsx`: render `Navbar` và metadata chung.
- `Navbar`: menu mobile chưa có hành vi mở/đóng.
- `HeroSection`: form không có action, validation workflow, trạng thái loading/success/error hoặc anti-spam.
- `Footer`: nhiều link dùng chung một URL; social link đang là `#`.
- Nội dung, navigation, program, campus và footer đang hard-code trong component.
- Chưa có CMS service, route nội dung, sitemap, robots, schema, redirects, tests, Framer Motion hoặc Lucide.

## 2. Sitemap hiện tại

Nguồn chính: [sitemap index](https://topicauni.edu.vn/sitemap_index.xml), [robots.txt](https://topicauni.edu.vn/robots.txt).

```text
/
├── /gioi-thieu/                         6 trang con
├── /chuong-trinh/                       đào tạo từ xa, ngắn hạn, khóa trực tuyến
│   └── /chuong-trinh/chuong-trinh-dao-tao-tu-xa/
│       ├── /khung-chuong-trinh/
│       ├── /muc-tieu-va-chuan-dau-ra/
│       └── /co-hoi-nghe-nghiep-vi-tri-viec-lam/
├── /tuyen-sinh/                         5 trang con
├── /dao-tao/                            quy chế, lịch thi, thời khóa biểu, kế hoạch
├── 8 trang ngành ở root
├── 31 bài viết ở root
├── /chuyen-muc/*                        28 category, chỉ 7 category có bài
├── /he-thong/, /quy-dinh/, /bo-bieu-mau/, /bo-quy-trinh/
├── /lien-he/
├── /shop/, /cart/, /checkout/, /my-account/, /test/
└── /blocks/*                            8 UX block public nhưng body rỗng
```

Sitemap hiện có 4 nhánh: post, page, category và blocks. Nhánh blocks không nên public/index. Post sitemap còn chứa image URL dùng `http://`, cần chuẩn hóa sang HTTPS.

## 3. URL Inventory

Inventory đầy đủ nằm tại [URL_INVENTORY.csv](./URL_INVENTORY.csv). File có title, source type, status, sitemap state, quyết định giữ URL, action migration, URL đề xuất và component đích.

| Hướng xử lý | Số bản ghi |
| --- | ---: |
| Giữ nguyên URL | 86 |
| Lập 301 map | 7 |
| Noindex/merge taxonomy | 22 |
| Internal-only UX block | 8 |
| Noindex/retire sau khi kiểm tra traffic | 5 |
| Content owner/legal review | 9 |

### Xung đột cần xử lý trước migration

| URL/nhóm | Vấn đề | Quyết định tạm thời |
| --- | --- | --- |
| `/thong-bao-tuyen-sinh/` | Một Page và một Post cùng claim URL | Chọn một content owner/canonical duy nhất |
| `/hoc-phi/` và `/tuyen-sinh/hoc-phi-hoc-bong/` | Nội dung có khả năng chồng lấn | Giữ cả hai đến khi legal/content sign-off |
| `/van-bang-hai/` và `/tuyen-sinh-van-bang-2/` | Chủ đề gần trùng | So sánh nội dung và traffic trước 301 |
| `/de-an-quy-che-tuyen-sinh/` và các URL con `/tuyen-sinh/*` | Cấu trúc phân tán | Tách Đề án/Quy chế, map rõ từng tài liệu |
| `/blog/` và `/chuyen-muc/tin-tuc/` | Hai index tin tức | Dồn về `/tin-tuc/` sau khi route mới live |
| `/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `/test/` | Không phù hợp website giáo dục hiện tại nhưng đang index | Noindex ngay; 410 chỉ sau GA/GSC/backlink review |

Không thực hiện 301/410 trong Phase 1 vì chưa có Google Search Console, Analytics và backlink data.

## 4. Content Inventory

| Nhóm nội dung | Hiện trạng | Content model đề xuất |
| --- | --- | --- |
| Homepage | Hero/form, intro, chương trình, tuyển sinh, ngành, news, employer, testimonial, timeline | Singleton `Homepage` |
| Giới thiệu | Index + 6 trang con | `Page` + reusable content blocks |
| Chương trình | Từ xa, ngắn hạn, khóa trực tuyến, khung CT, chuẩn đầu ra, nghề nghiệp | `ProgramGroup`, `CurriculumDocument` |
| Ngành đào tạo | 5 ngành Topica mục tiêu + 3 trang ngành/PXU cần xác minh ownership | `Program` |
| Tuyển sinh | Điều kiện, học phí, học bổng, thời gian, đề án, quy chế, xét tuyển | `AdmissionInfo`, `OfficialDocument`, `FAQ` |
| Tin tức | 31 post, 28 category, 21 category rỗng | `Article`, `Category`, `Author`, `Tag` |
| Hệ thống sinh viên | LMS, biểu mẫu, quy định, quy trình, lịch thi, thời khóa biểu | `StudentResource`, `DocumentCollection` |
| Địa điểm | 6 địa chỉ đang nằm trong footer | `Campus` |
| Testimonial | 3 sinh viên trên homepage | `Testimonial` với trạng thái xác minh |
| Form lead | Hero và Contact Form 7 | `LeadFormConfig` + server adapter |
| SEO | Rank Math metadata phân tán | SEO fields dùng chung cho mọi content type |

Nội dung tuyển sinh, học phí, bằng cấp, quy chế và thông báo phải migrate nguyên nghĩa; redesign chỉ thay cách trình bày sau khi content owner duyệt.

## 5. UI/UX Problems

### Critical

1. **Lead form off-canvas:** người dùng không thể hoàn thành CTA chính trên mobile; desktop cũng mất một phần input.
2. **Hero không làm nhiệm vụ định vị:** không có headline thương hiệu/H1; phần đầu trang bị chi phối bởi form và ảnh banner.
3. **Navigation desktop thiếu khả năng quét:** hamburger ở 1440 px che toàn bộ IA; top-level link quan trọng dùng `#`.
4. **Homepage quá dài và thiếu nhịp:** khoảng 8.7k px desktop và 14.7k px mobile; thông tin chương trình/tuyển sinh lặp ý và CTA phân tán.
5. **Form thiếu accessibility/feedback:** không label, không required programmatically, không error/success state rõ.

### Major

- Hero carousel chứa nhiều banner nhưng không tạo narrative rõ; ảnh chiếm gần toàn first viewport.
- Program card ưu tiên khối ảnh lớn hơn thông tin quyết định như thời lượng, văn bằng, đối tượng và CTA.
- News section khó quét, category/date không nổi bật và tiêu đề dài.
- Footer quá dày trên mobile, link nhỏ và nhiều hàng; địa chỉ chiếm phần lớn màn hình.
- Contact buttons nổi che nội dung và dùng PNG/icon style khác hệ thống chính.
- Typography dùng font trial và nhiều font stack, chưa có scale nhất quán cho tiếng Việt.

### Hallmark visual audit

- **[critical] The AI footer** - 4 cột link + social row + copyright tail; cần chuyển sang footer có brand/contact anchor và sitemap có chủ đích.
- **[critical] The 3-column feature grid** - card ngành đều nhau, lặp cấu trúc; cần grid bất đối xứng hoặc editorial list.
- **[critical] Pure black, pure white** - surface trắng tuyệt đối chiếm ưu thế; cần warm paper neutral và phân cấp band rõ.
- **[major] Mismatched icon sets** - Flatsome icons, Font Awesome, flag SVG và PNG contact cùng tồn tại; chuẩn hóa Lucide + logo/icon brand.
- **[major] Mid-render token improvisation** - nhiều màu rời rạc ngoài gold/ink; cần token hóa và giới hạn accent.

Hallmark summary - 3 critical · 2 major · 0 minor.

## 6. SEO Problems

### Critical

1. Homepage schema khai báo Organization name là `NBS CYBER UNIVERSITY` và URL là domain demo `tuyensinhnew.maudemo.vip`, không đại diện website hiện tại.
2. Homepage và các page mẫu `gioi-thieu`, `cong-nghe-thong-tin`, `tuyen-sinh`, `hoc-phi`, FAQ, `lien-he`, `he-thong` đều không có `H1`.
3. Schema `Article`/`Person` xuất hiện trên nhiều static page; `FAQPage` xuất hiện ở trang giới thiệu nhưng không xuất hiện trên trang FAQ mẫu.
4. 8 `/blocks/*` được đưa vào sitemap, trả HTTP 200 nhưng body 0 byte.
5. `/test/`, WooCommerce routes và category `Uncategorised` đang index.
6. Page/Post collision tại `/thong-bao-tuyen-sinh/` làm content ownership và canonical không rõ ràng.

Google yêu cầu structured data phải đại diện đúng nội dung chính và không gây hiểu nhầm: [Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

### High

- 21/28 category rỗng vẫn public; dù không nằm trong category sitemap, chúng vẫn trả 200.
- Homepage title chỉ là “Viện Topica”; meta description kết thúc bằng dấu phẩy và không diễn đạt đầy đủ intent.
- Category title hiển thị “Lưu trữ danh mục: Tin tức”, mang dấu vết template WordPress.
- 63/69 ảnh homepage thiếu alt có ý nghĩa.
- Homepage có 10 link `href="#"`; internal link graph không truyền intent rõ.
- Image location trong sitemap có cả HTTP và HTTPS.
- Duplicate DOM IDs xuất hiện xuyên template.

### Positive signals cần giữ

- HTTPS hoạt động.
- Self-canonical có trên các template đã kiểm tra.
- `robots.txt` trỏ đúng sitemap index.
- 31 post và 70 page đều trả 200 tại thời điểm audit.
- Article page có `H1`, canonical và `BlogPosting` schema.

## 7. Performance Problems

### Đo kiểm tại thời điểm audit

| Hạng mục | Kết quả |
| --- | ---: |
| Homepage HTML | 206,219 bytes |
| 12 script URL duy nhất | 228,347 bytes |
| 8 stylesheet | 209,074 bytes |
| 43 image `src` duy nhất | 21,511,504 bytes tổng source payload tiềm năng |
| Homepage TTFB bằng curl | 1.69 s |
| `/gioi-thieu/` TTFB bằng curl | 1.93 s |
| Crawl HEAD 136 URL | p50 2.85 s, p95 3.34 s dưới tải song song |

21.5 MB là tổng file nguồn được tham chiếu, không phải toàn bộ initial transfer vì nhiều ảnh lazy-load. Tuy nhiên, 7 ảnh PNG riêng lẻ lớn hơn 1.7 MB và một ảnh hơn 2.4 MB.

### Nguyên nhân chính

- PHP 7.4 + WordPress render động tạo TTFB cao.
- HTML 206 KB và nhiều plugin/theme payload.
- Hero dùng nhiều slide/banner lớn; ảnh nội dung chủ yếu là PNG/JPEG chưa có pipeline AVIF/WebP rõ.
- jQuery, jQuery Migrate, Flatsome và plugin scripts tải trên toàn site.
- 69 image tag và nhiều bản sao/size variant làm tăng decode/network contention.
- Font trial OTF/TTF không tối ưu bằng WOFF2 subset.

Mục tiêu LCP nên <= 2.5 giây ở p75 và ảnh LCP không được lazy-load: [web.dev - Optimize LCP](https://web.dev/articles/optimize-lcp).

Chưa có Lighthouse score chính thức trong Phase 1 vì PageSpeed Insights API hết quota. Lighthouse CI và field Core Web Vitals phải chạy ở Phase 11; không suy diễn score từ curl.

## 8. Recommended Architecture

```text
Browser
  -> Next.js App Router
      -> Server Components / SSG / ISR
      -> Metadata + Schema + Sitemap + Redirect layer
      -> Lead Route Handler -> LeadAdapter -> CRM / Sheet / Webhook / Email
      -> CMS service (server-only)
          -> Headless WordPress REST API
              -> Posts, Pages, Programs, Campuses, FAQs, Authors, SEO
              -> Webhook -> revalidateTag / revalidatePath
```

### CMS decision

| Phương án | Ưu điểm | Rủi ro | Kết luận |
| --- | --- | --- | --- |
| Strapi | Content model rõ, API-first, self-hosted | Phải migrate toàn bộ content, vận hành Node/DB và đào tạo lại editor | Không chọn cho migration v1 |
| WordPress headless | Giữ workflow hiện tại, revisions/draft/schedule/media sẵn có, REST API đang hoạt động | Cần nâng PHP, hardening, giảm plugin và tách frontend | **Chọn** |
| Sanity | Authoring tốt, realtime, CDN mạnh | Vendor lock-in và migration editor/content lớn | Phù hợp greenfield hơn |

WordPress REST API có sẵn endpoints cho posts, pages, categories, tags, media và revisions: [WordPress REST API reference](https://developer.wordpress.org/rest-api/reference/).

### Boundary đề xuất

- `app/`: route/layout/metadata, ưu tiên Server Components.
- `components/layout`: header, mobile drawer, footer, container.
- `components/sections`: homepage và landing sections.
- `components/ui`: button, link, card, form controls, dialog, accordion.
- `lib/cms`: typed client, normalizer, cache tags, preview/draft mode.
- `lib/seo`: metadata builders, schema builders, canonical helpers.
- `lib/leads`: validation, rate limit, adapter interfaces.
- `data`: chỉ dùng cho navigation/static config; nội dung editorial lấy từ CMS.
- `config/redirects`: migration map có test.

## 9. Proposed Sitemap

Nguyên tắc: thêm index mới nhưng **không đổi URL detail đang có** trong migration v1 nếu chưa có dữ liệu traffic/backlink.

```text
/
├── /gioi-thieu/
│   ├── /gioi-thieu/lich-su-hinh-thanh/
│   ├── /gioi-thieu/tam-nhin-su-mang/
│   ├── /gioi-thieu/gia-tri-cot-loi-triet-ly-giao-duc/
│   ├── /gioi-thieu/co-cau-to-chuc/
│   ├── /gioi-thieu/co-so-vat-chat/
│   └── /gioi-thieu/tap-doan-giao-duc-equest/
├── /nganh-dao-tao/                       NEW index
│   ├── /cong-nghe-thong-tin/             preserve legacy detail URL
│   ├── /quan-tri-kinh-doanh-marketing/
│   ├── /ngon-ngu-anh/
│   ├── /ngon-ngu-trung-quoc/
│   └── /quan-tri-dich-vu-du-lich-va-lu-hanh/
├── /chuong-trinh/                         preserve current hierarchy
├── /tuyen-sinh/
│   ├── /tuyen-sinh/thong-tin-tuyen-sinh/ NEW, sau content mapping
│   ├── /tuyen-sinh/de-an-tuyen-sinh/
│   ├── /tuyen-sinh/quy-che-tuyen-sinh/
│   ├── /tuyen-sinh/hoc-phi-hoc-bong/
│   ├── /tuyen-sinh/xet-tuyen-truc-tuyen/
│   └── /tuyen-sinh/faq/                   NEW alias/index
├── /dao-tao/                              preserve resources hierarchy
├── /tin-tuc/                              NEW canonical news index
│   ├── /tin-tuc/tuyen-sinh/
│   ├── /tin-tuc/thong-bao-tuyen-sinh/
│   ├── /tin-tuc/su-kien/
│   └── /tin-tuc/tuyen-dung/
├── /[legacy-article-slug]/                 preserve 31 article URLs in v1
├── /he-thong/
├── /quy-dinh/
├── /bo-bieu-mau/
├── /bo-quy-trinh/
└── /lien-he/
```

Không public trong sitemap mới: `/blocks/*`, category rỗng, `Uncategorised`, `/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `/test/`.

Google coi redirect là canonical signal mạnh và sitemap là signal yếu hơn; redirect chỉ triển khai khi target đã live và content tương đương: [Canonical URL methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## 10. Proposed Design System

### Direction

`Premium Education + Modern Technology + Trust`, nhưng thiên về editorial/academic thay vì SaaS landing page.

### Color tokens

| Token | Giá trị | Cách dùng |
| --- | --- | --- |
| `brand-gold-500` | `#B78844` | Brand accent, rules, icon, highlight |
| `brand-gold-600` | `#C78423` | Accent phụ; không dùng white body text trực tiếp |
| `brand-gold-700` | `#9A6B2E` | CTA với white text, contrast khoảng 4.65:1 |
| `ink-950` | `#0A0A0A` | Heading/body mạnh |
| `paper-50` | `#F7F5F1` | Main surface thay pure white |
| `neutral-500` | `#8996A0` | Metadata trên nền tối; phải kiểm tra contrast theo size |

`#B78844` với white chỉ khoảng 3.17:1; CTA nên dùng ink trên brand gold hoặc white trên gold-700.

### Typography

- Primary family: **Be Vietnam Pro**; hỗ trợ tiếng Việt tốt và có đủ weight cho display/body.
- Canela chỉ được dùng làm display accent nếu có license và kiểm tra đầy đủ glyph tiếng Việt.
- H1 48-72 desktop, 36-44 mobile; độ dài mục tiêu <= 2 dòng.
- Body 16-18, line-height 1.6; text measure 62-72 ký tự.

### Layout, component, motion

- 4 px spacing scale; content max-width 1240-1280 px.
- Radius 4-8 px; không dùng card bo tròn lớn.
- Shadow nhẹ, ưu tiên border/lightness hơn drop-shadow.
- Header 88 px -> 68 px khi scroll, không thay đổi flow layout.
- Motion chỉ transform/opacity, tối đa 2-3 primitive/page, hỗ trợ `prefers-reduced-motion`.
- One icon system: Lucide; brand/social logo dùng asset chính thức.
- Mobile drawer fullscreen, accordion semantic, CTA xét tuyển cố định trong drawer.

## 11. Proposed Tech Stack

| Layer | Chọn |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 + CSS design tokens |
| UI primitives | Component architecture nội bộ; dùng Radix/shadcn có chọn lọc cho dialog, accordion, select |
| Motion | Framer Motion, chỉ ở client boundaries cần thiết |
| Icons | Lucide React |
| CMS | Headless WordPress trên PHP 8.3+, REST API, custom post types/fields |
| Data | Server-only typed CMS client, Zod validation, tag-based revalidation |
| Forms | React Hook Form + Zod; Route Handler + `LeadAdapter`; Turnstile/rate limit |
| SEO | Next Metadata API, JSON-LD builders, `sitemap.ts`, `robots.ts`, redirects tests |
| Images/fonts | `next/image`, AVIF/WebP, WOFF2/subset, priority chỉ cho LCP |
| Testing | Vitest, React Testing Library, Playwright, axe, Lighthouse CI |
| Deploy | Vercel/Node hosting cho Next.js; managed WordPress riêng; CDN/WAF |

Next.js hỗ trợ metadata động, OG images, robots và sitemap qua App Router conventions: [Next.js Metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

## 12. Development Roadmap

| Phase | Trạng thái | Deliverable/exit criteria |
| --- | --- | --- |
| 1. Audit | **Completed** | Audit, inventory 137 records, risks, architecture/design/stack recommendation |
| 2. Information Architecture | Next | Chốt sitemap, navigation, content ownership, 301 matrix |
| 3. Design System | Pending | Tokens, typography, responsive primitives, component states |
| 4. Foundation | Pending | Dependencies, CMS client, env validation, lint/test/prettier |
| 5. Core UI | Pending | Header, mobile nav, footer, buttons, forms, containers |
| 6. Homepage | Pending | Full storytelling flow, CMS data, responsive and reduced motion |
| 7. Content Pages | Pending | About, programs, admissions, student resources, contact |
| 8. News | Pending | Index, category, article, pagination/search/related |
| 9. CMS | Pending | Content models, preview, draft, publish, scheduled publish, webhook |
| 10. SEO | Pending | Metadata, schema, sitemap, robots, canonical, redirects |
| 11. Performance | Pending | Lighthouse CI, image/font optimization, CWV/RUM baseline |
| 12. QA | Pending | Browser/device/a11y/forms/redirect/broken-link release suite |

## Assumptions và giới hạn

- Audit phản ánh website public ngày 2026-08-28.
- Không có quyền Google Analytics, Search Console, hosting logs hoặc backlink tools; chưa thể quyết định xóa/301 cuối cùng.
- Không submit form thật để tránh tạo lead ngoài ý muốn.
- Chưa chạy cross-browser và Lighthouse đầy đủ; đó là exit criteria Phase 11-12.
- Nội dung pháp lý/tuyển sinh được đánh dấu “preserve/review”, không tự viết lại.

## Phase Report

### Completed

- Crawl sitemap, REST API và 136 URL duy nhất.
- Kiểm tra homepage desktop/mobile và 9 template đại diện.
- Audit UI/UX, SEO, accessibility, performance và source code Next.js hiện tại.
- Tạo URL migration inventory và đề xuất architecture/design/stack/roadmap.

### Changed

- Tạo `docs/audit/AUDIT.md`.
- Tạo `docs/audit/URL_INVENTORY.csv`.
- Tạo `docs/audit/generate-inventory.mjs` để tái tạo inventory từ website nguồn.

### Decisions

- Chọn WordPress headless cho migration v1.
- Giữ URL detail hiện tại khi chưa có traffic/backlink evidence.
- Dùng Be Vietnam Pro làm font family chính.
- Không triển khai code UI trước khi chốt IA và migration map.

### Issues

- Form hero off-canvas.
- Schema Organization sai thương hiệu/domain.
- Static page thiếu H1 và schema dùng sai loại.
- Sitemap/public inventory chứa UX blocks rỗng, commerce/test routes và taxonomy rỗng.
- Chưa có analytics/Search Console để đóng quyết định redirect/retire.

### Next

Phase 2: chốt sitemap mới, navigation desktop/mobile, content owner cho các URL xung đột và redirect matrix có điều kiện.
