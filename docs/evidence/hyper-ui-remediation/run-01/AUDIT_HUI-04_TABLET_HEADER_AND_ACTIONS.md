# Báo cáo Audit HUI-04 / HUI-05 / HUI-08 — Header Tablet (700–1100px) & Hành động Nổi (Floating Actions)

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Findings: `HUI-04`, `HUI-05`, `HUI-08`
- Người thực hiện: Antigravity Orchestrator

---

## 1. Audit Breakpoint Utility Header tại Tablet 700–1100px (HUI-05)

### Hiện trạng quan sát được:
- File: `components/layout/Header.tsx:103–152`
- Tại dải chiều rộng 640px – 800px (đặc biệt là 768px):
  - **Khối trái:** Hotline (`Hotline: 1800...` ~160px) + Email (`admissions@topica.edu.vn` ~210px) = ~370px.
  - **Khối phải:** `Cổng Elearning` (~100px) + `|` + `Thư viện số (E-LIB)` (~140px) + `|` + `Học phí 2026` (~90px) = ~350px.
  - Tổng chiều rộng chiếm dụng: $\approx 720\text{px}$, trong khi padding container là $32\text{px} - 48\text{px}$.
- **Hậu quả:** Email sát rạt vào nút "Cổng Elearning", không có khoảng cách an toàn, dễ gây click nhầm và bố cục chật chội (ghi nhận tại `T01-768-top.png`).

### Phương án kỹ thuật xử lý (Thực thi trong Đợt C):
1. **Tinh gọn hiển thị email:** Đổi class của link email từ `sm:flex` thành `lg:flex`. Ở tablet 768px, chỉ hiển thị Hotline kèm icon và số điện thoại, ẩn email dài (vì email đã có sẵn trong menu/footer).
2. **Rút gọn nhãn Thư viện số:** Ẩn chuỗi ` (E-LIB)` trên tablet để tiết kiệm ~50px.
3. **Thêm `gap` và `justify-between` có giới hạn:** Đảm bảo khoảng cách tối thiểu giữa 2 nhóm luôn $\ge 24\text{px}$.

---

## 2. Audit Hành động Nổi (Floating Actions & Sticky Bars) (HUI-08 / HUI-04)

### Hiện trạng quan sát được:
1. **Desktop Floating Actions (`components/layout/FloatingActions.tsx`):**
   - Chứa 3 nút tròn cố định góc phải dưới:
     - Mail: Nền cyan/xanh (`bg-[var(--color-service-mail)]`)
     - Messenger: Nền xanh mạng xã hội (`bg-[var(--color-service-messenger)]`)
     - Phone: Nền đỏ/cam (`bg-[var(--color-service-phone)]`)
   - **Xung đột nhận diện thương hiệu:** 3 màu sắc bão hòa mạnh này cạnh tranh trực tiếp với nhận diện học thuật Navy (`#00264D`/`#16466B`) và Gold (`#B78744`).
   - **Xung đột z-index & bố cục:** Trên trang chi tiết ngành, `ProgramStickyBar.tsx` có `z-[100]` cố định ở đáy màn hình, đè trực tiếp lên cụm Floating Actions ở một số kích thước viewport.
2. **Mobile Sticky Bar (`components/layout/MobileStickyBar.tsx`):**
   - Đã có cơ chế ẩn khi input focus (`handleFocusIn` ẩn thanh khi người dùng đang nhập form), đạt yêu cầu không che bàn phím.
   - Tuy nhiên cần rà soát safe area padding trên iOS Safari (`env(safe-area-inset-bottom)`).

### Phương án kỹ thuật xử lý (Thực thi trong Đợt C):
1. **Hợp nhất Floating Actions:**
   - Gom 3 nút thành **1 nút hỗ trợ đa kênh duy nhất** (icon tai nghe hoặc tin nhắn) mang phong cách Navy/Gold. Khi click mở popover/drawer chứa các kênh liên hệ.
   - Điều chỉnh vị trí nâng cao khỏi đáy (`bottom-20`) khi trang có thanh sticky CTA bên dưới để không bị đè che.
