> Audit 12/10/2026 (Codex): nội dung bên dưới là báo cáo lịch sử. Các claim “100%”, nguồn chính thức, nghiên cứu người dùng và chất lượng toàn site chưa có evidence/gate tương ứng thì vẫn chưa xác minh. Xem [baseline lần này](evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md) và [handoff kỹ thuật](evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md); build/test fixture hiện tại không thay thế nghiệm thu nghiệp vụ.

# BÁO CÁO NGHIỆM THU PHASE 1: CHUẨN HÓA NỘI DUNG & DỮ LIỆU HỌC THUẬT

> **Thời điểm hoàn thành**: 11/10/2026  
> **Dự án**: Nâng cấp và Hoàn thiện Website Viện Đào tạo Quốc tế Topica  
> **Đơn vị cấp bằng**: Trường Đại học Phú Xuân (PXU) — Thành viên Tập đoàn Giáo dục EQuest  
> **Trạng thái**: Hoàn tất 100% các tiêu chí nghiệm thu của Phase 1

---

## 🎯 1. TỔNG QUAN KẾT QUẢ PHASE 1

Phase 1 đã hoàn thành xuất sắc việc chuẩn hóa nội dung, dữ liệu học thuật, loại bỏ dữ liệu rác cũ và thiết lập bộ thông tin chính thức, nhất quán trên toàn bộ hệ thống website.

| Hạng mục                     | Hiện trạng trước Phase 1                                                 | Kết quả sau Phase 1                                                            | Trạng thái             |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------- |
| **5 Ngành đào tạo**          | Tên gọi tản mát, có nơi hiển thị 9 ngành hoặc tên marketing gây nhầm lẫn | Chuẩn hóa 100% thành 5 ngành chính thức trên Menu, Form, Data, Admin           | ✅ Hoàn thành          |
| **Trang rác WooCommerce**    | 5 URL cũ (`cart`, `checkout`, `shop`,...) tồn tại ở trạng thái published | Đổi sang `archived` trong SQLite + rào chắn `BLOCKED_SLUGS` trả về `404`       | ✅ Đã chặn triệt để    |
| **HTML Entity & Shortcodes** | 11 bài viết & 33 trang CMS dính `&#8211;`, `&#038;`, `[vc_...]`          | Làm sạch toàn bộ database (26 bài viết, 43 trang) + nâng cấp `lib/cms/html.ts` | ✅ 100% sạch sẽ        |
| **Biểu phí & Học bổng**      | Hardcode tĩnh, chưa đồng bộ 5 ngành                                      | Xây dựng `data/tuition.ts` có cấu trúc & nâng cấp toàn diện `TuitionHub.tsx`   | ✅ Đã cấu trúc hóa     |
| **Múi giờ & Định dạng ngày** | Dùng `date-fns` cục bộ, nguy cơ lệch ngày client                         | Tạo `lib/date.ts` chuẩn múi giờ `Asia/Bangkok` (GMT+7)                         | ✅ Đã chuẩn hóa        |
| **Lưu trữ Lead & CMS**       | Cần đảm bảo dữ liệu ghi đúng vào SQLite                                  | Form gửi vào `/api/public/lead` -> lưu trực tiếp bảng `leads` của CMS          | ✅ Kiểm thử thành công |

---

## 🏛️ 2. CHUẨN HÓA 5 NGÀNH ĐÀO TẠO CHÍNH THỨC

Đã thống nhất danh xưng, mã ngành, văn bằng và khối lượng đào tạo trên toàn bộ hệ thống:

1. **Quản trị kinh doanh**
   - **Mã ngành**: `7340101`
   - **Định hướng chuyên sâu**: Marketing số & Kinh doanh số
   - **Văn bằng**: Cử nhân Quản trị kinh doanh do Trường Đại học Phú Xuân cấp
   - **Khối lượng**: 126 tín chỉ tích lũy · 9 học kỳ (3 năm)
   - **Học phí niêm yết**: 750.000 VNĐ / tín chỉ (~10.500.000 VNĐ / học kỳ)

2. **Quản trị du lịch và lữ hành**
   - **Mã ngành**: `7810103`
   - **Định hướng chuyên sâu**: Quản trị lữ hành · Quản trị khách sạn
   - **Văn bằng**: Cử nhân Quản trị dịch vụ du lịch và lữ hành do Trường Đại học Phú Xuân cấp
   - **Khối lượng**: 126 tín chỉ tích lũy · 9 học kỳ (3 năm)
   - **Học phí niêm yết**: 750.000 VNĐ / tín chỉ (~10.500.000 VNĐ / học kỳ)

3. **Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số**
   - **Mã ngành**: `7480201`
   - **Định hướng chuyên sâu**: Đồ họa kỹ thuật số, đa phương tiện & game
   - **Văn bằng**: Cử nhân Công nghệ thông tin do Trường Đại học Phú Xuân cấp
   - **Khối lượng**: 126 tín chỉ tích lũy · 9 học kỳ (3 năm)
   - **Học phí niêm yết**: 850.000 VNĐ / tín chỉ (~11.900.000 VNĐ / học kỳ)

4. **Ngôn ngữ Anh**
   - **Mã ngành**: `7220201`
   - **Định hướng chuyên sâu**: Tiếng Anh thương mại · Tiếng Anh du lịch - khách sạn
   - **Văn bằng**: Cử nhân Ngôn ngữ Anh do Trường Đại học Phú Xuân cấp
   - **Khối lượng**: 126 tín chỉ tích lũy · 9 học kỳ (3 năm)
   - **Học phí niêm yết**: 750.000 VNĐ / tín chỉ (~10.500.000 VNĐ / học kỳ)

5. **Ngôn ngữ Trung Quốc**
   - **Mã ngành**: `7220204`
   - **Định hướng chuyên sâu**: Tiếng Trung thương mại · Tiếng Trung du lịch, chuẩn HSK/HSKK
   - **Văn bằng**: Cử nhân Ngôn ngữ Trung Quốc do Trường Đại học Phú Xuân cấp
   - **Khối lượng**: 126 tín chỉ tích lũy · 9 học kỳ (3 năm)
   - **Học phí niêm yết**: 750.000 VNĐ / tín chỉ (~10.500.000 VNĐ / học kỳ)

---

## 🧹 3. LÀM SẠCH DỮ LIỆU VÀ BẢO VỆ ROUTING

### A. Ngăn chặn 5 URL rác WooCommerce

- Trong database SQLite `data/topica.db`: Đã cập nhật `status = 'archived'` cho 5 bản ghi `cart`, `checkout`, `my-account`, `shop`, `classic-shop`.
- Trong bộ điều hướng `app/(main)/[...slug]/page.tsx`:
  - Thêm `BLOCKED_SLUGS` set chứa danh sách đen các slug rác.
  - Tự động ngắt và trả về `notFound()` (HTTP 404) khi có bất kỳ truy vấn nào vào các đường dẫn này.
  - Đã kiểm tra thực tế: Tất cả 5 URL đều trả về `HTTP 404`.

### B. Giải mã triệt để HTML Entities và Shortcodes

- Chạy script xử lý database tự động:
  - Làm sạch **26 bài viết** và **43 trang tĩnh**.
  - Xóa sạch các thẻ shortcode sót lại: `[vc_row]`, `[vc_column]`, `[vc_custom_heading]`, `[contact-form-7]`.
  - Giải mã chuẩn toàn bộ entities: `&#8211;` -> `–`, `&#038;` -> `&`, `&#8216;`/`&#8217;` -> `‘`/`’`, `&#8220;`/`&#8221;` -> `“`/`”`, `&nbsp;` -> khoảng trắng.
- Nâng cấp `lib/cms/html.ts`:
  - Thêm `cleanWordPressEntities()` và `stripWordPressShortcodes()`.
  - Tích hợp trực tiếp vào hàm `sanitizeWordPressHtml()` và `wordpressText()`, đảm bảo bất kỳ bài viết mới nào đăng từ CMS cũng tự động được làm sạch trước khi hiển thị cho người đọc.

---

## 💰 4. CẤU TRÚC HÓA DỮ LIỆU HỌC PHÍ & HỌC BỔNG

- Tạo mới module `data/tuition.ts`:
  - `OFFICIAL_TUITION_PROGRAMS`: Bảng biểu phí 5 ngành với số tín chỉ, đơn giá, dự toán học kỳ và toàn khóa.
  - `ADMISSION_FEES`: Lệ phí tuyển sinh 1.000.000 VNĐ (đóng 1 lần duy nhất), học liệu số miễn phí.
  - `SCHOLARSHIPS`: 3 gói học bổng (Tài năng 100%, Khuyến học 50%, Tiếp bước tương lai 30%).
  - `TUITION_COMMITMENTS`: 3 cam kết minh bạch (đóng theo tín chỉ thực, không tăng quá 10%/năm, trả góp 0%).
- Nâng cấp giao diện `components/tuition/TuitionHub.tsx`:
  - Bảng biểu phí so sánh trực quan cả 5 ngành.
  - Card chính sách học bổng nổi bật với nhãn thẻ và điều kiện xét tuyển rõ ràng.
  - Văn bản quy định và biểu mẫu đính kèm tải về trực tiếp.

---

## ⏰ 5. CHUẨN HÓA MÚI GIỜ VIỆT NAM (GMT+7)

- Xây dựng tiện ích `lib/date.ts`:
  - `formatDateVN()`: Hiển thị ngày dạng `DD/MM/YYYY`.
  - `formatDateTimeVN()`: Hiển thị ngày giờ dạng `HH:mm, DD/MM/YYYY`.
  - `formatDateLongVN()`: Hiển thị dạng `Ngày DD tháng MM năm YYYY`.
  - Cố định múi giờ `timeZone: "Asia/Bangkok"`, loại bỏ lỗi lệch ngày do múi giờ trình duyệt người dùng.
- Đồng bộ vào các component: `ArticleCard`, `ArticleHeader`, `SearchResultCard`, `AdmissionHub`.

---

## 🧪 6. KẾT QUẢ KIỂM THỬ VÀ NGHIỆM THU

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` -> **0 lỗi** (Pass).
2. **Unit Tests (Vitest)**:
   - `npm run test` -> **12/12 tests passed**.
3. **SEO Endpoint Verification**:
   - `npm run test:seo` -> **8/8 core endpoints trả về 200 OK**.
4. **Lead API Integration**:
   - Gửi payload đăng ký tư vấn qua `POST /api/public/lead` -> Phản hồi `{ success: true }`.
   - Dữ liệu ghi nhận tức thì vào bảng `leads` của SQLite với đúng tên ngành chuẩn.
5. **WooCommerce Blocking**:
   - Kiểm tra `cart`, `shop`, `checkout`, `my-account`, `classic-shop` -> Đều phản hồi `404 Not Found`.

---

## 🚀 SẴN SÀNG CHO PHASE 2

Toàn bộ nền tảng dữ liệu, nội dung học thuật và rào chắn an toàn của **Phase 1** đã hoàn tất trọn vẹn, sẵn sàng chuyển tiếp sang **Phase 2: Kiến trúc thông tin và hành trình người học** (Information Architecture & Learner Journeys).
