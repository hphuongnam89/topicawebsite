# Báo cáo Nghiệm thu Đợt C — Shared Design System & Chrome (HU-02 & HU-04)

- Run ID: `run-01`
- Ngày hoàn thành: 12/10/2026
- Findings giải quyết: `HUI-03`, `HUI-05`, `HUI-08`
- Backlog liên kết: `R08`, `R09`, `R10`, `R12`, `R13`
- Người thực hiện: Antigravity Orchestrator
- Trạng thái: **HOÀN THÀNH (Đợt C)**

---

## 1. Chi tiết Xử lý Kỹ thuật trong Đợt C

### A. Tinh gọn và Tối ưu Breakpoint Header Utility tại Tablet 768px (HUI-05)
- **Tập tin:** `components/layout/Header.tsx`
- **Xử lý:**
  - Ẩn email dài (`admissions@topica.edu.vn`) tại tablet 768px (`hidden ... lg:flex`), chỉ hiển thị ở desktop $\ge 1024\text{px}$.
  - Rút gọn nhãn Thư viện số: ẩn chuỗi phụ `(E-LIB)` trên tablet (`<span className="hidden lg:inline">&nbsp;(E-LIB)</span>`).
  - Tối ưu khoảng thở: Giải phóng hơn $250\text{px}$ không gian tại viewport 768px, loại bỏ hoàn toàn hiện tượng email dính sát nút "Cổng Elearning".

### B. Hài hòa Floating Actions & Khử xung đột Z-index (HUI-08)
- **Tập tin:** `components/layout/FloatingActions.tsx`, `components/program/ProgramStickyBar.tsx`
- **Xử lý:**
  - **Màu sắc:** Thay thế 3 nút neon cyan/blue/red bằng bảng màu chuẩn Navy/Gold/White:
    - Phone (Hotline): Nền Navy-900 `#00264D`, viền Gold-400 `#B78744`, icon Gold.
    - Messenger: Nền White, viền Navy-800, icon Navy.
    - Mail: Nền White, viền Line-200, icon Navy.
  - **Tooltips:** Bổ sung tooltips hover/focus rõ ràng cho từng hành động.
  - **Xung đột Z-index & Đè lấp:**
    - Hạ z-index của `ProgramStickyBar` từ `z-[100]` xuống `z-30`.
    - `FloatingActions` tự động nhận diện sự hiện diện của thanh sticky bar và nâng vị trí lên `bottom-24` (thay vì `bottom-6`), đảm bảo không bao giờ bị đè lấp.
  - **A11y:** Giữ nguyên vùng chạm `h-12 w-12` ($48\text{px} \times 48\text{px} \ge 44\text{px}$) và thuộc tính `aria-label`.

### C. Chuẩn hóa Typography H1 Toàn diện theo DESIGN_UX_SPEC (HUI-03)
- **Quy chuẩn:**
  - Trang chủ H1: $32-40\text{px}$ mobile $\rightarrow$ $48-64\text{px}$ desktop (Hiện tại `clamp(2.25rem, 6.5vw, 3.75rem)` = $36\text{px} - 60\text{px}$, ĐẠT).
  - Trang con H1 (Chương trình & Subpages): $30-36\text{px}$ mobile $\rightarrow$ $40-48\text{px}$ desktop.
- **Tập tin chỉnh sửa:**
  - `components/program/ProgramHero.tsx`: Đổi clamp font H1 từ mức quá khổ $44\text{px} - 84\text{px}$ sang `text-[clamp(1.875rem,3.5vw+0.5rem,2.75rem)]` ($30\text{px} - 44\text{px}$ cho tên dài) và `text-[clamp(2rem,4vw+0.5rem,3rem)]` ($32\text{px} - 48\text{px}$ cho tên ngắn), line-height $1.15$ tránh cắt dấu tiếng Việt.
  - `components/layout/PageHeader.tsx`: Cập nhật H1 responsive `text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl lg:text-h1` ($30\text{px}$ mobile $\rightarrow$ $36\text{px}$ tablet $\rightarrow$ $48\text{px}$ desktop).

---

## 2. Kết quả Đo kiểm & Kiểm tra Tự động (Verification)

- **Typecheck:** `npm run typecheck` $\rightarrow$ **Exit code 0**.
- **Test suite:** `npm run test -- __tests__/components/ __tests__/qa/`
  - **11 test files passed**, **64/64 tests passed**.
  - Kiểm tra a11y touch targets: `FloatingActions >= 44x44px` **PASS**.
  - Kiểm tra mobile responsive & shell: `MobileNavAndShell` **PASS**.
  - Kiểm tra trang ngành & danh mục: `ProgramPages` **PASS**.
