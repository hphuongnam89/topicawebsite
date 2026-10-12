# Sổ Kiểm kê Tài sản Đa phương tiện (Media & Partner Ledger)

- Run ID: `run-01`
- Ngày lập: 12/10/2026
- Finding: `HUI-07` / Task `HU-06` (R03/R06/R11)
- Người thực hiện: Antigravity Orchestrator

---

## 1. Nguyên tắc quản lý Media công khai (Public Media Guidelines)

1. Mọi hình ảnh/logo xuất bản trên website Topica phải có:
   - Tên định danh rõ ràng (không dùng placeholder vô danh).
   - Nguồn gốc hoặc văn bản chứng minh quyền sử dụng.
   - Thuộc tính `alt` mô tả chính xác nội dung hoặc `alt=""` nếu là ảnh trang trí.
2. Không tự gắn nhãn "chính thức" hay "đối tác chiến lược" nếu chưa được bộ phận đối ngoại/Topica xác nhận.
3. Các ảnh chưa có sự đồng ý của chủ thể hoặc chưa rõ bản quyền phải được tạm ẩn hoặc thay bằng layout editorial trung tính không ảnh.

---

## 2. Bảng kiểm kê Đối tác Doanh nghiệp (`PartnersSection.tsx`)

| STT | Tên đối tác | File / URL | Trạng thái quyền & nguồn | Quyết định xuất bản (Đợt A) |
|---|---|---|---|---|
| 1 | **Deakin University** | `.../2026/01/1.png` | Đại học đối tác hợp tác quốc tế | **Hiển thị** (Verified) |
| 2 | **OBC** | `.../2026/01/2.png` | Doanh nghiệp đối tác | **Hiển thị** (Verified) |
| 3 | **Thaco Agri** | `.../2026/01/3.png` | Tập đoàn đối tác tiếp nhận thực tập | **Hiển thị** (Verified) |
| 4 | **Deha Digital Solutions** | `.../2026/01/4.png` | Doanh nghiệp công nghệ đối tác | **Hiển thị** (Verified) |
| 5 | **Deha Software** | `.../2026/01/5.png` | Doanh nghiệp phần mềm đối tác | **Hiển thị** (Verified) |
| 6 | *Đối tác 6* | `.../2026/01/6.png` | Chưa xác định tên và quan hệ thật | ⛔ **Tạm ẩn** (Quarantined) |
| 7 | *Đối tác 7* | `.../2026/01/7.png` | Chưa xác định tên và quan hệ thật | ⛔ **Tạm ẩn** (Quarantined) |
| 8 | *Đối tác 8* | `.../2026/01/8.png` | Chưa xác định tên và quan hệ thật | ⛔ **Tạm ẩn** (Quarantined) |
| 9 | *Đối tác 9* | `.../2026/01/9.png` | Chưa xác định tên và quan hệ thật | ⛔ **Tạm ẩn** (Quarantined) |

*Ghi chú:* Đã cập nhật mã nguồn `PartnersSection.tsx` để chỉ chạy marquee 5 đối tác đã xác thực tên. Tạm thời cách ly logo 6–9 cho đến khi nhận được xác nhận từ ticket Đợt B.

---

## 3. Bảng kiểm kê Hình ảnh Trang chủ & Hero (`HeroSection.tsx`)

| Khu vực | File / URL | Mô tả chức năng | Quyền & Consent | Đánh giá an toàn |
|---|---|---|---|---|
| **Hero Background** | `.../gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg` | Ảnh minh họa không gian học tập trực tuyến | Ảnh truyền thông do Topica sở hữu | An toàn khi dùng làm minh họa chung; không gắn danh xưng cá nhân |
| **Bento Campus** | `data/campuses.ts` | Hình ảnh cơ sở đào tạo Huế & Hà Nội | Thuộc sở hữu ĐH Phú Xuân & Topica | An toàn, có địa chỉ cụ thể |
| **Testimonials** | `data/testimonials.ts` | Ảnh đại diện cựu sinh viên/học viên | Cần consent của học viên | Dùng dữ liệu tĩnh đã đối chiếu hoặc fallback avatar chữ |
