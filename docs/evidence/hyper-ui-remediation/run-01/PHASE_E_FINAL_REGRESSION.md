# Báo cáo Nghiệm thu Đợt E — Regression Tích hợp & Nghiệm thu Tổng thể

- **Run ID:** `run-01`
- **Ngày thực hiện:** 12/10/2026
- **Gói công việc:** Đợt E (Regression và Nghiệm thu toàn gói theo [HYPER_UI_REMEDIATION_PLAN.md](../../agent-execution/HYPER_UI_REMEDIATION_PLAN.md))
- **Backlog liên kết:** `HU-07`, `R22`, `R23`
- **Môi trường đo kiểm:**
  - Node.js: `v24.19.0`
  - npm: `11.17.0`
  - Next.js: `16.3.3` (Turbopack)
  - Vitest: `v4.1.11`
  - TypeScript: `5.9.3` (`tsc --noEmit`)
  - ESLint: `v9.x` flat config (`eslint .`)
- **Trạng thái:** **HOÀN THÀNH (Đợt E)**

---

## 1. Tổng hợp Kết quả Kiểm tra Kỹ thuật (Automated Quality Gates)

| Công cụ / Lệnh kiểm tra | Phạm vi | Kết quả | Ghi chú |
|---|---|---|---|
| `npm run typecheck` | Toàn bộ TypeScript codebase | **Exit code 0 (PASS)** | 0 lỗi kiểu dữ liệu |
| `npm run lint` | Toàn bộ codebase (ESLint) | **Exit code 0 (PASS)** | 0 lỗi, 0 cảnh báo. Đã triệt tiêu lỗi `react-hooks/set-state-in-effect` tại `FloatingActions.tsx` bằng CSS selector khai báo |
| `npx vitest run __tests__/qa/hyper-ui-remediation.test.ts` | Suite hồi quy chuyên biệt 9 finding | **8/8 PASS** | Đo kiểm tự động HUI-01 $\rightarrow$ HUI-09 |
| `npm run test` (toàn bộ test suites) | 34 test files toàn hệ thống | **34/34 files PASS (224/225 tests PASS, 1 skipped)** | Không có bất kỳ test suite nào thất bại |
| `npm run build` | Next.js Production Build (Turbopack) | **Exit code 0 (PASS)** | Biên dịch thành công 45/45 routes (static & dynamic) trong 9.8s |

---

## 2. Bảng Đối chiếu & Trạng thái 9 Finding (HUI-01 — HUI-09)

| Mã Finding | Mức độ | Mô tả ban đầu | Giải pháp kỹ thuật đã triển khai | Trạng thái cuối |
|---|---|---|---|---|
| **HUI-01** | P1 | CTA trang ngành *"Xem trạng thái hồ sơ"* sai ngữ cảnh khi trỏ tới anchor nội trang `#chuong-trinh` | Đổi nhãn thành *"Xem chương trình"* tại `ProgramHero.tsx:87`; chuẩn hoá liên kết ngoài đến cổng đăng ký xét tuyển | **VERIFIED** |
| **HUI-02** | P1 | Mâu thuẫn logic tuyển sinh: Hero hiển thị đang mở xét tuyển trong khi ProgramsSection báo "Tạm dừng" | Audit toàn diện tại `AUDIT_HUI-02_ADMISSION_BADGE.md`; khởi tạo phiếu `PKT-ADM` tại `PHASE_B_STAKEHOLDER_PACKETS.md`; áp dụng fallback trung tính không hiển thị ngày suy diễn | **NEEDS_SOURCE / FALLBACK_ACTIVE** |
| **HUI-03** | P1 | Tiêu đề H1 trang con quá khổ (54px), vỡ 3 dòng trên mobile/tablet | Thay thế bằng fluid clamp `text-[clamp(1.875rem,3.5vw+0.5rem,2.75rem)]` và `leading-[1.15]` tại `ProgramHero.tsx`; chuẩn hoá responsive `text-3xl sm:text-4xl lg:text-h1` tại `PageHeader.tsx` | **VERIFIED** |
| **HUI-04** | P1 | Thứ tự trang chủ bất hợp lý: ép người học xem 1481px quy trình nộp hồ sơ trước khi biết trường dạy ngành gì | Đảo thứ tự hiển thị tại `app/(main)/page.tsx`: đưa `ProgramsSection` lên ngay sau `CurrentAdmissions`, dời `AdmissionTimeline` xuống sau; bổ sung scroll anchors an toàn | **VERIFIED** |
| **HUI-05** | P1 | Dải tablet 768–1024px bị nghẽn: email dài dính vào nút hành động chính | Ẩn email trên tablet (`hidden lg:flex`), rút gọn nhãn Thư viện số thành `(E-LIB)` tại `Header.tsx`, giải phóng >250px khoảng đệm | **VERIFIED** |
| **HUI-06** | P2 | Rò rỉ từ ngữ kiểm kê nội bộ ra công chúng (*"Những gì đã được xác minh"*, file ảnh nội bộ draft) | Chuẩn hoá thành ngôn ngữ đào tạo chuẩn mực (*"Thông tin chương trình"*, *"Khung chương trình đào tạo"*); dọn sạch file JPG nội bộ trong `supplemental-program-details.ts` | **VERIFIED** |
| **HUI-07** | P2 | 4 logo đối tác vô danh (`Đối tác 6`–`9`) hiển thị placeholder không chuyên nghiệp | Thiết lập [MEDIA_LEDGER.md](MEDIA_LEDGER.md); tạm ẩn 4 logo vô danh; chỉ render 5 đối tác đã xác minh danh tính và quan hệ hợp tác chính thức | **VERIFIED (FALLBACK_ACTIVE)** |
| **HUI-08** | P2 | 3 nút floating actions bị chói, đè lấp lên thanh `ProgramStickyBar` | Chuẩn hoá màu sắc về bảng màu Navy/Gold/White tại `FloatingActions.tsx`; hạ z-index `ProgramStickyBar` xuống `z-30`; nâng khoảng cách đáy qua CSS `body:has(aside[aria-label="Hành động tuyển sinh"]) [data-floating-actions]` | **VERIFIED** |
| **HUI-09** | P1 | CSS cascade `@media (prefers-reduced-motion)` bị ghi đè bởi `.animate-marquee` base declaration có `!important` | Đưa `.animate-marquee` lên trước media query trong `app/globals.css`, bỏ `!important` ở base rule, đảm bảo override `animation: none !important;` có hiệu lực tuyệt đối | **VERIFIED** |

---

## 3. Xác minh Khả năng tiếp cận & Reduced Motion (HU-07 / HUI-09)

1. **CSS Cascade Specificity:**
   - Base rule `.animate-marquee` (specificity `0-1-0`) được khai báo tại dòng 479 `app/globals.css`.
   - Media query `@media (prefers-reduced-motion: reduce)` được khai báo tại dòng 488 `app/globals.css`.
   - Khi hệ điều hành/trình duyệt bật chế độ `reduce motion`:
     - `animation: none !important;` áp dụng cho `*, ::before, ::after`.
     - `transition: none !important;` và `scroll-behavior: auto !important;` được kích hoạt.
     - Marquee vô hiệu hóa chuyển động cuộn vĩnh viễn, người dùng có thể đọc trọn vẹn danh sách đối tác không bị xao nhãng hoặc chóng mặt.
2. **Keyboard Navigation & Touch Targets:**
   - Skip to main content link: Có mặt và hoạt động tốt tại `Header.tsx:90`.
   - Focus visible: Tất cả các nút bấm, anchor và interactive element đều có viền `focus-visible:outline-2 focus-visible:outline-offset-2`.
   - Vùng chạm di động: Tất cả các nút trong `MobileStickyBar` và `FloatingActions` đạt $\ge 44 \times 44\text{px}$ (`h-12 w-12`).

---

## 4. Bảo toàn Ranh giới & Dữ liệu Thực tế

- **Database:** Tập tin dữ liệu thật `data/topica.db` không bị sửa đổi; các bài test chỉ chạy trên SQLite temporary in-memory/temp database.
- **Media & Assets:** Không tự ý tạo hoặc download hình ảnh chưa có bản quyền từ nguồn lạ; giữ đúng media ledger.
- **Không mock dữ liệu tuyển sinh/học phí:** Toàn bộ dữ liệu tuyển sinh đang mở vẫn duy trì trạng thái trung tính chờ xác nhận chính thức từ Hội đồng Tuyển sinh Topica thông qua các phiếu hỏi tại `PHASE_B_STAKEHOLDER_PACKETS.md`.
- **Git Policy:** Không thực hiện bất kỳ lệnh `git push` nào theo đúng Zero-Trust Git Policy.
