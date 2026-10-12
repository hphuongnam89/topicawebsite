# Đợt 0 — Baseline, An toàn và Kiểm soát Ownership

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Git HEAD: `f5a6b34709b6f4a88df0e2db10348f7f959ae8bc` (kèm uncommitted changes đã đối chiếu)
- Runtime: Node `v24.19.0`, npm `11.17.0`, Next.js `16.3.3`
- Kế hoạch tham chiếu: [HYPER_UI_REMEDIATION_PLAN.md](../../agent-execution/HYPER_UI_REMEDIATION_PLAN.md)

---

## 1. Kiểm tra an toàn môi trường & Cô lập dữ liệu (Safety Isolation)

1. **Database:**
   - Database sản xuất `data/topica.db` được bảo vệ nghiêm ngặt (chỉ đọc, không chạy mutation/seed lại).
   - Kiểm thử tự động sử dụng SQLite in-memory hoặc temp file cô lập (đã xác nhận theo R01 qua `scripts/qa-workspace.ts` và `lib/db/safety.ts`).
2. **Media & Storage:**
   - Thư mục uploads thực tế không bị ghi đè bởi test runner.
   - Thư mục backups lưu trữ độc lập.
3. **Outbound Notifications:**
   - Webhooks, email và Telegram notification được mock/stub hoàn toàn trong test; không gửi dữ liệu giả lập ra ngoài.
4. **Build & QA Environment:**
   - Các cổng test và dev server chạy độc lập (ví dụ cổng 3111 trong review baseline, không can thiệp cổng production).

---

## 2. Trạng thái Baseline trước Đợt A (Pre-remediation Baseline)

| Finding ID | Mô tả lỗi | Điểm xuất hiện | Trạng thái trước sửa |
|---|---|---|---|
| **HUI-01** | CTA sai nhãn & hành vi: "Xem trạng thái hồ sơ" trỏ `#chuong-trinh` | `components/program/ProgramHero.tsx:87` | Mâu thuẫn label và action thật |
| **HUI-02** | Không thống nhất trạng thái kỳ tuyển sinh (Catalog có badge "Đang tuyển sinh", Home rỗng kỳ) | `components/sections/ProgramsSection.tsx`, `CurrentAdmissions.tsx` | Khác biệt nguồn dữ liệu |
| **HUI-03** | Lệch typography và màu trang ngành so với hệ thống | `data/program-details.ts`, design tokens | Cần chuẩn hóa theo spec R08 |
| **HUI-04** | Trình tự trang chủ chưa tối ưu (ngành học ở y=2467px, quy trình chiếm 1481px) | `app/(main)/page.tsx` | Cần Narrative Workflow |
| **HUI-05** | Tablet 768px: Email dính "Cổng Elearning"; Floating actions cạnh tranh | `components/layout/Header.tsx`, `FloatingActions.tsx` | Utility header chật chội |
| **HUI-06** | Lộ tên file JPG nội bộ và note biên tập ra ngoài trang public | `components/program/ProgramQuickFacts.tsx`, `supplemental-program-details.ts` | Thiếu tính an toàn public |
| **HUI-07** | Logo đối tác 6–9 vô danh ("Đối tác X"); ảnh hero chưa có ledger quyền | `components/sections/PartnersSection.tsx`, `HeroSection.tsx` | Thiếu Media Ledger |
| **HUI-08** | Ba nút liên hệ nổi đa sắc cyan/blue/red phân tán sự chú ý | `components/layout/FloatingActions.tsx` | Cần gom gọn và hạ màu |
| **HUI-09** | CSS cascade: `.animate-marquee` base ghi đè rule `prefers-reduced-motion` | `app/globals.css:476` | Marquee chạy liên tục trong reduce mode |

---

## 3. Quyết định Gate Đợt 0
- **Điều kiện Gate:** ĐÃ ĐẠT (Passed).
- Môi trường đảm bảo an toàn tuyệt đối để tiến hành Đợt A (các subtask kỹ thuật độc lập).
