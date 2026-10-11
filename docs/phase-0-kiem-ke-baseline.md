# Báo cáo Kiểm kê Toàn bộ Website & Xác lập Baseline (Phase 0)

> **Dự án**: Website Viện Đào tạo Quốc tế Topica (`topica-edu`)  
> **Ngày thực hiện**: 11/10/2026  
> **Trạng thái**: Hoàn thành Phase 0 — Sẵn sàng chuyển giao sang Phase 1  
> **Người thực hiện**: Antigravity Orchestrator & Technical Team  

---

## 1. Tổng quan kết quả kiểm kê (Executive Summary)

Đội ngũ kỹ thuật đã hoàn thành kiểm kê tự động và rà soát thủ công toàn bộ mã nguồn, cơ sở dữ liệu SQLite và cấu trúc định tuyến của website `topica-edu`.

### 1.1. Số liệu tổng quan
- **Tổng số URL công khai được kiểm kê**: **155 URLs** (100% trả về `HTTP 200 OK`).
- **Nền tảng công nghệ**: Next.js 16.3.3 (Turbopack), React 19.2.8, Tailwind CSS v4, Node.js SQLite (`node:sqlite`).
- **Cơ sở dữ liệu SQLite (`data/topica.db`)**:
  - `users`: 1 tài khoản quản trị (`admin_root`).
  - `settings`: 1 key cấu hình (`homepage_hero`).
  - `categories`: 7 chuyên mục tin tức.
  - `articles`: 31 bài viết/tin tức.
  - `pages`: 70 trang nội dung tĩnh được import từ hệ thống cũ.
  - `leads`: 1 bản ghi tư vấn thử nghiệm.
  - `page_views`: 9 lượt ghi nhận phân tích.
- **Tình trạng kiểm thử hiện tại**:
  - Unit Tests: 4/4 test suites đạt (`12/12 tests passed`).
  - SEO Bot Check: 8/8 routes trọng điểm trả về `200 OK` (gồm sitemap, robots, llms).
  - TypeScript: `npx tsc --noEmit` đạt 0 lỗi.
  - Build: Production build đạt 100% (40/40 routes tĩnh và động).

---

## 2. Danh mục URL & Phân loại xử lý (URL Inventory & Classification)

Toàn bộ 155 URL đã được phân loại chi tiết theo 5 hành động: **Giữ & Nâng cấp (Keep & Refresh)**, **Chuẩn hóa (Standardize)**, **Chuyển hướng (Redirect 301)**, **Dọn dẹp/Ẩn (Hide/Clean)**.

### 2.1. Nhóm Trang chủ & Trang Tĩnh Trọng Điểm (Giữ & Thiết kế lại chuẩn Navy/Gold)
| URL | Tên trang / Chức năng | Hành động | Đơn vị phụ trách |
|---|---|---|---|
| `/` | Trang chủ viện Topica | Giữ, tối ưu Navy/Gold, marquee mượt | Frontend |
| `/gioi-thieu` | Tổng quan viện Topica | Giữ, cập nhật thông tin chuẩn EQuest/PXU | Nội dung |
| `/tuyen-sinh` | Cổng thông tin tuyển sinh | Giữ, làm rõ đợt mở/đóng | Tuyển sinh |
| `/tuyen-sinh/hoc-phi-hoc-bong` | Chi tiết học phí & chính sách học bổng | Giữ, loại bỏ số liệu hardcode | Đào tạo & Tài chính |
| `/tin-tuc` | Tin tức & Sự kiện | Giữ, phân loại danh mục chuẩn | Biên tập |
| `/lien-he` | Hệ thống trung tâm & liên hệ | Giữ, đồng nhất hotline và email | Vận hành |
| `/nhung-cau-hoi-thuong-gap` | FAQ giải đáp người học | Giữ, nhóm theo câu hỏi thật | Tuyển sinh |
| `/tim-kiem` | Tìm kiếm bài viết & thông tin | Giữ, lọc dữ liệu công khai | Kỹ thuật |

### 2.2. Nhóm 5 Ngành Đào Tạo Trọng Tâm (Chuẩn hóa dữ liệu theo yêu cầu mới)
| URL | Tên ngành chính thức | Mã ngành | Nhóm ngành | Tình trạng dữ liệu |
|---|---|---|---|---|
| `/ngon-ngu-anh` | **Ngôn ngữ Anh** | 7220201 | Ngôn ngữ | Đã có khung chương trình (132 TC) |
| `/ngon-ngu-trung-quoc` | **Ngôn ngữ Trung Quốc** | 7220204 | Ngôn ngữ | Đã có khung chương trình (132 TC) |
| `/cong-nghe-thong-tin` | **Công nghệ thông tin - Đồ hoạ kỹ thuật số** | 7480201 | Công nghệ & Sáng tạo | Đã có khung CTĐT chuyên ngành (126 TC) |
| `/quan-tri-kinh-doanh-marketing` | **Quản trị kinh doanh** | 7340101 | Kinh doanh & Dịch vụ | Cần đổi nhãn hiển thị thành "Quản trị kinh doanh" |
| `/quan-tri-dich-vu-du-lich-va-lu-hanh` | **Quản trị du lịch và lữ hành** | 7810103 | Kinh doanh & Dịch vụ | Đã có khung chương trình (126 TC) |

> **Quyết định xử lý**: Giữ nguyên slug hiện hành để bảo toàn SEO và sitemap, chuẩn hóa nhãn hiển thị, tên gọi và khung chương trình học theo đúng 5 ngành đã phê duyệt.

### 2.3. Nhóm Trang Rác / Dư Thừa Từ WordPress Cũ (Cần Xóa/Ẩn Ngay)
Trong bảng `pages` của SQLite hiện có các trang do import từ plugin WooCommerce cũ của WordPress:
- `/cart` (Giỏ hàng)
- `/checkout` (Thanh toán)
- `/my-account` (Tài khoản khách hàng)
- `/shop` (Cửa hàng)
- `/classic-shop` (Shop cũ)

> **Hành động**: Đánh dấu `status = 'draft'` hoặc xóa khỏi bảng `pages` trong SQLite; cập nhật router chặn không phục vụ các slug này để tránh làm giảm uy tín học thuật của website.

### 2.4. Nhóm URL Trùng Lặp Cần Chuyển Hướng (Redirect 301)
- `/hoc-phi` ➔ Chuyển hướng 301 về `/tuyen-sinh/hoc-phi-hoc-bong`
- `/thong-bao-tuyen-sinh` (trang tĩnh) ➔ Chuyển hướng 301 về `/tin-tuc?category=thong-bao-tuyen-sinh` hoặc `/tuyen-sinh`
- `/van-bang-hai` (trang tĩnh cũ) ➔ Chuyển hướng về cổng thông tin tuyển sinh có mục văn bằng 2
- `/cong-nghe-ky-thuat-o-to` (ngành cũ của PXU không còn trong danh mục tuyển sinh Topica) ➔ Chuyển hướng về danh mục ngành `/nganh-dao-tao` kèm thông báo phù hợp.

---

## 3. Khảo sát Hiện trạng Kỹ thuật & CMS

### 3.1. Cơ chế Lưu trữ & Quản trị Nội dung
1. **Dữ liệu bài viết & trang**:
   - Lưu trữ trực tiếp trong file SQLite `data/topica.db` (chạy trên driver native `node:sqlite` của Node.js).
   - Truy vấn qua tầng repository `lib/db/index.ts` và bọc bởi `lib/cms/queries.ts`.
   - Có cơ chế sanitize HTML (`sanitize-html`) chống XSS trước khi hiển thị ra giao diện.
2. **Quản lý Lead (Hồ sơ tư vấn)**:
   - Form Lead công khai đẩy dữ liệu về API `/api/public/lead`.
   - Dữ liệu được xác thực bằng Zod schema và lưu vào bảng `leads` trong SQLite với trạng thái mặc định `new`.
   - Trang quản trị `/admin/leads` cho phép xem, lọc theo trạng thái và xóa lead.
3. **Quản lý Media & Ảnh tải lên**:
   - Endpoint `/api/admin/upload` tiếp nhận file ảnh JPG/PNG/WebP (giới hạn tối đa 5MB).
   - File được lưu vào thư mục `public/uploads/` và trả về URL `/uploads/[timestamp]-[hash].[ext]`.
   - Cần bổ sung bảng `media` trong SQLite để quản lý thư viện ảnh tập trung thay vì chỉ lưu file rời trên đĩa.

### 3.2. Hiện trạng Giao diện & Trải nghiệm Người dùng (UI/UX)
1. **Thiết kế màu sắc & Tokens**:
   - Đã đưa hệ token **Navy (`#00264D`)** và **Gold (`#B78744`)** vào `@theme inline` trong Tailwind v4.
   - Header, Footer, Hero, Thẻ đối tác, Thẻ ngành, Timeline đã nhận diện chuẩn màu quốc tế.
2. **Khả năng Responsive Mobile**:
   - Header có menu drawer trượt từ phải sang (`MobileNav.tsx`).
   - Có thanh ghim đáy cố định trên điện thoại (`MobileStickyBar.tsx`).
   - Dải đối tác đã chạy trượt vô tận mượt mà, không còn thanh cuộn ngang gây lỗi giao diện.

---

## 4. Bảng phân loại Lỗi & Tồn đọng (Baseline Issue Backlog)

| Mã lỗi | Mức độ | Hạng mục | Mô tả hiện trạng | Hành động xử lý (Phase tiếp theo) |
|---|---|---|---|---|
| **ISSUE-01** | **P0** | Dữ liệu ngành | Ngành Quản trị kinh doanh trên header/form đang ghi gắn liền chuyên ngành "Marketing số", gây hiểu nhầm sang ngành riêng biệt. | Chuẩn hóa danh mục 5 ngành thống nhất trên toàn site (Phase 1). |
| **ISSUE-02** | **P0** | Dữ liệu rác | Các URL WooCommerce (`/cart`, `/checkout`, `/my-account`, `/shop`) đang trả về HTTP 200 từ SQLite. | Dọn dẹp bảng `pages` và thêm blacklist slug trong router (Phase 1). |
| **ISSUE-03** | **P1** | Nội dung | Bài viết CMS cũ chứa lỗi HTML entity (như `&#038;`, `&nbsp;`) và trích đoạn excerpt còn sót thẻ `<p>`, `[vc_row]`. | Viết hàm làm sạch entity và HTML thừa khi render bài viết (Phase 1). |
| **ISSUE-04** | **P1** | Học phí | File `TuitionHub.tsx` đang chứa số liệu học phí hardcode trực tiếp trong code TSX thay vì lấy từ dữ liệu có phiên bản. | Đưa học phí thành cấu trúc dữ liệu theo khóa, năm và đối tượng (Phase 1 & Phase 8). |
| **ISSUE-05** | **P1** | Kiểm thử QA | Các script kiểm tra tự động `test:links`, `test:a11y`, `test:lighthouse` trong `package.json` mới chỉ là lệnh `echo`. | Triển khai công cụ quét link vỡ thực tế, axe-core a11y và Lighthouse CI (Phase 9). |
| **ISSUE-06** | **P2** | Media CMS | Admin chưa có bảng quản lý danh mục ảnh tập trung, ảnh tải lên nằm rải rác trong `public/uploads`. | Tạo bảng `media` trong DB và giao diện quản lý media tập trung (Phase 8). |
| **ISSUE-07** | **P2** | Sitemap | File `app/sitemap.ts` mới chỉ quét 6 trang tĩnh, 5 ngành và bài viết; chưa quét 70 trang CMS hợp lệ. | Bổ sung các trang CMS hợp lệ vào sitemap tự động (Phase 7). |
| **ISSUE-08** | **P3** | Timezone | Ngày giờ xuất bản và đợt tuyển sinh chưa được cố định theo múi giờ `Asia/Bangkok`. | Quy chuẩn toàn bộ xử lý ngày tháng theo `Asia/Bangkok` (Phase 1 & Phase 8). |

---

## 5. Kết luận & Điều kiện Nghiệm thu Phase 0

- [x] Đã tạo Git commit lưu trữ toàn bộ trạng thái mã nguồn và tài liệu.
- [x] Đã quét và lập danh mục toàn bộ 155 URL với trạng thái HTTP thực tế.
- [x] Đã xác định rõ danh sách 5 ngành đào tạo trọng tâm theo chỉ đạo của ban lãnh đạo.
- [x] Đã kiểm kê chi tiết cấu trúc cơ sở dữ liệu SQLite (`topica.db`) và cơ chế tiếp nhận Lead/Bài viết.
- [x] Đã lập bảng phân loại mức độ nghiêm trọng từ P0 đến P3.

👉 **Đủ điều kiện đóng Phase 0 và kích hoạt Phase 1: Chuẩn hóa nội dung, thông tin học thuật và bằng chứng.**
