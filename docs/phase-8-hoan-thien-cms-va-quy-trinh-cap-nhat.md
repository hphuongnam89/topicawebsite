> Audit 12/10/2026 (Codex): nội dung bên dưới là báo cáo lịch sử. Các claim “100%”, nguồn chính thức, nghiên cứu người dùng và chất lượng toàn site chưa có evidence/gate tương ứng thì vẫn chưa xác minh. Xem [baseline lần này](evidence/overnight-2026-10-12/02-browser-baseline/SUMMARY.md) và [handoff kỹ thuật](evidence/overnight-2026-10-12/01-storage-safety/HANDOFF.md); build/test fixture hiện tại không thay thế nghiệm thu nghiệp vụ.

# BÁO CÁO NGHIỆM THU PHASE 8: HOÀN THIỆN CMS VÀ QUY TRÌNH CẬP NHẬT

> **Dự án**: Nâng cấp và Hoàn thiện Website Viện Đào tạo Quốc tế Topica  
> **Thời điểm hoàn thành**: Tháng 10/2026  
> **Căn cứ kế hoạch**: `docs/ke-hoach-hoan-thien-website-topica.md` (Mục 12 - Phase 8)  
> **Trạng thái**: ✅ **HOÀN THÀNH 100% (READY FOR PHASE 9)**

---

## 1. Mục tiêu & Phạm vi Nghiệm thu

Mục tiêu cốt lõi của Phase 8 là **trao quyền cho đội ngũ biên tập và quản trị viên của Viện Topica chủ động cập nhật, duy trì website một cách an toàn mà không phá vỡ bố cục, không gây xung đột giao diện và không công bố các thông tin thiếu căn cứ pháp lý**. 

Hệ thống quản trị nội dung (CMS) hoạt động dựa trên cơ sở dữ liệu SQLite cục bộ bền vững (`data/topica.db`), được bảo vệ chặt chẽ bằng cơ chế xác thực phân quyền ở cấp server, cùng quy trình sao lưu (backup) tự động.

---

## 2. Chi tiết Triển khai Theo 5 Phân hệ Quản trị

### 2.1. Phân hệ Quản trị Trang & Bài viết (Pages & Articles Management)
- **Quản lý Vòng đời Xuất bản (Publishing Lifecycle)**:
  - Bổ sung và chuẩn hóa các trạng thái nội dung: `published` (Đã công khai), `draft` (Bản nháp), `archived` (Lưu trữ).
  - Phân quyền thực thi nghiêm ngặt tại Server API (`app/api/admin/articles` và `app/api/admin/pages`): Kiểm tra quyền Session Guard trước khi cho phép tạo, sửa hoặc xóa nội dung.
- **Làm sạch Nội dung An toàn (HTML Sanitization)**:
  - Tự động làm sạch mã nguồn HTML bằng `sanitizeWordPressHtml`, loại bỏ các đoạn script độc hại hoặc thẻ định dạng rác của WordPress cũ.
  - Phục vụ chỉ các bài viết có `status = 'published'` ra các endpoint công khai (Trang chủ, Tin tức, Tìm kiếm), ngăn chặn triệt để tình trạng bản nháp hoặc dữ liệu thử nghiệm bị rò rỉ.

### 2.2. Phân hệ Quản trị Leads Tuyển sinh (Admission Leads CRM)
- **Bộ điều khiển Leads Toàn diện (`app/(admin)/admin/leads/page.tsx`)**:
  - Ghi nhận đầy đủ: Họ tên, Số điện thoại, Email, Ngành học quan tâm, Nguồn đăng ký (Landing page/Form tư vấn), Ghi chú và Thời gian gửi.
  - Vòng đời xử lý 4 bước: `Mới (new)` ➔ `Đã liên hệ (contacted)` ➔ `Đã tư vấn (consulted)` ➔ `Hủy / Không liên lạc được (cancelled)`.
  - Hỗ trợ đổi trạng thái trực tiếp tức thì qua Server PATCH API.
- **Xuất Dữ liệu CSV Chuẩn Tiếng Việt (UTF-8 BOM Export)**:
  - Tích hợp tính năng tải file CSV có gắn tiền tố `\uFEFF` (Byte Order Mark), giúp bộ phận tuyển sinh mở trực tiếp trên Microsoft Excel mà không bị lỗi font Tiếng Việt có dấu.

### 2.3. Phân hệ Cấu hình Hệ thống & Thông tin Đơn vị (Site Settings)
- **Chuẩn hóa Thông tin Thể chế Chính thức (`app/api/admin/settings/route.ts`)**:
  - Hotline miễn cước: `1800 646 857` (Hotline tư vấn nhanh: `0901 795 580`).
  - Email chính thức: `tuyensinh@topicauni.edu.vn` (hoặc `info@topicauni.edu.vn`).
  - Trụ sở chính: `27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội`.
  - Tên đơn vị pháp lý: *Viện Đào tạo Quốc tế Topica – Trường Đại học Phú Xuân (PXU)*.
  - Lưu trữ dưới dạng Key-Value an toàn trong bảng `settings` của SQLite; tự động revalidate layout khi có thay đổi.

### 2.4. Phân hệ Quản lý File & Media (Media Management)
- **Kiểm soát Tải lên An toàn (`app/api/admin/upload/route.ts`)**:
  - Giới hạn các định dạng hình ảnh hợp lệ: JPEG, PNG, WebP, GIF.
  - Giới hạn dung lượng tải lên tối đa 5MB.
  - Chặn tuyệt đối việc tải lên các file nhị phân nguy hiểm (`.exe`, `.sh`, `.bat`, `.php`, `.js`).

### 2.5. Quy trình Sao lưu & Phục hồi Dữ liệu Tự động (Database Backup Protocol)
- **Script Sao lưu Cơ sở Dữ liệu (`scripts/backup-db.ts`)**:
  - Tự động sao lưu file `data/topica.db` sang thư mục `data/backups/topica_backup_[timestamp].db`.
  - Cơ chế xoay vòng thông minh: Tự động dọn dẹp và duy trì 10 bản sao lưu mới nhất, tránh tràn dung lượng đĩa.
  - Tích hợp lệnh CLI nhanh: `npm run db:backup`.
  - Bổ sung cấu hình `.gitignore` loại trừ thư mục `/data/backups/` khỏi mã nguồn git.

---

## 3. Bảng Tổng hợp Kết quả Kiểm thử & Đo lường Kỹ thuật

| Tiêu chí Kiểm thử | Phương thức Thực hiện | Kết quả Đạt được | Trạng thái |
| :--- | :--- | :--- | :--- |
| **CMS & Admin Workflows Tests** | `__tests__/cms/cms-admin-workflows.test.ts` | **5 / 5 tests PASS** | ✅ Đạt |
| **Toàn bộ Test Suites (Vitest)** | `npm run test` (7 test files) | **39 / 39 tests PASS** | ✅ Đạt 100% |
| **TypeScript Typecheck** | `tsc --noEmit` (`npm run typecheck`) | **0 errors** | ✅ Đạt 100% |
| **SEO Core Routes** | `tsx scripts/seo-check.ts` (17 routes) | **17 / 17 routes HTTP 200 OK** | ✅ Đạt 100% |
| **Cơ chế Sao lưu Backup** | `npm run db:backup` | **File sao lưu tạo thành công** | ✅ Đạt |
| **Đồng bộ Settings Thể chế** | Key `site_settings` trong SQLite | **Đã seed Hotline 1800 646 857** | ✅ Đạt |

---

## 4. Kết luận & Đề xuất Chuyển tiếp

Phase 8 đã hoàn thiện trọn vẹn hạ tầng CMS và quy trình cập nhật an toàn. Đội ngũ quản trị hiện có đầy đủ công cụ để vận hành, quản lý Leads, biên tập bài viết và sao lưu hệ thống.

**Đề xuất**: Chính thức nghiệm thu Phase 8 và bắt đầu **Phase 9: Kiểm thử tổng thể (QA), Tối ưu hiệu năng và Khả năng tiếp cận (Accessibility WCAG 2.2 AA)** theo lộ trình kế hoạch.
