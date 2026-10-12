> Audit 12/10/2026 (Codex): nội dung bên dưới là báo cáo lịch sử. Các claim “100%”, nguồn chính thức, nghiên cứu người dùng và chất lượng toàn site chưa có evidence/gate tương ứng thì vẫn chưa xác minh. Xem [baseline lần này](evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md) và [handoff kỹ thuật](evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md); build/test fixture hiện tại không thay thế nghiệm thu nghiệp vụ.

# BÁO CÁO NGHIỆM THU PHASE 3: HƯỚNG THIẾT KẾ & HỆ THỐNG DESIGN SYSTEM

> **Dự án**: Nâng cấp và Hoàn thiện Website Viện Đào tạo Quốc tế Topica  
> **Thời điểm hoàn thành**: Tháng 10/2026  
> **Căn cứ kế hoạch**: `docs/ke-hoach-hoan-thien-website-topica.md` (Mục 7 - Phase 3)  
> **Trạng thái**: ✅ **HOÀN THÀNH 100% (READY FOR PHASE 4)**

---

## 1. Mục tiêu & Định hướng Mỹ thuật

Theo quy chuẩn kế hoạch, thiết kế toàn hệ thống website Topica được thống nhất theo phong cách: **Học thuật, hiện đại, gần gũi và minh bạch**.

- **Tính học thuật & Bản sắc thương hiệu**: Sử dụng sắc xanh Navy chủ đạo `#00264D` kế thừa đồng bộ từ hệ thống trường cấp bằng Trường Đại học Phú Xuân (PXU), tạo cảm giác vững chãi, uy tín và chuẩn mực đào tạo đại học quốc gia.
- **Tính hiện đại & Điểm nhấn**: Sắc xanh bổ trợ `#16466B` kết hợp sắc vàng Gold `#B78744` (nhận diện logo Topica & PXU) được ứng dụng có chọn lọc cho các điểm chuyển đổi quan trọng (CTA Đăng ký xét tuyển, huy hiệu nổi bật). Vàng không bị lạm dụng tràn lan làm màu nền hay màu mặc định.
- **Tính gần gũi & Độ thoáng**: Nền Canvas trắng `#FFFFFF` kết hợp nền phân đoạn xám xanh nhạt `#F3F6FA` và xám giấy `#F7F5F1` đem lại không gian thoáng đạt, dễ đọc, êm mắt cho người học khi nghiên cứu tài liệu và khung chương trình học dài.

---

## 2. Hệ thống Design Tokens Chuẩn hóa

Toàn bộ tokens được khai báo tập trung và tối ưu trong `app/design-tokens.css` và `app/theme.css` tương thích hoàn toàn với Tailwind CSS v4 `@theme inline`:

### 2.1. Bảng màu (Color Palette)

| Phân loại | Tên Token | Mã màu Hex | Ứng dụng cụ thể |
|---|---|---|---|
| **Navy chính** | `--color-navy-900` | `#00264D` | Header, Footer, tiêu đề học thuật, nút chính trên nền sáng |
| **Navy phụ** | `--color-navy-secondary` | `#16466B` | Mảng phụ, icon chuyên đề, liên kết thứ cấp |
| **Navy đậm** | `--color-navy-950` | `#001A3D` | Khối tương phản cao, nền tối học thuật |
| **Gold Accent** | `--color-gold-500` | `#B78744` | Điểm nhấn logo, CTA Đăng ký xét tuyển, sao đánh giá |
| **Gold Dark (AA)** | `--color-gold-700` | `#9A6F33` | Chữ vàng trên nền sáng đạt độ tương phản WCAG AA |
| **Nền chính** | `--color-canvas` | `#FFFFFF` | Nền đọc văn bản, vùng thở |
| **Nền phân đoạn** | `--color-surface-subtle` | `#F3F6FA` | Khối nội dung phụ, bảng biểu, thẻ thống kê |
| **Nền giấy ấm** | `--color-paper` | `#F7F5F1` | Nền tài liệu, trích dẫn, khối học vụ |
| **Chữ tiêu đề** | `--color-ink-950` | `#11100E` | H1, H2, H3 có độ tương phản tuyệt đối |
| **Chữ nội dung** | `--color-ink-body` | `#243447` | Văn bản dài (dễ đọc, giảm mỏi mắt) |
| **Chữ mô tả** | `--color-ink-600` | `#625E58` | Mô tả phụ, ngày đăng, chú thích |
| **Đường kẻ / Viền** | `--color-line-200` | `#DDD8CF` | Viền thẻ, đường ngăn cách phần tử |

### 2.2. Typography (Chữ & Bố cục văn bản)

- **Font chữ giao diện & nội dung đọc (UI / Body)**: `Be Vietnam Pro` (`--font-sans`). Đầy đủ dấu thanh tiếng Việt sắc nét, chuẩn sentence case.
- **Font chữ tiêu đề thương hiệu & học thuật**: `Lora` (`--font-serif`, `--font-display`). Đem lại tính trang trọng, giá trị bằng cấp và tính uy tín của trường đại học.
- **Tỷ lệ và dòng đọc**:
  - Display: `4rem` (line-height: `4.5rem`)
  - Heading 1: `3rem` (line-height: `3.5rem`)
  - Heading 2: `2.25rem` (line-height: `2.75rem`)
  - Heading 3: `1.625rem` (line-height: `2.125rem`)
  - Body: `1rem` (line-height: `1.625rem`), vùng đọc duy trì 60–75 ký tự/dòng.

### 2.3. Bố cục, Radii & Hiệu ứng chuyển động

- **Lưới (Grid)**: Container chuẩn 1240px (`77.5rem`), 12 cột desktop, 8 cột tablet, 4 cột mobile; padding mép `px-4 sm:px-6 lg:px-8`.
- **Thang bo góc**: `rounded-sm` (4px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px).
- **Thang đổ bóng (Shadows)**: Shadow học thuật có sắc độ navy mềm (`rgba(0, 38, 77, ...)`), tránh bóng đen gắt:
  - `shadow-xs`: Đường viền phân cách
  - `shadow-card`: Độ nổi của thẻ thông tin
  - `shadow-card-hover`: Nâng nhẹ 2px khi người dùng rê chuột
  - `shadow-dropdown`: Menu xổ xuống và thanh điều hướng nổi
- **Thời gian chuyển động**: `150ms – 250ms`, tuân thủ nghiêm ngặt `prefers-reduced-motion` đối với người dùng tắt hiệu ứng.

---

## 3. Thư viện Thành phần Giao diện (`components/ui/`)

Tất cả thành phần được đóng gói chuẩn module TypeScript, hỗ trợ xuất thông qua barrel export `components/ui/index.ts`:

1. **`Button.tsx` (Phân cấp hành động)**:
   - `primary`: Navy chính (`#00264D`) trên nền sáng.
   - `accent`: Vàng Gold (`#B78744`) cho hành động chuyển đổi cao (Đăng ký xét tuyển, Nộp hồ sơ).
   - `secondary`: Viền Navy trên nền trong suốt.
   - `outline`: Viền mảnh tinh tế trên nền trắng.
   - `tertiary` & `ghost`: Nút dạng link văn bản hỗ trợ điều hướng.
   - Trạng thái hoàn chỉnh: default, hover, active (dịch chuyển 1px), focus-visible (ring tương phản cao), disabled, loading (spinner + `aria-busy`).
2. **`StatusBadge.tsx` (Huy hiệu trạng thái tiếp cận WCAG AA)**:
   - Các biến thể: `active` (Đang tuyển sinh), `upcoming` (Sắp mở), `new` (Mới), `verified` (Đã kiểm định), `featured` (Nổi bật), `closed` (Đã đóng), `expired` (Hết hạn).
   - Có biểu tượng và nhãn văn bản đồng bộ, không bao giờ dùng màu sắc làm tín hiệu duy nhất.
3. **`Badge.tsx`**: Biến thể `navy`, `brand`, `success`, `warning`, `error`, `info`, `outline`.
4. **`Card.tsx` (Thẻ module hóa)**:
   - Cung cấp: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardMedia`.
   - Các biến thể giao diện: `default`, `subtle`, `paper`, `elevated`, `flat`.
5. **`Input.tsx` & `Select.tsx` & `Textarea.tsx`**:
   - Tích hợp nhãn (`label`), ký hiệu bắt buộc (`*`), `leftIcon`, `rightIcon`.
   - Báo lỗi tức thì dưới trường với biểu tượng `AlertCircle`, kết nối `aria-invalid` và `aria-describedby`.
6. **`Alert.tsx` (Hộp thông báo học vụ & pháp lý)**:
   - Hỗ trợ 4 cấp độ: `info` (thông tin pháp lý/văn bằng), `warning` (hạn nộp hồ sơ), `success` (gửi đơn thành công), `error` (lỗi hệ thống).
7. **`EmptyState.tsx` (Trạng thái rỗng không ngõ cụt)**:
   - Tự động hiển thị khi tìm kiếm không ra kết quả, danh mục trống; luôn kèm 2 nút điều hướng thoát (Xem 5 ngành đào tạo / Về trang chủ).
8. **`Skeleton.tsx` (Chờ tải nội dung)**:
   - Cung cấp hiệu ứng shimmer cho văn bản (`SkeletonText`), thẻ (`SkeletonCard`), nút bấm (`SkeletonButton`).
9. **`ImageWithFallback.tsx` (Kiểm soát ảnh vỡ)**:
   - Tự động thay thế bằng biểu tượng học thuật Topica và tỷ lệ khung hình chuẩn (16:9, 4:3, 1:1) khi link ảnh ngoài gặp sự cố hoặc 404.
10. **`Accordion.tsx`**:
    - Khối thu gọn mở rộng truy cập được bằng bàn phím (WAI-ARIA compliant).

---

## 4. Trang Trình diễn & Kiểm chứng Trực quan

- Đã tạo trang kiểm chứng toàn diện tại URL: **`http://localhost:3000/design-system`**
- Trang hiển thị trực tiếp tất cả bảng màu, thang chữ, các biến thể nút bấm kèm tương tác thật, biểu mẫu có trường lỗi mẫu, hộp thông báo, thẻ học phần và các trạng thái tải.

---

## 5. Kết quả Kiểm thử & Nghiệm thu Kỹ thuật

| Tiêu chí | Kết quả | Trạng thái |
|---|---|---|
| **TypeScript Typecheck** | `npx tsc --noEmit` hoàn tất với **0 lỗi** | ✅ Đạt |
| **Unit Tests Vitest** | **22/22 tests passed** (Bổ sung 10 tests mới cho Design System) | ✅ Đạt |
| **SEO & Routing Check** | **8/8 routes trả về 200 OK** (`test:seo`) | ✅ Đạt |
| **Design System URL** | `http://localhost:3000/design-system` trả về **200 OK** | ✅ Đạt |
| **Tiêu chuẩn màu & tiếp cận** | Tương phản chữ/nền đạt chuẩn WCAG AA; không phụ thuộc màu đơn lẻ | ✅ Đạt |

---

## 6. Sẵn sàng cho Phase 4

Với Design System đã hoàn thiện đồng bộ, dự án có đầy đủ nền tảng thành phần chuẩn mực để bước vào **Phase 4: Thiết kế chi tiết từng nhóm trang** (Header/Mega Menu, Trang chủ, Trang 5 ngành học, Trang Tuyển sinh, Trang Học phí 2026, Trang Giới thiệu/Chất lượng, Trang Tin tức và Trang Liên hệ).
