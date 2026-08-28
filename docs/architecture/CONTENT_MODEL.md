# Phase 2 - Content Model

Ngày chốt: 2026-08-28  
CMS: WordPress headless; Next.js chỉ đọc nội dung đã publish qua API.

## 1. Quy ước chung

Mọi content type có các trường nền sau:

| Field | Type | Rule |
|---|---|---|
| `id` | UUID/integer | Duy nhất, không đổi |
| `title` | string | Bắt buộc, 1-160 ký tự |
| `slug` | slug | Duy nhất trong route family |
| `status` | enum | `draft`, `in_review`, `scheduled`, `published`, `archived` |
| `excerpt` | text | Tối đa 320 ký tự |
| `content` | block/rich text | Không cho script/style tùy ý |
| `featuredImage` | Media | Ảnh, alt text, width, height bắt buộc |
| `gallery` | Media[] | Có caption và alt text |
| `publishedAt` | datetime | Bắt buộc khi publish |
| `updatedAt` | datetime | Hệ thống tự cập nhật |
| `author` | Author reference | Bắt buộc với Article |
| `ownerTeam` | enum | Đơn vị chịu trách nhiệm nội dung |
| `reviewedBy` | User reference | Bắt buộc với nội dung kiểm soát |
| `reviewedAt` | datetime | Bắt buộc khi chuyển `published` |
| `nextReviewAt` | date | Dùng cho học phí, quy chế, lịch và thông tin liên hệ |
| `revisionNote` | text | Bắt buộc khi cập nhật nội dung đã publish |
| `legacyWpId` | integer | Giữ mapping với WordPress hiện tại |
| `legacyUrl` | URL | Phục vụ migration và redirect QA |

## 2. SEOFields

Được gắn vào Page, Program, Article, archive và landing page.

| Field | Type | Rule |
|---|---|---|
| `seoTitle` | string | 30-60 ký tự khuyến nghị |
| `seoDescription` | string | 70-160 ký tự khuyến nghị |
| `canonicalUrl` | URL | Một canonical tuyệt đối, cùng domain nếu không có ngoại lệ |
| `robotsIndex` | boolean | Mặc định `true` cho nội dung public |
| `robotsFollow` | boolean | Mặc định `true` |
| `openGraphImage` | Media | 1200 x 630 px khuyến nghị |
| `openGraphTitle` | string | Kế thừa `seoTitle` nếu rỗng |
| `openGraphDescription` | string | Kế thừa `seoDescription` nếu rỗng |
| `schemaType` | enum | Theo allowlist của từng content type |

Không cho biên tập viên nhập Organization schema theo từng bài. Organization, EducationalOrganization và WebSite schema lấy từ `SiteSettings` để tránh sai tên/URL như website hiện tại.

## 3. Content types

### Page

Trang nội dung evergreen.

| Field riêng | Type | Ghi chú |
|---|---|---|
| `pageTemplate` | enum | `content`, `admissions`, `academic`, `quality`, `contact`, `system-links` |
| `hero` | component | Eyebrow, heading, summary, media, CTA |
| `sections` | block[] | Chỉ dùng block đã đăng ký |
| `breadcrumbs` | auto | Sinh từ route registry |
| `relatedPages` | Page[] | Tối đa 6 |
| `faqs` | FAQ[] | Tùy chọn |
| `documents` | OfficialDocument[] | Tùy chọn |

### Program

Một ngành/chương trình đào tạo có trang chi tiết riêng.

| Field riêng | Type | Ghi chú |
|---|---|---|
| `programCode` | string | Mã ngành/chương trình |
| `programName` | string | Tên chính thức |
| `programGroup` | taxonomy | Kinh doanh, Công nghệ, Ngôn ngữ, Dịch vụ |
| `degreeName` | string | Tên văn bằng theo tài liệu được duyệt |
| `studyMode` | enum[] | Ví dụ: từ xa, ngắn hạn |
| `duration` | structured text | Không lưu một chuỗi marketing mơ hồ |
| `creditCount` | integer | Tùy chọn, cần nguồn duyệt |
| `admissionRequirements` | block[] | Điều kiện đầu vào |
| `curriculum` | StudentResource[] | Khung/chương trình liên quan |
| `learningOutcomes` | block[] | Chuẩn đầu ra |
| `careerOutcomes` | block[] | Cơ hội nghề nghiệp |
| `tuitionPage` | Page reference | Không nhập lại con số học phí |
| `admissionsPage` | Page reference | Một nguồn tuyển sinh chuẩn |
| `featured` | boolean | Điều khiển hiển thị trang chủ/menu, không đổi publish status |
| `relatedArticles` | Article[] | Tối đa 6 |

URL Phase 1 của Program dùng trường `canonicalPath` để giữ các slug hiện tại ở cấp gốc.

### Article

Tin tức, sự kiện, thông báo tuyển sinh và tuyển dụng.

| Field riêng | Type | Ghi chú |
|---|---|---|
| `categories` | Category[] | Ít nhất 1, tối đa 3 |
| `tags` | Tag[] | Tùy chọn |
| `featured` | boolean | Có thể dùng cho trang chủ/archive |
| `featuredUntil` | datetime | Hết hạn tự động |
| `relatedArticles` | Article[] | Tự động theo category, cho phép biên tập ghi đè |
| `sourceLabel` | string | Khi trích dẫn nguồn ngoài |
| `sourceUrl` | URL | Tùy chọn |
| `eventStartAt` | datetime | Chỉ dùng với category sự kiện |
| `eventEndAt` | datetime | Phải lớn hơn `eventStartAt` |

Bài cũ giữ route `/{slug}/`. Bài tạo sau cutover dùng `/tin-tuc/{slug}/`; route family được lưu rõ, không suy luận từ ngày ở runtime.

### Category

| Field | Type | Ghi chú |
|---|---|---|
| `name` | string | Tên hiển thị |
| `slug` | slug | Dưới namespace `/tin-tuc/` |
| `description` | text | Dùng cho archive intro |
| `featuredImage` | Media | Tùy chọn |
| `parent` | Category reference | Tối đa 1 cấp con trong IA mới |
| `archiveSeo` | SEOFields | Canonical của archive |
| `active` | boolean | Category rỗng không được public mặc định |

Allowlist ban đầu: `tuyen-sinh`, `thong-bao-tuyen-sinh`, `su-kien`, `giao-duc`, `sinh-vien`, `tuyen-dung`.

### Author

| Field | Type | Ghi chú |
|---|---|---|
| `displayName` | string | Không dùng username đăng nhập |
| `roleTitle` | string | Chức danh hiển thị |
| `bio` | text | Tùy chọn |
| `avatar` | Media | Tùy chọn |
| `profileUrl` | URL | Tùy chọn |

### FAQ

| Field | Type | Ghi chú |
|---|---|---|
| `question` | string | Bắt buộc |
| `answer` | rich text | Không nhúng form/script |
| `topic` | taxonomy | Tuyển sinh, học phí, học tập, kỹ thuật |
| `sortOrder` | integer | Trong collection |
| `effectiveFrom` | date | Tùy chọn |
| `effectiveTo` | date | Nội dung hết hạn tự ẩn |

FAQ schema chỉ xuất khi câu hỏi và câu trả lời hiển thị đầy đủ trên chính trang đó.

### OfficialDocument

Đề án, quy chế, quyết định, báo cáo và tài liệu công khai.

| Field | Type | Ghi chú |
|---|---|---|
| `documentNumber` | string | Số/ký hiệu văn bản |
| `documentType` | enum | `de-an`, `quy-che`, `quyet-dinh`, `bao-cao`, `cong-khai`, `other` |
| `issuer` | string | Đơn vị ban hành |
| `issuedAt` | date | Ngày ban hành |
| `effectiveFrom` | date | Ngày hiệu lực |
| `effectiveTo` | date | Tùy chọn |
| `academicYear` | string | Ví dụ `2026` hoặc `2026-2027` |
| `file` | Media/PDF | Bắt buộc; filename rõ nghĩa |
| `fileHash` | string | Phục vụ kiểm tra thay đổi |
| `supersedes` | OfficialDocument reference | Văn bản bị thay thế |
| `legalReviewStatus` | enum | `pending`, `approved`, `superseded` |

Không xóa văn bản đã hết hiệu lực; đánh dấu `superseded` và liên kết văn bản thay thế.

### StudentResource

| Field | Type | Ghi chú |
|---|---|---|
| `resourceType` | enum | `curriculum`, `schedule`, `exam`, `form`, `procedure`, `regulation`, `system-link` |
| `audience` | enum[] | Sinh viên, giảng viên, ứng viên |
| `academicYear` | string | Bắt buộc với lịch/kế hoạch |
| `programs` | Program[] | Có thể áp dụng toàn bộ |
| `semester` | string | Tùy chọn |
| `file` | Media | Với tài liệu tải xuống |
| `externalUrl` | URL | Với hệ thống ngoài |
| `validFrom` | date | Tùy chọn |
| `validTo` | date | Tài nguyên hết hạn tự ẩn khỏi danh sách chính |

### Campus

| Field | Type | Ghi chú |
|---|---|---|
| `name` | string | Tên cơ sở chính thức |
| `address` | postal address | Tách tỉnh/thành, quận/huyện, đường |
| `phone` | string | Chuẩn hóa E.164 ở API |
| `email` | email | Email công khai |
| `mapUrl` | URL | Link bản đồ, không lưu iframe tùy ý |
| `hours` | structured text | Giờ làm việc |
| `isPrimary` | boolean | Chỉ một cơ sở chính |

### Testimonial

| Field | Type | Ghi chú |
|---|---|---|
| `quote` | text | Bắt buộc |
| `personName` | string | Có xác nhận sử dụng |
| `personRole` | string | Tùy chọn |
| `program` | Program reference | Tùy chọn |
| `portrait` | Media | Có consent |
| `consentRecordedAt` | date | Bắt buộc trước publish |

### NavigationMenu

| Field | Type | Ghi chú |
|---|---|---|
| `location` | enum | `primary`, `utility`, `mobile`, `footer` |
| `items` | NavigationItem[] | Tối đa 3 cấp; primary dùng tối đa 2 cấp hiển thị |
| `label` | string | Bắt buộc |
| `target` | internal reference/URL/action | Không cho `#` rỗng |
| `external` | boolean | Tự thêm biểu tượng và thông báo cho screen reader |
| `visibleFrom`, `visibleTo` | datetime | Tùy chọn cho campaign |

`docs/architecture/NAVIGATION.json` là seed được duyệt; CMS trở thành nguồn thật sau Phase 4.

### SiteSettings

| Field | Type | Ghi chú |
|---|---|---|
| `siteName` | string | Tên pháp lý/brand chuẩn |
| `organizationName` | string | Dùng cho schema toàn site |
| `organizationUrl` | URL | Phải là production URL |
| `logo`, `logoDark` | Media | Có width/height |
| `defaultSeo` | SEOFields | Fallback toàn site |
| `socialLinks` | SocialLink[] | Allowlist domain |
| `contactPhone`, `contactEmail` | string | Dùng lại, không nhập rải rác |
| `campuses` | Campus[] | Nguồn liên hệ chuẩn |
| `admissionsUrl` | URL | CTA xét tuyển toàn site |
| `analyticsIds` | secret/config reference | Không cho nhập script tùy ý |

### LeadFormConfig

| Field | Type | Ghi chú |
|---|---|---|
| `formId` | string | Duy nhất |
| `title`, `description` | string | Nội dung hiển thị |
| `programOptions` | Program[] | Lấy từ Program đang tuyển |
| `educationLevels` | option[] | Danh sách có kiểm soát |
| `consentText` | rich text | Bắt buộc và có version |
| `privacyPolicyUrl` | internal reference | Bắt buộc |
| `successMessage` | string | Không chứa dữ liệu cá nhân |
| `destination` | server config reference | Không lộ webhook/secret ra API public |

## 4. Workflow và quyền

| Role | Quyền chính |
|---|---|
| Contributor | Tạo/sửa draft của nhóm mình |
| Editor | Biên tập, gán taxonomy, gửi duyệt |
| Business Reviewer | Duyệt tính chính xác nghiệp vụ |
| Legal/QA Reviewer | Duyệt OfficialDocument và nội dung kiểm soát |
| Publisher | Publish, schedule, archive; không tự sửa văn bản pháp lý |
| Administrator | Quản trị schema, user và integration |

Luồng chuẩn: `draft -> in_review -> scheduled/published -> archived`. Bất kỳ sửa đổi nào với học phí, điều kiện tuyển sinh hoặc văn bản chính thức đều quay lại `in_review`.

## 5. API contract tối thiểu

- API public chỉ trả content `published` và media metadata cần thiết.
- Preview dùng token ngắn hạn, server-only; không lộ draft qua endpoint public.
- Mỗi response có `id`, `slug`, `canonicalPath`, `updatedAt` và `seo`.
- Query list hỗ trợ pagination, category, tag, author, date range và `featured`.
- Related articles trả tối đa 6 item, không lặp chính bài hiện tại.
- Next.js validate payload bằng schema runtime trước khi render.
- Webhook publish/revalidate ký HMAC và giới hạn IP/rate.

## 6. Migration mapping quan trọng

| Nguồn hiện tại | Content type mới | Quyết định |
|---|---|---|
| WordPress Page | Page/Program | Phân loại theo route registry, không dựa chỉ vào post type cũ |
| WordPress Post | Article | Giữ `legacyWpId`, slug và published date |
| WordPress Category | Category | Chỉ migrate category có nội dung; map sang allowlist mới |
| UX Block | Không public | Trích nội dung hữu ích rồi loại khỏi sitemap/API public |
| Media Library | Media | Bổ sung alt, dimensions, focal point và kiểm tra trùng |
| Page ID 1098 `/thong-bao-tuyen-sinh/` | Archive/migrate fragments | Không được sở hữu URL canonical |
| Post ID 3818 `/thong-bao-tuyen-sinh/` | Article | Chủ sở hữu canonical của URL |

## 7. Validation bắt buộc trước publish

- Title, slug, owner, excerpt, featured image alt và SEO description hợp lệ.
- Canonical khớp route registry và không trỏ tới redirect.
- Internal link không trỏ tới `404`, redirect source hoặc URL preview.
- Program không lặp học phí; chỉ tham chiếu trang học phí chuẩn.
- OfficialDocument có file, số văn bản, ngày ban hành và trạng thái duyệt.
- Nội dung có ngày hết hiệu lực phải tự cảnh báo owner trước 14 ngày.
- Không publish category rỗng hoặc navigation item có target rỗng.
