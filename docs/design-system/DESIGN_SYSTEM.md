<!-- Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 -->

# Phase 3 - Design System

Ngày chốt: 2026-08-28  
Nguồn chuẩn ngắn gọn: [`design.md`](../../design.md)  
Machine-readable tokens: [`TOKENS.json`](./TOKENS.json)  
Visual QA: [`preview.html`](./preview.html)

## 1. Design direction

`Premium Education + Modern Technology + Trust`, thể hiện theo hướng editorial/academic thay vì SaaS hoặc landing page quảng cáo.

- Người dùng chính: người đi làm, thí sinh, phụ huynh và sinh viên đang học.
- Nhu cầu chính: kiểm chứng uy tín, so sánh ngành, hiểu điều kiện/học phí và hoàn thành đăng ký.
- Hành động chính: `Đăng ký xét tuyển`.
- Hành động phụ: `Xem ngành học`, `Nhận tư vấn`.
- Cảm giác: chính xác, điềm tĩnh, có chiều sâu, không phô trương.

## 2. Foundations

### Color

| Role | Token | Value | Approved use |
|---|---|---|---|
| Brand anchor | `color.brand.500` | `#B78844` | Logo field, icon, rule, highlight |
| Primary action | `color.brand.700` | `#9A6B2E` | Button nền đậm với chữ trắng |
| Primary action hover | `color.brand.800` | `#714A20` | Hover/active |
| Warm support | `color.brand.600` | `#C78423` | Accent phụ, không ghép chữ trắng cỡ thường |
| Heading | `color.ink.950` | `#11100E` | Heading, dark section |
| Body | `color.ink.800` | `#292620` | Body copy |
| Secondary | `color.ink.600` | `#625E58` | Metadata/help text |
| Divider | `color.line.200` | `#DDD8CF` | Border |
| Page | `color.surface.canvas` | `#FFFFFF` | Main surface |
| Alternate | `color.surface.paper` | `#F7F5F1` | Section band |

Semantic colors: info `#245B82`, success `#26724F`, warning `#A56416`, error `#B23B3B`.

Rules:

- Gold occupies less than 20% of a normal content viewport.
- White text is allowed on `brand.700`, `brand.800`, semantic info/success/error and `ink.950`.
- `brand.500` uses `ink.950` text when it becomes a filled surface.
- Alternate section backgrounds must switch between white, paper and ink; do not create a one-hue page.
- State cannot be communicated by color alone.

### Typography

Implementation target:

```ts
import { Be_Vietnam_Pro, Lora } from "next/font/google";
```

- `Be Vietnam Pro`: body, UI, label, data.
- `Lora`: display, H1, H2, H3 only.
- Vietnamese subset and `display: "swap"` are required.
- Lora 600/700; Be Vietnam Pro 400/500/600/700.
- No italic headings, uppercase paragraph text or negative tracking.

| Name | Desktop | Mobile | Max recommended lines |
|---|---|---|---|
| Display | 64/72 | 40/48 | 2 |
| H1 | 48/56 | 36/44 | 2 |
| H2 | 36/44 | 30/38 | 3 |
| H3 | 26/34 | 24/32 | 3 |
| H4 | 20/28 | 20/28 | 3 |
| Body large | 18/30 | 18/30 | Not fixed |
| Body | 16/26 | 16/26 | Not fixed |
| Small | 14/22 | 14/22 | Not fixed |
| Caption | 12/18 | 12/18 | 2 |

Font size changes at explicit breakpoints. Do not use viewport-width font scaling.

### Spacing and grid

- 4 px base scale.
- Container: 1240 px.
- Editorial measure: 760 px.
- Page gutters: 16 px mobile, 24 px tablet, 32 px desktop.
- Section space: 64 px mobile, 80 px tablet, 96 px desktop.
- Grid: 4 columns mobile, 8 tablet, 12 desktop.
- Common card grid: 1 column mobile, 2 tablet, 3 desktop.
- Use `minmax(0, 1fr)` for grid tracks containing media/text.

### Radius and border

| Token | Value | Component |
|---|---|---|
| `radius.sm` | 4 px | Tag, compact control |
| `radius.md` | 6 px | Input, button |
| `radius.lg` | 8 px | Card, dropdown, modal |
| `radius.full` | 999 px | Avatar or status dot only |

Default border is 1 px `line.200`. Focus is a 2 px ring with a 2 px offset.

### Shadow

| Token | Intended use |
|---|---|
| `shadow.xs` | Input/button resting distinction where border is insufficient |
| `shadow.sm` | Sticky header, open dropdown, card hover |
| `shadow.md` | Modal/dialog only |

No persistent card shadow on a white section. No glow or colored shadow.

## 3. Buttons

### Variants

| Variant | Surface | Text/border | Use |
|---|---|---|---|
| Primary | `brand.700` | White | One primary command per local region |
| Secondary | Transparent/white | `ink.950` | Alternative command |
| Tertiary | Transparent | `ink.950` + arrow icon | Inline navigation |
| Destructive | `semantic.error` | White | Confirmed destructive action only |
| Icon | Transparent | Lucide icon | Familiar toolbar/header actions |

Heights: 40 px small, 48 px default, 52 px large. Primary nav CTA uses 48 px.

### Eight-state contract

| State | Required behavior |
|---|---|
| Default | Stable width and approved contrast |
| Hover | Darken one token step; optional icon moves 2 px |
| Focus-visible | 2 px focus ring + 2 px offset |
| Active | Darker surface and `translateY(1px)` |
| Disabled | 55% opacity, no motion, `not-allowed` |
| Loading | Spinner/icon, `aria-busy`, width unchanged |
| Error | Error token plus explicit label/icon |
| Success | Success token plus explicit label/icon |

Buttons use sentence case. Avoid long all-uppercase labels.

## 4. Cards

### ProgramCard

- 4:3 media with stable aspect ratio.
- Optional program group label.
- Program name in H3/H4 according to density.
- Descriptor limited to 2-3 lines.
- Tertiary CTA aligned at bottom.
- Entire card may be linked only if no nested interactive controls exist.

### ArticleCard

- 16:9 media.
- Category and publish date.
- Title limited visually to 3 lines; full title remains accessible.
- Excerpt optional and hidden on compact mobile layouts.

### DocumentRow

- Prefer a list row over a card grid.
- Show document type, title, year/effective date and file action.
- File icon is Lucide `FileText`; download is `Download`.
- Expired/superseded status uses text and icon.

### Shared states

- Default: 1 px border, no shadow.
- Hover: image scale <= 1.03, card lift <= 2 px, `shadow.sm`.
- Focus-within: same visible focus standard as controls.
- Cards are never nested inside another card.

## 5. Forms

### Anatomy

1. Visible label.
2. Optional marker or required text.
3. Control.
4. Help text or error text.
5. Server error summary above the form when needed.

### Dimensions

- Input/select: 48 px high.
- Textarea: minimum 120 px.
- Horizontal padding: 14-16 px.
- Field group gap: 20 px.
- Form section gap: 32 px.

### States

| State | Border | Surface | Supporting content |
|---|---|---|---|
| Default | `line.200` | White | Help optional |
| Hover | `ink.400` | White | No layout shift |
| Focus | `semantic.focus` | White | Focus ring visible |
| Filled | `line.200` | White | Value uses body color |
| Disabled | `line.100` | `paper` | Explain when necessary |
| Error | `semantic.error` | White | Error icon + text + `aria-describedby` |
| Success | `semantic.success` | White | Success icon + text when useful |
| Loading | Stable dimensions | White | Field/form marked `aria-busy` |

Placeholder is an example, never a substitute for label. Form errors must survive zoom and wrapping without overlapping other controls.

### Lead form policy

- Collect only name, phone/email, selected program, education level and consent required by the approved workflow.
- Consent text links to privacy policy and stores a consent version.
- Do not expose CRM/webhook destination in client code.
- Submission success does not echo personal data.

## 6. Navigation primitives

- Header: 88 px desktop, 68 px compact/mobile.
- Logo asset target: transparent SVG/PNG with light and dark variants.
- Current `public/topica-logo.png` is not final-ready because it has an opaque gold background and no alpha channel.
- Desktop menu: click/keyboard mega menu, 8 px radius, `shadow.sm`.
- Mobile: fullscreen drawer, accordions, focus trap, scroll lock.
- Icon system: Lucide. Social/partner marks use official assets.
- No navigation target may be `#` or rely on hover only.

## 7. Motion

### Tokens

| Token | Duration | Use |
|---|---|---|
| `motion.duration.fast` | 120 ms | Icon/control feedback |
| `motion.duration.base` | 180 ms | Hover/dropdown |
| `motion.duration.slow` | 280 ms | Drawer/accordion/media reveal |
| `motion.duration.enter` | 420 ms | One initial content entrance |

Easing:

- Standard: `cubic-bezier(0.2, 0, 0, 1)`.
- Emphasized: `cubic-bezier(0.16, 1, 0.3, 1)`.

### Approved primitives

- Fade: opacity 0 to 1.
- Fade-up: opacity + translateY, maximum 16 px.
- Image reveal: opacity + scale from 1.02 to 1.
- Arrow response: translateX, maximum 2 px.
- Card response: translateY, maximum 2 px.

### Restrictions

- Two or three motion primitives maximum per page.
- Avoid scroll-jacking, autoplay essential carousels and perpetual decorative loops.
- Parallax maximum 16 px; desktop only; no critical information attached to it.
- Reduced motion disables translation, parallax, smooth scrolling and non-essential transitions.

## 8. Accessibility

- WCAG 2.2 AA target.
- Body text contrast >= 4.5:1; large text >= 3:1.
- Touch target >= 44 x 44 px.
- Keyboard order follows visual order.
- Focus is never removed without a visible replacement.
- Skip link, semantic landmarks, heading order and form labels are required.
- Menu/dropdown state uses `aria-expanded` and `aria-controls`.
- Images have meaningful alt or empty alt when decorative.
- Error, success and selected state include text/icon in addition to color.

## 9. Responsive acceptance

Required widths: 320, 375, 414, 768, 1024 and 1440 px.

At every width:

- No horizontal scroll.
- Long Vietnamese labels remain inside controls.
- Buttons/nav labels do not wrap; layout adapts first.
- Card media keeps aspect ratio.
- Heading does not overlap following content.
- Footer columns collapse in reading order.
- Drawer CTA remains reachable without covering accordion content.

## 10. Asset requirements before Phase 5

- Official transparent Topica logo, light and dark variants.
- Logo usage approval and minimum clear-space rule.
- Authentic hero image with source/permission and desktop/mobile focal points.
- Program image set with consistent ratio and usage rights.
- Official EQuest and university partner marks.
- Real testimonial consent before portrait/name publication.

No visual implementation should invent a replacement logo, metric, accreditation badge or partner mark.

## 11. Phase 4 handoff

- Load both fonts with `next/font/google` and expose CSS variables.
- Convert `TOKENS.json` into Tailwind v4 `@theme inline` variables.
- Remove hardcoded hex values from `app/layout.tsx` and existing components when Foundation work begins.
- Add Lucide and Framer Motion in Phase 4; current project has neither dependency.
- Add reduced-motion utility and common focus-ring utility before Phase 5 components.
