# Defect Register — CMS Remediation (CMS-01 đến CMS-16)

Tài liệu ghi nhận chính thức tiến độ khắc phục 16 defect được phát hiện trong đợt audit ngày 14/10/2026 (`docs/evidence/cms-audit-2026-10-14/REPORT.md`).

---

## 1. Bảng Defect Register

| ID | Mức độ | Mô tả | File | Owner | Trạng thái | Test | Evidence |
|---|---|---|---|---|---|---|---|
| **CMS-01** | P1 | Editor bỏ qua duyệt qua API bài viết legacy | `app/api/admin/articles/route.ts`<br>`app/api/admin/articles/[id]/route.ts` | Backend | **verified** | `__tests__/cms/cms-p1-remediation.test.ts` | Chặn `status: published` với 422, chặn PUT trực tiếp bài đã published với 409, kiểm tra `expected_updated_at`. |
| **CMS-02** | P1 | Bài legacy hết hạn/archive vẫn hiện lại nội dung cũ | `lib/cms/queries.ts`<br>`lib/services/publication.ts` | Backend | **verified** | `__tests__/cms/publication-consumers.test.ts`<br>`__tests__/cms/cms-p1-remediation.test.ts` | `publishedRow` trả về `null` (404) nếu entity đã có revision history nhưng hiện tại expired/archived, không phục hồi legacy. Test `publication-consumers` đạt 8/8. |
| **CMS-03** | P1 | Admin cuối cùng tự hạ quyền hoặc bị xóa | `app/api/admin/users/route.ts` | Backend | **verified** | `__tests__/cms/cms-p1-remediation.test.ts` | Giao dịch `BEGIN IMMEDIATE` kiểm tra `adminCount <= 1`, từ chối hạ quyền hoặc xóa admin cuối với mã 400. |
| **CMS-04** | P1 | Cấu hình sai kiểu được lưu làm hỏng trang chủ (500) | `app/api/admin/homepage/route.ts`<br>`app/api/admin/settings/route.ts`<br>`components/sections/TrustSection.tsx` | Fullstack | **verified** | `__tests__/cms/cms-p1-remediation.test.ts` | Schema Zod nghiêm ngặt cho `homepageUpdateSchema` và `siteSettingsSchema`, trả 422 khi sai payload mà không ghi DB. `TrustSection` có fallback an toàn. |
| **CMS-05** | P2 | Coi bài đang public là nháp khi có bản nháp mới | `lib/services/admin-content.ts`<br>`app/(admin)/admin/articles/page.tsx` | Fullstack | **verified** | `__tests__/cms/admin-content-lists.test.ts` | Tách biệt `public_status` ("Đã xuất bản") và cờ `has_draft` ("Bản nháp mới"), hiển thị cả hai trên bảng quản trị bài viết. |
| **CMS-06** | P2 | Phân loại tin trong workflow thiếu & sai tên danh mục | `components/admin/content-fields.ts`<br>`components/admin/ContentWorkbench.tsx`<br>`lib/services/admin-content.ts` | Fullstack | **verified** | `__tests__/cms/admin-content-lists.test.ts` | Thêm trường `category_id` vào form tin tức workflow, nạp danh mục thật từ API, lưu vào payload và đối chiếu tên/slug danh mục. |
| **CMS-07** | P2 | Dashboard đếm thiếu bài workflow và gọi cả draft legacy là "Đã xuất bản" | `app/(admin)/admin/page.tsx`<br>`lib/services/admin-content.ts` | Fullstack | **verified** | `__tests__/cms/admin-content-lists.test.ts` | Dùng `getAdminArticleStats()` từ tập hợp dữ liệu quản trị chuẩn `getAllAdminArticles()`, phân biệt tổng số bài và số bài thực sự đã xuất bản. |
| **CMS-08** | P2 | Slug danh mục chỉ tự sinh theo ký tự đầu khi gõ từng phím | `app/(admin)/admin/articles/categories/page.tsx` | Frontend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Cờ `slugManuallyEdited` cho phép gõ tên tự động cập nhật slug liên tục bằng hàm chuyển đổi tiếng Việt chuẩn, chỉ dừng khi người dùng sửa thủ công. |
| **CMS-09** | P2 | Xuất Lead chỉ lấy 20 dòng trang hiện tại | `app/(admin)/admin/leads/page.tsx`<br>`app/api/admin/leads/route.ts` | Fullstack | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Nút chính "Xuất toàn bộ CSV ({total})" gọi API với `export=true` tải toàn bộ lead theo bộ lọc (lên đến 10.000 dòng); nút phụ "Xuất trang này" xuất trang hiện tại. |
| **CMS-10** | P2 | CSV không escape đầy đủ dấu nháy và ô dạng công thức | `app/(admin)/admin/leads/page.tsx` | Frontend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Hàm `escapeCsvCell()` xử lý tiền tố `'` cho các ký tự công thức spreadsheet (`=, +, -, @, \t, \r`), escape `""`, bọc ngoặc kép và thêm UTF-8 BOM (`\uFEFF`). |
| **CMS-11** | P2 | Đổi trạng thái Lead không cập nhật bộ lọc và số lượng | `app/(admin)/admin/leads/page.tsx` | Frontend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Sau khi cập nhật trạng thái PATCH thành công, client tự động refetch `fetchLeads()` theo đúng bộ lọc và làm mới tổng số lượng tức thì. |
| **CMS-12** | P2 | API lỗi bị hiển thị như dữ liệu trống | `app/(admin)/admin/pages/page.tsx`<br>`app/(admin)/admin/articles/categories/page.tsx`<br>`app/(admin)/admin/articles/page.tsx`<br>`app/(admin)/admin/leads/page.tsx`<br>`app/(admin)/admin/media/page.tsx`<br>`app/(admin)/admin/users/page.tsx` | Frontend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Chuẩn hóa mô hình 4 trạng thái: Loading (spinner) -> Empty (khi 0 dòng) -> Error (thông báo lỗi + nút Thử lại) -> Data (bảng dữ liệu). Giữ lại dữ liệu cũ khi refresh ngầm gặp lỗi. |
| **CMS-13** | P2 | Mất dữ liệu cấu hình khi rời trang mà không cảnh báo | `components/admin/ContentWorkbench.tsx`<br>`app/(admin)/admin/homepage/page.tsx`<br>`app/(admin)/admin/settings/page.tsx`<br>`components/admin/AdminSidebar.tsx` | Frontend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Quản lý state `dirty` khi form bị chỉnh sửa, kích hoạt sự kiện `topica:unsaved-changes` cho `AdminSidebar` chặn điều hướng (confirm popup) và gắn listener `beforeunload` chặn reload/đóng tab. Reset `dirty` khi lưu thành công, giữ dữ liệu và cờ `dirty` khi lưu thất bại. |
| **CMS-14** | P2 | Sửa user không tồn tại vẫn báo thành công | `app/api/admin/users/route.ts` | Backend | **verified** | `__tests__/cms/cms-p1-remediation.test.ts` | Kiểm tra sự tồn tại của `targetUser` trong transaction, trả về 404 nếu không tìm thấy, không ghi audit log cho thao tác thất bại. |
| **CMS-15** | P2 | Pagination sai kiểu gây lỗi hoặc phản hồi rỗng | `app/api/admin/leads/route.ts`<br>`app/api/admin/articles/route.ts`<br>`app/api/admin/pages/route.ts` | Backend | **verified** | `__tests__/cms/cms-p2-remediation.test.ts` | Chuẩn hóa ép kiểu `page`, `limit` an toàn bằng `Number.isFinite(...) ? Math.max(1, Math.trunc(raw)) : default`. Không để `NaN` lọt vào offset tính toán. Phản hồi đầy đủ: `page`, `limit`, `total`, `totalPages`, `items`. |
| **CMS-16** | P2 | Ảnh đại diện trong workflow yêu cầu nhập đường dẫn thủ công | `components/admin/ContentWorkbench.tsx`<br>`components/admin/content-fields.ts` | Frontend | **verified** | `__tests__/cms/admin-content-lists.test.ts` | Trường `featured_image` hỗ trợ: nút "Tải từ máy" trực tiếp, nút chọn từ "Thư viện Media", nút "Xóa", và xem trước (preview) ảnh trực quan trước khi gửi duyệt/công bố. |

---

## 2. Kiểm thử và Nghiệm thu Toàn diện

1. **Unit & Integration Tests**:
   - `vitest run __tests__/cms/`: **10/10 test files passed, 85/85 tests passed**.
   - `vitest run`: **47/47 test files passed, 291/291 tests passed**.
2. **Typecheck**:
   - `npm run typecheck`: **0 errors**.
3. **Production Build**:
   - `npm run build`: **Next.js 16.3.3 Turbopack build thành công 49/49 routes, 0 build errors**.
