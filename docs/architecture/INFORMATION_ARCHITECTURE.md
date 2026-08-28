# Phase 2 - Information Architecture

Ngày chốt: 2026-08-28  
Phạm vi: sitemap, navigation, URL strategy và content ownership cho website mới.

## 1. Quyết định nền tảng

- WordPress tiếp tục là CMS headless trong giai đoạn di trú đầu tiên.
- Giữ nguyên URL chi tiết đang có nội dung; chỉ đổi URL khi có đích tương đương rõ ràng.
- Tạo mới hai trang chỉ mục `/nganh-dao-tao/` và `/tin-tuc/`.
- Bài viết hiện tại tiếp tục dùng slug ở cấp gốc trong Phase 1 migration. Mẫu `/tin-tuc/[slug]/` chỉ áp dụng cho bài mới sau ngày cutover.
- Không để mục menu cấp một dùng `href="#"`; mỗi mục phải có landing page thật.
- Redirect chỉ bật sau khi trang đích đã publish, nội dung được duyệt và kiểm thử 301/canonical.
- Nội dung tuyển sinh, học phí, quy chế và văn bằng cần chủ sở hữu nghiệp vụ duyệt trước khi gộp hoặc ngừng URL.

## 2. Sitemap mục tiêu

Ký hiệu: `NEW` là route cần tạo; `KEEP` là URL hiện tại được giữ; `HOLD` cần duyệt nội dung.

```text
/                                                   KEEP
|-- /gioi-thieu/                                    KEEP
|   |-- /gioi-thieu/tap-doan-giao-duc-equest/       KEEP
|   |-- /gioi-thieu/lich-su-hinh-thanh/             KEEP
|   |-- /gioi-thieu/tam-nhin-su-mang/               KEEP
|   |-- /gioi-thieu/gia-tri-cot-loi-triet-ly-giao-duc/ KEEP
|   |-- /gioi-thieu/co-cau-to-chuc/                 KEEP
|   `-- /gioi-thieu/co-so-vat-chat/                 KEEP
|
|-- /nganh-dao-tao/                                 NEW
|   |-- /cong-nghe-thong-tin/                       KEEP
|   |-- /quan-tri-kinh-doanh-marketing/             KEEP
|   |-- /ngon-ngu-anh/                              KEEP
|   |-- /ngon-ngu-trung-quoc/                       KEEP
|   |-- /quan-tri-dich-vu-du-lich-va-lu-hanh/       KEEP
|   |-- /cong-nghe-ky-thuat-o-to/                   KEEP
|   |-- /quan-ly-cong-nghiep/                       KEEP
|   |-- /truyen-thong-da-phuong-tien/               KEEP
|   `-- /ung-dung-cong-nghe-thong-tin/              KEEP
|
|-- /tuyen-sinh/                                    KEEP
|   |-- /tuyen-sinh/thong-tin-tuyen-sinh/           NEW
|   |-- /thong-bao-tuyen-sinh/                      KEEP; Article ID 3818 owns URL
|   |-- /tuyen-sinh/de-an-tuyen-sinh/               KEEP
|   |-- /tuyen-sinh/quy-che-tuyen-sinh/             KEEP
|   |-- /tuyen-sinh/hoc-phi-hoc-bong/               KEEP
|   |-- /thoi-gian-dao-tao/                         KEEP
|   |-- /van-bang-hai/                              KEEP
|   |-- /nhung-cau-hoi-thuong-gap/                  KEEP
|   `-- /tuyen-sinh/xet-tuyen-truc-tuyen/           KEEP
|
|-- /chuong-trinh/                                  KEEP
|   |-- /chuong-trinh/chuong-trinh-dao-tao-tu-xa/   KEEP
|   |   |-- /chuong-trinh/chuong-trinh-dao-tao-tu-xa/khung-chuong-trinh/ KEEP
|   |   |-- /chuong-trinh/chuong-trinh-dao-tao-tu-xa/muc-tieu-va-chuan-dau-ra/ KEEP
|   |   `-- /chuong-trinh/chuong-trinh-dao-tao-tu-xa/co-hoi-nghe-nghiep-vi-tri-viec-lam/ KEEP
|   |-- /chuong-trinh/chuong-trinh-dao-tao-ngan-han/ KEEP
|   `-- /chuong-trinh/khoa-dao-tao-truc-tuyen/      KEEP
|
|-- /dao-tao/                                       KEEP
|   |-- /dao-tao/quy-che-dao-tao/                   KEEP
|   |-- /dao-tao/ke-hoach-dao-tao/                  KEEP
|   |   |-- /dao-tao/ke-hoach-dao-tao/ke-hoach-nam-hoc/ KEEP
|   |   |-- /dao-tao/ke-hoach-dao-tao/ke-hoach-toan-khoa/ KEEP
|   |   `-- /dao-tao/ke-hoach-dao-tao/ke-hoach-hoc-ky/ KEEP
|   |-- /dao-tao/thoi-khoa-bieu/                    KEEP
|   `-- /dao-tao/lich-thi/                          KEEP
|
|-- /dam-bao-chat-luong/                            NEW
|   |-- /cong-khai/                                 KEEP
|   |-- /bao-cao-thuong-nien/                       KEEP
|   |-- /cong-khai-van-bang-chung-chi/              KEEP
|   |-- /khao-thi-dbcl/                             KEEP
|   |-- /bo-quy-trinh/                              KEEP
|   `-- /bo-bieu-mau/                               KEEP
|
|-- /tin-tuc/                                       NEW
|   |-- /tin-tuc/tuyen-sinh/                        NEW category archive
|   |-- /tin-tuc/thong-bao-tuyen-sinh/              NEW category archive
|   |-- /tin-tuc/su-kien/                           NEW category archive
|   |-- /tin-tuc/giao-duc/                          NEW category archive
|   |-- /tin-tuc/sinh-vien/                         NEW category archive
|   `-- /tin-tuc/tuyen-dung/                        NEW category archive
|
|-- /he-thong/                                      KEEP
|-- /quy-dinh/                                      KEEP
|-- /lien-he/                                       KEEP
|-- /nckh-htqt/                                     KEEP
|-- /lien-ket-dao-tao-quoc-te/                      KEEP
`-- /itd/                                           KEEP
```

Các trang đang hoạt động nhưng không xuất hiện trong menu chính vẫn được giữ URL và truy cập qua nội dung liên quan hoặc footer: `/6-ly-do-hoc-tap-tai-vien-topica/`, `/cam-ket-gioi-thieu-viec-lam/`, `/cam-nhan-ve-dh-phu-xuan/`, `/dao-tao-thuong-xuyen/`, `/hop-tac-voi-dai-hoc-kuv/`, `/ket-noi-doanh-nghiep-cho-sinh-vien/`, `/thong-tin-lien-thong/`.

## 3. Navigation

Nguồn cấu hình chuẩn là `NAVIGATION.json`.

### Desktop

- Primary: Giới thiệu, Ngành đào tạo, Tuyển sinh, Học tập, Tin tức, Đảm bảo chất lượng.
- Utility: Tìm kiếm, Hệ thống học tập, Liên hệ.
- CTA cố định: `Đăng ký xét tuyển`.
- Mega menu mở bằng click hoặc bàn phím; hover chỉ là hỗ trợ.
- Header cao 88 px, thu gọn còn 68 px khi cuộn; vùng bấm tối thiểu 44 x 44 px.
- Nhấn `Esc`, click ngoài hoặc chuyển focus ra ngoài sẽ đóng menu.

### Mobile

- Drawer toàn màn hình, khóa cuộn body và giữ focus trong drawer.
- Mỗi nhóm là accordion; label và nút mở submenu là hai vùng tương tác riêng.
- Hiển thị `Đăng ký xét tuyển`, `Nhận tư vấn`, `Hệ thống học tập` và `Liên hệ` ở cuối drawer.
- Không tái sử dụng các mục rỗng hoặc `href="#"` của menu cũ.

## 4. URL strategy

### Giữ nguyên

- Trang giới thiệu, ngành, chương trình, đào tạo và tài nguyên sinh viên đang có nội dung.
- Toàn bộ URL bài viết hiện tại ở cấp gốc.
- `/tuyen-sinh/de-an-tuyen-sinh/`, `/tuyen-sinh/quy-che-tuyen-sinh/` và `/tuyen-sinh/hoc-phi-hoc-bong/`.

### Tạo mới

- `/nganh-dao-tao/`: chỉ mục ngành, không đổi URL chi tiết ở lần di trú đầu.
- `/tin-tuc/`: chỉ mục tin tức và đích cho các category archive mới.
- `/dam-bao-chat-luong/`: landing page thật thay cho menu `#`.
- `/tuyen-sinh/thong-tin-tuyen-sinh/`: trang evergreen; không dùng một bài thông báo theo đợt làm trang tổng quan.

### Gộp đã có đủ bằng chứng

- `/hoc-phi/` chuyển 301 tới `/tuyen-sinh/hoc-phi-hoc-bong/` sau duyệt số liệu. Trang đích có nội dung đầy đủ hơn và gồm cả học bổng.
- `/tuyen-sinh-van-bang-2/` chuyển 301 tới `/van-bang-hai/`; URL nguồn hiện chỉ có trạng thái "Đang cập nhập".
- `/blog/` chuyển 301 tới `/tin-tuc/` sau khi trang tin tức mới publish.
- Category archive cũ chuyển sang namespace `/tin-tuc/*` theo `REDIRECT_MATRIX.csv`.

### Chờ duyệt

- `/de-an-quy-che-tuyen-sinh/` đang trộn hai loại văn bản và còn nội dung 2025. Duy trì tạm thời, `noindex,follow`, rồi chuyển về `/tuyen-sinh/` khi Phòng Tuyển sinh xác nhận hai trang tài liệu riêng đã đầy đủ.
- `/thong-bao-tuyen-sinh/` có Page ID 1098 và Post ID 3818 cùng slug. Giữ URL, chọn Post ID 3818 làm nguồn canonical; đưa tài nguyên còn hữu ích từ Page ID 1098 vào trang tuyển sinh trước khi unpublish Page.
- Không xóa category rỗng cho tới khi kiểm tra GSC, backlink và log 90 ngày.

### Canonical, sitemap và status

- Mỗi tài liệu có đúng một URL canonical tự tham chiếu.
- Chỉ URL trả `200`, indexable và canonical mới xuất hiện trong XML sitemap.
- Redirect source, route nội bộ CMS, trang tìm kiếm, preview và trang hệ thống không vào sitemap.
- 301 không tạo chuỗi; nguồn cũ phải đi thẳng tới URL canonical cuối.
- Route đã xóa và không có đích tương đương trả `410` sau giai đoạn kiểm tra dữ liệu.
- Trailing slash là chuẩn duy nhất cho page, archive và article URL.

## 5. Page templates

| Route family | Template | CMS type |
|---|---|---|
| `/` | HomePage | SiteSettings + curated references |
| `/gioi-thieu/*` | ContentPage | Page |
| `/nganh-dao-tao/` | ProgramIndexPage | ProgramGroup |
| Các URL ngành hiện tại | ProgramDetailPage | Program |
| `/tuyen-sinh/*` | AdmissionsPage | Page hoặc OfficialDocumentIndex |
| `/chuong-trinh/*`, `/dao-tao/*` | AcademicResourcesPage | Page + StudentResource |
| `/dam-bao-chat-luong/`, `/cong-khai/*` | QualityAssurancePage | Page + OfficialDocument |
| `/tin-tuc/*` | NewsIndexPage hoặc NewsCategoryPage | Article + Category |
| Slug bài viết hiện tại | ArticlePage | Article |
| `/he-thong/` | SystemLinksPage | StudentResource collection |
| `/lien-he/` | ContactPage | Campus + LeadFormConfig |

## 6. Content ownership

| Nhóm nội dung | Accountable owner | Reviewer bắt buộc | Chu kỳ rà soát |
|---|---|---|---|
| Thương hiệu, giới thiệu | Marketing/Truyền thông | Ban lãnh đạo | 6 tháng |
| Ngành và chương trình | Phòng Đào tạo | Chủ nhiệm chuyên môn | Mỗi học kỳ |
| Tuyển sinh, học phí, học bổng | Phòng Tuyển sinh | Tài chính + Pháp chế | Theo đợt tuyển sinh |
| Quy chế, đề án, công khai | Khảo thí & ĐBCL | Pháp chế/Ban giám hiệu | Khi văn bản thay đổi |
| Lịch học, lịch thi, biểu mẫu | Phòng Đào tạo | Đơn vị ban hành | Hàng tháng |
| Tin tức, sự kiện | Marketing/Truyền thông | Biên tập viên | Hàng tuần |
| Tuyển dụng | Nhân sự | Marketing | Khi vị trí thay đổi |
| Hệ thống học tập | IT/Vận hành | Phòng Đào tạo | Hàng quý |
| Liên hệ, cơ sở | Hành chính | Marketing | Hàng quý |

## 7. Điều kiện hoàn thành Phase 2

- Sitemap mục tiêu có trạng thái rõ ràng cho route mới, route giữ và route chờ duyệt.
- Menu desktop/mobile không có link rỗng và mọi URL nội bộ dùng đường dẫn canonical.
- Redirect matrix không có loop, chain hoặc 301 tới trang chưa publish.
- Content model đáp ứng draft, scheduled publish, SEO, related content và quy trình duyệt.
- Các quyết định pháp lý chưa được xác nhận vẫn ở trạng thái `HOLD`, không tự động triển khai.

Nguồn đối chiếu: [website hiện tại](https://topicauni.edu.vn/), [WordPress REST API](https://topicauni.edu.vn/wp-json/wp/v2/), [Phase 1 audit](../audit/AUDIT.md) và [URL inventory](../audit/URL_INVENTORY.csv).
