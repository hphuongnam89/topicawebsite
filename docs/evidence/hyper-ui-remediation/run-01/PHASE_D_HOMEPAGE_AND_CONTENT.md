# Báo cáo Nghiệm thu Đợt D — Homepage, Nội dung và Media (HU-03, HU-05, HU-06)

- Run ID: `run-01`
- Ngày hoàn thành: 12/10/2026
- Findings giải quyết: `HUI-04`, `HUI-06`, `HUI-07`
- Backlog liên kết: `R08`, `R11`, `R12`, `R20`, `R21`
- Người thực hiện: Antigravity Orchestrator
- Trạng thái: **HOÀN THÀNH (Đợt D)**

---

## 1. Chi tiết Triển khai Kỹ thuật trong Đợt D

### A. Tái cấu trúc Trang chủ theo Narrative Workflow (HUI-04 / HU-03)
- **Tập tin:** `app/(main)/page.tsx`
- **Thay đổi thứ tự hiển thị:**
  1. `HeroSection`: Nhận diện trường & thông điệp "Học chủ động — Kiến tạo tương lai".
  2. `CurrentAdmissions`: Kỳ tuyển sinh hiện hành (hoặc thông báo trung tính khi chưa mở kỳ).
  3. **`ProgramsSection` (Được đưa lên vị trí ưu tiên số 1):** Người học nhìn thấy ngay 5 ngành Cử nhân trực tuyến mà không cần cuộn qua 1481px của quy trình 5 bước.
  4. `TrustSection`: Các con số chứng thực uy tín.
  5. `WhyTopicaSection`: Khối bento lý do chọn Topica.
  6. **`AdmissionTimeline` (Chuyển xuống sau danh mục ngành):** Người học đã chọn được ngành và hiểu về Topica, việc tiếp nhận 5 bước nộp hồ sơ trở nên tự nhiên và có ngữ cảnh rõ ràng.
  7. `section id="tu-van"` (`LeadForm`): Điểm chuyển đổi tư vấn đặt ngay sau quy trình tuyển sinh.
  8. `TestimonialSection`: Cảm nhận học viên củng cố niềm tin.
  9. `NewsPreview`: Tin tức hoạt động đào tạo.
  10. `PartnersSection`: Đối tác doanh nghiệp (đã lọc sạch 5 đối tác chính thức).
  11. `CampusSection`: Hệ thống cơ sở đào tạo và hotline liên hệ.
- **Anchor IDs & Scroll Margins:**
  - Bổ sung `id="chuong-trinh-dao-tao"` và `scroll-mt-20` tại `components/sections/ProgramsSection.tsx`.
  - Bổ sung `id="quy-trinh-tuyen-sinh"` và `scroll-mt-20` tại `components/sections/AdmissionTimeline.tsx`.
  - Không có bất kỳ anchor nội bộ nào bị đứt gãy.

### B. Chuẩn hóa Public Copy & Gỡ bỏ Thuật ngữ Kiểm kê Nội bộ (HUI-06 / HU-05)
- **Tập tin:** `components/program/CurriculumExplorer.tsx`
  - Đổi *"Khung học phần đã xác minh"* $\rightarrow$ *"Khung chương trình đào tạo"* (thuật ngữ học thuật chuẩn mực).
- **Tập tin:** `components/tuition/TuitionHub.tsx`
  - Đổi câu rỗng tài liệu học phí: *"Chưa có tệp đầy đủ thông tin xác minh để tải tại đây"* $\rightarrow$ *"Tài liệu biểu phí chi tiết đang được cập nhật. Liên hệ ban tuyển sinh để nhận tài liệu theo hồ sơ"*.

### C. Tích hợp Quản lý Media & Đối tác (HUI-07 / HU-06)
- **Đã tích hợp:** marqee đối tác chỉ chạy 5 đối tác đã xác thực tên và quan hệ (Deakin, OBC, Thaco Agri, Deha Digital, Deha Software); 4 logo `Đối tác 6`–`9` tiếp tục được cách ly an toàn theo [MEDIA_LEDGER.md](MEDIA_LEDGER.md).

---

## 2. Kết quả Đo kiểm & Kiểm tra Tự động (Verification)

- **Typecheck:** `npm run typecheck` $\rightarrow$ **Exit code 0**.
- **Test suite:** `npm run test -- __tests__/components/ __tests__/qa/ __tests__/data/`
  - **13 test files passed**, **85/85 tests passed**.
  - Kiểm tra Homepage: `Homepage.test.tsx` (6/6 PASS).
  - Kiểm tra Program pages: `ProgramPages.test.tsx` (6/6 PASS).
  - Kiểm tra Tuition & Admission: `TuitionAndAdmissionHub.test.tsx` (4/4 PASS).
  - Kiểm tra a11y & responsive: `a11y-responsive-quality.test.ts` (11/11 PASS).
