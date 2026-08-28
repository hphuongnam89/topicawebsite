# Phase 4 - Foundation

Ngày hoàn thành: 2026-08-28

## 1. Trạng thái

| Hạng mục              | Trạng thái | Implementation                                      |
| --------------------- | ---------- | --------------------------------------------------- |
| Next.js App Router    | Hoàn tất   | Next.js 16.3.3, React 19.2.8                        |
| TypeScript            | Hoàn tất   | Strict mode, `npm run typecheck`                    |
| Tailwind CSS          | Hoàn tất   | Tailwind v4, CSS-first theme                        |
| Design tokens         | Hoàn tất   | `app/theme.css` từ Phase 3 specification            |
| Fonts                 | Hoàn tất   | Be Vietnam Pro + Lora qua `next/font/google`        |
| ESLint                | Hoàn tất   | Next Core Web Vitals + TypeScript                   |
| Prettier              | Hoàn tất   | Tailwind class sorting, format scripts              |
| Motion                | Hoàn tất   | Motion for React, global reduced-motion policy      |
| Icons                 | Hoàn tất   | Lucide React                                        |
| CMS client            | Hoàn tất   | WordPress REST, server-only, typed + Zod validation |
| Environment variables | Hoàn tất   | Runtime schema, HTTPS enforcement in production     |
| Remote images         | Hoàn tất   | Allowlist chỉ cho WordPress uploads                 |
| Security headers      | Hoàn tất   | CSP, HSTS production và browser hardening headers   |

## 2. Packages

### Runtime

- `lucide-react`: icon system duy nhất cho UI.
- `motion`: Motion for React, tên mới của Framer Motion.
- `server-only`: ngăn CMS/env modules bị import vào client bundle.
- `zod`: kiểm tra env và WordPress response ở runtime.

### Development

- `prettier`: formatter.
- `prettier-plugin-tailwindcss`: sắp xếp utility class theo Tailwind.

Không thêm state manager, component framework hoặc HTTP client vì foundation hiện chưa cần.

## 3. Styling foundation

`app/globals.css` dùng cú pháp Tailwind v4:

```css
@import "tailwindcss";
@import "./theme.css";
```

`app/theme.css` cung cấp:

- Brand, neutral, surface và semantic colors.
- `font-sans` và `font-display` nối với `next/font` variables.
- Type scale, radius, shadow, easing và program aspect ratio.
- 4 px spacing base.
- Control/header/container dimensions ở `:root`.

Global baseline có:

- `overflow-x: clip` cho `html` và `body`.
- Focus ring 2 px.
- Typography tiếng Việt và heading wrap an toàn.
- Smooth scroll chỉ khi người dùng không yêu cầu reduced motion.
- Reduced-motion fallback cho animation và transition.

## 4. Font strategy

`app/layout.tsx` self-host font qua Next.js build:

- Be Vietnam Pro: 400, 500, 600, 700; subsets Latin + Vietnamese.
- Lora: variable font; subsets Latin + Vietnamese.
- `display: swap` cho cả hai.

Không còn dùng Inter trong root layout. Font từ website WordPress cũ không được tải ở frontend mới.

## 5. Motion foundation

`components/providers/MotionProvider.tsx` đặt `reducedMotion="user"` cho toàn app.

`lib/motion.ts` chỉ có các primitive được duyệt:

- `fadeUp`: opacity + translateY tối đa 16 px.
- `imageReveal`: opacity + scale từ 1.02.
- Transition 120, 180, 280 và 420 ms.
- Standard/emphasized cubic-bezier từ design system.

Animation cụ thể chỉ được đưa vào client component ở Phase 5-6.

## 6. CMS foundation

### Client

`lib/cms/client.ts`:

- Chỉ chạy server-side.
- Chỉ chấp nhận relative endpoint để không biến client thành open proxy.
- Dùng native `fetch`, timeout 8 giây.
- Từ chối redirect và absolute endpoint để giữ request trong CMS origin đã cấu hình.
- Next revalidation mặc định 300 giây và hỗ trợ cache tags.
- Parse JSON và kiểm tra collection bằng Zod.
- Trả pagination từ `X-WP-Total` và `X-WP-TotalPages`.
- Không đưa response body CMS vào error message.

### Schemas

`lib/cms/schemas.ts` định nghĩa runtime contract cho:

- Page.
- Post.
- Post summary không chứa full HTML body.
- Category.
- Media.

TypeScript types được suy ra trực tiếp từ schema để tránh schema/type lệch nhau.

### Queries

`lib/cms/queries.ts` cung cấp:

- `getPageBySlug`.
- `getPostBySlug`.
- `getPosts` với pagination/category/search.
- `getCategories` chỉ lấy category có nội dung.

Queries chỉ yêu cầu các field cần dùng nhằm giảm payload. List query giới hạn tối đa 100 bài, 20 category và 100 ký tự tìm kiếm.

### Security boundary

- CMS URL và secret nằm trong server-only module.
- Production bắt buộc HTTPS cho site URL và WordPress API.
- URL cấu hình không được chứa username/password.
- Security headers áp dụng toàn site; HSTS và upgrade-insecure-requests chỉ bật production.
- HTML từ WordPress vẫn được coi là untrusted. Phase content rendering phải sanitize trước khi dùng `dangerouslySetInnerHTML`.
- Webhook revalidation chưa được mở public; secret chỉ được dự phòng trong env.

## 7. Environment variables

| Key                           | Public | Required | Default                                  |
| ----------------------------- | ------ | -------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | Có     | Không    | `https://topicauni.edu.vn`               |
| `WORDPRESS_API_URL`           | Không  | Không    | `https://topicauni.edu.vn/wp-json/wp/v2` |
| `CMS_REVALIDATE_SECONDS`      | Không  | Không    | `300`                                    |
| `WORDPRESS_REVALIDATE_SECRET` | Không  | Chưa     | Không có                                 |

Production copy từ `.env.example` sang cấu hình môi trường của host. Secret thật không được commit.

## 8. Image policy

`next.config.ts` chỉ cho Next Image đọc:

```text
https://topicauni.edu.vn/wp-content/uploads/**
```

Output ưu tiên AVIF/WebP và cache tối thiểu một giờ. Domain khác phải được duyệt và thêm chính xác, không mở wildcard.

## 9. Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run build
```

## 10. Verification

- `npm audit`: 0 vulnerability tại thời điểm cài đặt.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run format:check`: pass.
- `npm run build`: pass; route `/` được prerender static.
- Live WordPress contract: Page `gioi-thieu`, Post `thong-bao-tuyen-sinh`, Post summary và một active Category đều pass Zod schema.

## 11. Phase 5 handoff

- Thay hardcoded colors/radius trong Navbar, Hero và Footer bằng token utilities.
- Dùng `NAVIGATION.json` làm seed cho desktop mega menu và mobile drawer.
- Dùng Lucide thay ký tự menu thủ công.
- Dùng Motion constants, không tự tạo duration/easing mới trong component.
- Bổ sung official transparent logo trước khi chốt Header.
- Không render CMS rich text trực tiếp cho tới khi có sanitizer và content renderer.

Tài liệu tham chiếu chính thức: [Next.js Font](https://nextjs.org/docs/pages/api-reference/components/font), [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Motion for React installation](https://motion.dev/docs/react-installation), [Prettier configuration](https://prettier.io/docs/configuration).
