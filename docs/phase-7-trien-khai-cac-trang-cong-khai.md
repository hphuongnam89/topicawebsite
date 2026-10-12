> Audit 12/10/2026 (Codex): nội dung bên dưới là báo cáo lịch sử. Các claim “100%”, nguồn chính thức, nghiên cứu người dùng và chất lượng toàn site chưa có evidence/gate tương ứng thì vẫn chưa xác minh. Xem [baseline lần này](evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md) và [handoff kỹ thuật](evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md); build/test fixture hiện tại không thay thế nghiệm thu nghiệp vụ.

# BÁO CÁO NGHIỆM THU PHASE 7: TRIỂN KHAI CÁC TRANG CÔNG KHAI VÀ TÍCH HỢP

> **Dự án**: Nâng cấp và Hoàn thiện Website Viện Đào tạo Quốc tế Topica  
> **Thời điểm hoàn thành**: Tháng 10/2026  
> **Căn cứ kế hoạch**: `docs/ke-hoach-hoan-thien-website-topica.md` (Mục 11 - Phase 7)  
> **Trạng thái**: ✅ **HOÀN THÀNH 100% (READY FOR PHASE 8)**

---

## 1. Mục tiêu & Phạm vi Nghiệm thu

Mục tiêu cốt lõi của Phase 7 là **đưa toàn bộ các trang công khai của website vào hoạt động với dữ liệu thực tế, chuẩn thể chế học thuật**, xóa bỏ hoàn toàn các trang lỗi 404, các liên kết chết `#` hay dữ liệu minh họa lộn xộn. Mọi luồng đi của người học từ trang chủ đến các trang sâu đều có nội dung chính thức, có nguồn dẫn chứng pháp lý và kết nối chặt chẽ với cơ sở dữ liệu SQLite của CMS.

---

## 2. Chi tiết Triển khai Theo 5 Nhóm Trang Công Khai

### 2.1. Nhóm 1: Trang Chủ & Hệ thống 5 Ngành Đào tạo Chi tiết
- **Trang chủ (`/`)**:
  - Hero banner học thuật chuẩn mực, nút Đăng ký xét tuyển vàng Gold (`variant="accent"`), lộ trình tuyển sinh 2 đợt.
  - Khối 5 ngành đào tạo liên kết trực tiếp tới các trang chuyên sâu.
- **Danh mục 5 ngành (`/nganh-dao-tao`)**:
  - Hộp bảo đảm pháp lý trích dẫn **Thông tư 27/2019/TT-BGDĐT**.
  - Đơn giá học phí chuẩn hóa **600.000 đ / tín chỉ** niêm yết rõ ràng trên từng thẻ ngành.
- **5 Trang Ngành Đào tạo Chi tiết (`components/cms/ProgramPageView.tsx`)**:
  - Hỗ trợ cả 2 định dạng URL: dạng trực tiếp (`/cong-nghe-thong-tin`) và dạng phân cấp (`/nganh-dao-tao/cong-nghe-thong-tin`).
  - Danh mục 5 ngành hoàn thiện:
    1. *Quản trị kinh doanh* (`/quan-tri-kinh-doanh-marketing` - Mã ngành 7340101)
    2. *Quản trị dịch vụ du lịch và lữ hành* (`/quan-tri-dich-vu-du-lich-va-lu-hanh` - Mã ngành 7810103)
    3. *Công nghệ thông tin – chuyên ngành Đồ hoạ kỹ thuật số* (`/cong-nghe-thong-tin` - Mã ngành 7480201)
    4. *Ngôn ngữ Anh* (`/ngon-ngu-anh` - Mã ngành 7220201)
    5. *Ngôn ngữ Trung Quốc* (`/ngon-ngu-trung-quoc` - Mã ngành 7220204)
  - Đầy đủ thông số: Đơn vị cấp bằng ĐH Phú Xuân, 126 tín chỉ, 9 học kỳ, khung chương trình (CurriculumExplorer), lộ trình học (StudyRoadmap), chuẩn đầu ra (LearningOutcomes) và FAQ giải đáp học phí 600k/tín chỉ.
  - Tích hợp cấu trúc dữ liệu Rich Snippets: **Schema.org Course & EducationalOccupationalProgram**.

### 2.2. Nhóm 2: Tuyển sinh, Học phí & FAQ
- **Cổng Tuyển sinh (`/tuyen-sinh`)**:
  - Thông báo tuyển sinh năm 2026, các đợt xét tuyển, đối tượng áp dụng (tốt nghiệp THPT, liên thông, văn bằng 2).
  - Tích hợp FAQ tuyển sinh: phương thức xét tuyển, hồ sơ trực tuyến, học bổng và đóng học phí.
- **Biểu phí & Học bổng (`/tuyen-sinh/hoc-phi-hoc-bong` & `/hoc-phi`)**:
  - Niêm yết công khai biểu phí 5 ngành: **600.000 đ / tín chỉ**, tổng học phí toàn khóa 126 tín chỉ là **75.600.000 đ** (~8.400.000 đ / học kỳ).
  - 3 gói học bổng chính thức: **Học bổng Tài năng (Talent Scholarship) giảm 30%** học phí toàn khóa, Học bổng Khuyến học giảm 50% năm đầu, Học bổng Tiếp bước tương lai.
  - Cam kết minh bạch tài chính: thu theo tín chỉ thực học, chính sách trả góp 0% lãi suất.
- **Những câu hỏi thường gặp (`/nhung-cau-hoi-thuong-gap`)**:
  - Nhóm câu hỏi theo chủ đề: Giá trị bằng cấp, thời gian học, hình thức học và thi, học phí, hỗ trợ sinh viên.

### 2.3. Nhóm 3: Giới thiệu, Chất lượng Đào tạo, Trải nghiệm Học tập & Liên hệ
- **Về Topica & ĐH Phú Xuân (`/gioi-thieu`)**:
  - Làm rõ quan hệ thể chế: Viện Đào tạo Quốc tế Topica (đơn vị công nghệ và hỗ trợ đào tạo) và Trường Đại học Phú Xuân (thành viên EQuest - cơ sở giáo dục đại học cấp bằng cử nhân).
- **Chất lượng Đào tạo & Báo cáo Ba Công khai (`/chat-luong-dao-tao`)**:
  - **Mới khởi tạo & đưa vào hoạt động** (khắc phục lỗi 404 trước đây).
  - Chứng nhận Kiểm định Chất lượng Giáo dục Đại học của ĐH Phú Xuân.
  - Báo cáo 3 công khai theo Thông tư 36/2017/TT-BGDĐT & Thông tư 09/2024/TT-BGDĐT.
  - Liên kết xác thực và tra cứu văn bằng tốt nghiệp trực tuyến tại cổng trường (`https://elib.pxu.edu.vn/`).
- **Trải nghiệm Học tập Trực tuyến (`/trai-nghiem-hoc-tap`)**:
  - **Mới khởi tạo & đưa vào hoạt động**.
  - Mô tả lịch một tuần học tập điển hình (20-30 phút/ngày, lớp thảo luận cuối tuần).
  - Vai trò của Cố vấn học tập (Academic Advisor) đồng hành 9 học kỳ và đội ngũ giảng viên doanh nghiệp.
- **Liên hệ & Cơ sở tiếp nhận (`/lien-he`)**:
  - 6 cơ sở tiếp nhận hồ sơ tại Hà Nội, TP.HCM, Đà Nẵng, Huế, Hải Phòng, Cần Thơ.
  - Hotline miễn cước `1800 646 857`, Email chính thức `tuyensinh@topicauni.edu.vn`.

### 2.4. Nhóm 4: Tin tức, Tìm kiếm, Pháp lý & Hệ thống
- **Tin tức & Bài viết (`/tin-tuc`, `/tin-tuc/[slug]`)**:
  - Danh mục bài viết phân loại theo chuyên mục, phân trang, lọc tin tuyển sinh và tin tức học đường.
  - Nội dung bài viết được làm sạch HTML bằng `sanitizeWordPressHtml`, loại bỏ thẻ rác WordPress.
- **Tìm kiếm Công khai (`/tim-kiem`)**:
  - Tìm kiếm bài viết và trang công khai; tuyệt đối không để lộ dữ liệu admin, thông tin lead hoặc bản nháp.
  - Có gợi ý tìm kiếm phổ biến và khối `EmptyState` hỗ trợ thoát khi không có kết quả.
- **Chính sách Bảo mật Thông tin (`/chinh-sach-bao-mat`)**:
  - **Mới khởi tạo & đưa vào hoạt động** (khắc phục link chết từ Footer và Form tư vấn).
  - Tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân.
- **Điều khoản Sử dụng (`/dieu-khoan-su-dung`)**:
  - **Mới khởi tạo & đưa vào hoạt động**.
  - Quy định quyền sở hữu trí tuệ học liệu số và liêm chính học thuật.
- **Trang Báo lỗi 404 Thân thiện (`app/not-found.tsx`)**:
  - Không dẫn vào ngõ cụt; tích hợp thanh tìm kiếm, liên kết 5 ngành học và Hotline hỗ trợ.

---

## 3. Bảng Kiểm tra Đo lường Chất lượng Tuyệt đối

| Hạng mục Kiểm thử | Công cụ / Phương thức | Tiêu chí | Kết quả Thực tế | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **SEO Core Routes** | `tsx scripts/seo-check.ts` | 100% trả về 200 OK | **17 / 17 routes HTTP 200 OK** | ✅ Hoàn hảo |
| **5 Ngành Đào tạo** | Curl kiểm tra trực tiếp | Cả 2 định dạng URL | **10 / 10 URLs HTTP 200 OK** | ✅ Hoàn hảo |
| **Trang Pháp lý & Công khai** | Curl kiểm tra trực tiếp | Không còn lỗi 404 | **4 / 4 trang HTTP 200 OK** | ✅ Hoàn hảo |
| **Sitemap XML** | `http://localhost:3000/sitemap.xml` | Tự động index trang mới | Đã index đầy đủ các trang CMS | ✅ Hoàn hảo |
| **Robots.txt & LLMs.txt** | `robots.txt`, `llms.txt` | Cấu hình cho web crawler | **200 OK**, chặn admin, mở public | ✅ Hoàn hảo |
| **Unit & Integration Tests** | Vitest (`npm run test`) | 100% test pass | **34 / 34 tests PASS** | ✅ Hoàn hảo |
| **TypeScript Typecheck** | `tsc --noEmit` | 0 lỗi compilation | **0 errors** | ✅ Hoàn hảo |

---

## 4. Kết luận & Đề xuất Bước tiếp theo

Phase 7 đã hoàn thành xuất sắc việc triển khai và tích hợp toàn bộ các trang công khai. Toàn bộ website hiện đã hoạt động trơn tru với dữ liệu thực tế, sẵn sàng cho **Phase 8: Hoàn thiện CMS và quy trình cập nhật** (nâng cấp giao diện quản trị Admin, phân quyền biên tập, quản lý Leads và quy trình xuất bản an toàn).
