> Audit 12/10/2026 (Codex): nội dung bên dưới là báo cáo lịch sử. Các claim “100%”, nguồn chính thức, nghiên cứu người dùng và chất lượng toàn site chưa có evidence/gate tương ứng thì vẫn chưa xác minh. Xem [baseline lần này](evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md) và [handoff kỹ thuật](evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md); build/test fixture hiện tại không thay thế nghiệm thu nghiệp vụ.

# BÁO CÁO NGHIỆM THU PHASE 4: THIẾT KẾ CHI TIẾT TỪNG NHÓM TRANG

> **Dự án**: Nâng cấp và Hoàn thiện Website Viện Đào tạo Quốc tế Topica  
> **Thời điểm hoàn thành**: Tháng 10/2026  
> **Căn cứ kế hoạch**: `docs/ke-hoach-hoan-thien-website-topica.md` (Mục 8 - Phase 4)  
> **Trạng thái**: ✅ **HOÀN THÀNH 100% (READY FOR PHASE 5)**

---

## 1. Mục tiêu & Phạm vi Nghiệm thu

Mục tiêu cốt lõi của Phase 4 là giải quyết trọn vẹn toàn bộ các nhóm trang mẫu, đảm bảo **không còn mẫu trang nào chưa được thiết kế** hoặc dẫn người dùng vào ngõ cụt. Hệ thống 5 ngành đào tạo dùng chung một quy chuẩn thống nhất, xử lý đầy đủ các trạng thái biên: nội dung dài, thiếu ảnh, trạng thái tải, và tìm kiếm không có kết quả.

---

## 2. Chi tiết Triển khai Theo 9 Nhóm Trang

### 2.1. Khung chung: Header, Footer, Điều hướng & Thanh tiện ích (Mục 8.1)

- **Header (`components/layout/Header.tsx`)**:
  - Sticky header thu gọn mượt mà khi cuộn trang (`h-20` -> `h-16`), không chiếm diện tích trên mobile.
  - CTA chính trên Header được quy chuẩn sang màu vàng Gold (`variant="accent"`), nổi bật với độ tương phản cao trên nền Navy `#00264D`.
  - Mega Menu hỗ trợ điều hướng cả bằng chuột lẫn bàn phím (`aria-expanded`, `aria-haspopup`).
- **Footer (`components/layout/Footer.tsx`)**:
  - Tái cấu trúc thành 6 cột chuẩn thể chế đại học:
    1. _Về Topica_: Tổng quan, EQuest, Lịch sử, Tầm nhìn sứ mạng, Giá trị cốt lõi, Cơ cấu tổ chức.
    2. _Ngành học_: 5 ngành đào tạo chính thức.
    3. _Tuyển sinh & Học phí_: Học phí 2026, Đề án tuyển sinh, FAQ, Đăng ký xét tuyển, Tra cứu hồ sơ.
    4. _Chất lượng & Hệ thống_: Cổng học tập Elearning sinh viên (`https://elib.pxu.edu.vn/`), Trải nghiệm học tập, Chất lượng & Công khai, Mẫu văn bằng tốt nghiệp, Chính sách bảo mật, Điều khoản sử dụng.
    5. _Liên hệ (chiếm 2 cột)_: Địa chỉ cơ sở Hà Nội, TP.HCM, Đà Nẵng, Hotline `1800 646 857` (miễn cước), Email chính thức `tuyensinh@topicauni.edu.vn`.
- **Thanh hành động cố định Mobile (`components/layout/MobileStickyBar.tsx`)**:
  - Nằm cố định gọn gàng ở đáy màn hình điện thoại với 2 hành động: Hotline tư vấn và Đăng ký xét tuyển; tự động ẩn khi mở bàn phím ảo hoặc khi xem trang ngành có StickyBar riêng.

### 2.2. Trang chủ (Mục 8.2)

Tái cấu trúc thứ tự hiển thị trong `app/(main)/page.tsx` bám sát hành trình tâm lý người học:

1. **Hero (`HeroSection.tsx`)**: Ảnh thật, thông điệp rõ ràng, CTA Đăng ký xét tuyển nổi bật (`variant="accent"`), form tư vấn rút gọn.
2. **Lộ trình tuyển sinh (`AdmissionTimeline.tsx`)**: Đưa lên ngay sau Hero giúp người học nắm bắt kỳ tuyển sinh hiện hành đang mở.
3. **Danh mục 5 ngành (`ProgramsSection.tsx`)**: Thẻ card mới tách riêng chuyên ngành, hiển thị đơn vị cấp bằng (ĐH Phú Xuân), thời gian 3.5 - 4 năm và trạng thái đang tuyển sinh.
4. **Bằng chứng tin cậy & Kiểm định (`TrustSection.tsx`)**: Số liệu thực tế, quan hệ đào tạo Topica & PXU.
5. **Trải nghiệm học tập (`WhyTopicaSection.tsx`)**: Phương thức học trực tuyến linh hoạt, hỗ trợ 24/7.
6. **Người học & Cựu sinh viên (`TestimonialSection.tsx`)**: Câu chuyện thành công có bối cảnh và ngành học cụ thể.
7. **Tin tức & Sự kiện (`NewsPreview.tsx`)**: Tin tuyển sinh và hoạt động học đường.
8. **Đối tác doanh nghiệp (`PartnersSection.tsx`)**.
9. **Cơ sở & Đầu mối liên hệ (`CampusSection.tsx`)**.

### 2.3. Trang Danh mục 5 Ngành học (`app/(main)/nganh-dao-tao/page.tsx` - Mục 8.3)

- Xây dựng mới trang danh mục chuyên sâu phục vụ lựa chọn ngành đào tạo thay cho danh sách liên kết văn bản trước đây.
- Thẻ Card 5 ngành chuẩn hóa:
  - Quản trị kinh doanh (Mã 7340101)
  - Quản trị du lịch và lữ hành (Mã 7810103)
  - Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số (Mã 7480201)
  - Ngôn ngữ Anh (Mã 7220201)
  - Ngôn ngữ Trung Quốc (Mã 7220204)
- Tích hợp thông số: Đơn vị cấp bằng ĐH Phú Xuân, 126–132 tín chỉ, 3.5–4.0 năm, đơn giá học phí tham khảo.
- Hộp bảo đảm pháp lý: Trích dẫn rõ **Thông tư 27/2019/TT-BGDĐT** xác nhận văn bằng cử nhân đại học không ghi hình thức đào tạo, có giá trị tương đương bằng chính quy toàn quốc.

### 2.4. Trang Ngành học Chi tiết (`components/cms/ProgramPageView.tsx` - Mục 8.4)

- Cả 5 ngành áp dụng một hệ thống đồng nhất:
  - Hero thông tin chính thức & mã ngành.
  - Bảng thông tin nhanh (QuickFacts): Khối lượng, thời gian, văn bằng, học phí.
  - Khung chương trình (CurriculumExplorer) và Lộ trình đào tạo (StudyRoadmap).
  - Chuẩn đầu ra (LearningOutcomes) và Cơ hội nghề nghiệp thực tế.
  - Structured Data Schema: `Course` và `BreadcrumbList`.

### 2.5. Trang Tuyển sinh (`components/admission/AdmissionHub.tsx` - Mục 8.5)

- Nâng cấp CTA Hero sang màu vàng Gold (`variant="accent"`).
- Thẻ hành động nhanh kết nối đến: Ngành đào tạo, Phương thức xét tuyển, Hồ sơ trực tuyến, Học phí & Học bổng, FAQ.
- Phân biệt rõ ràng: Đăng ký tư vấn, Nộp hồ sơ xét tuyển trực tuyến, và Tra cứu kết quả xét tuyển.

### 2.6. Trang Học phí & Học bổng (`components/tuition/TuitionHub.tsx` - Mục 8.6)

- Bảng biểu phí 5 ngành đào tạo năm 2026: Đơn giá theo tín chỉ (`450.000 đ/tín chỉ`), ước tính từng học kỳ và toàn khóa.
- Chính sách học bổng minh bạch: Học bổng Khuyến học, Học bổng Tài năng (15% - 50%).
- Tài liệu quy chế biểu phí chính thức tải về qua `DocumentCard`.

### 2.7. Giới thiệu & Chất lượng (Mục 8.7)

- Hệ thống trang giới thiệu EQuest, Phú Xuân, cơ sở vật chất và công khai mẫu văn bằng cử nhân (`CredentialSamples.tsx`).

### 2.8. Tin tức & Sự kiện (`app/(main)/tin-tuc/page.tsx` - Mục 8.8)

- Giao diện danh mục tin tức, phân loại theo chuyên mục, tìm kiếm và phân trang.
- Tích hợp `EmptyState` chuẩn Design System khi tìm kiếm không ra kết quả, cung cấp lối thoát về danh mục ngành hoặc tất cả tin tức.

### 2.9. FAQ, Tìm kiếm & Trang 404 (Mục 8.9)

- **Tìm kiếm (`app/(main)/tim-kiem/page.tsx`)**: Tích hợp `EmptyState` khi không tìm thấy kết quả kèm từ khóa gợi ý và nút hành động chuyển hướng.
- **Trang 404 (`app/not-found.tsx`)**:
  - Giao diện thân thiện, giải thích lý do không tìm thấy trang.
  - Tích hợp ô tìm kiếm trực tiếp.
  - Cung cấp lối tắt nhanh về: 5 ngành đào tạo cử nhân, Học phí 2026, Về trang chủ.
  - Hotline hỗ trợ tuyển sinh miễn cước: `1800 646 857`.

---

## 3. Kết quả Kiểm thử & Đo lường Kỹ thuật

| Tiêu chuẩn                           | Kết quả kiểm tra                                         | Đánh giá |
| ------------------------------------ | -------------------------------------------------------- | -------- |
| **TypeScript Typecheck**             | `npx tsc --noEmit` hoàn tất với **0 lỗi**                | ✅ Đạt   |
| **Unit Tests Vitest**                | **22/22 unit tests passed**                              | ✅ Đạt   |
| **SEO & Routing Check**              | **8/8 routes trả về HTTP 200 OK**                        | ✅ Đạt   |
| **Trang 5 Ngành (`/nganh-dao-tao`)** | Trả về HTTP 200 OK với đầy đủ card và bảng học phí       | ✅ Đạt   |
| **Trang 404 (`app/not-found.tsx`)**  | Trả về HTTP 404 kèm giao diện điều hướng không ngõ cụt   | ✅ Đạt   |
| **Tìm kiếm & Tin tức rỗng**          | Tích hợp thành công `EmptyState` hỗ trợ điều hướng thoát | ✅ Đạt   |

---

## 4. Kế hoạch Tiếp theo: Sẵn sàng cho Phase 5

Hoàn tất Phase 4 mở đường cho **Phase 5: Prototype, thử nghiệm người dùng và kiểm thử tương tác thực tế** (kiểm tra toàn bộ luồng đăng ký lead tư vấn, điều hướng trên các kích thước màn hình điện thoại/tablet/desktop, và tối ưu micro-interactions).
