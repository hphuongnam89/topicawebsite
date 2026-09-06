# Program Data Audit

**Phạm vi:** audit dữ liệu 5 ngành trong registry và đối chiếu sâu 3 trang hiện tại. Không sửa dữ liệu chương trình.

## Kết luận nhanh

- Homepage chính thức xác nhận danh mục 5 ngành.
- Thông báo tuyển sinh 2026 – đợt 2 xác nhận 4 ngành trong nội dung notice và không liệt kê Du lịch; đây là mâu thuẫn phạm vi tuyển, không đủ căn cứ để xóa Du lịch khỏi danh mục.
- QTKD có local DOCX/academic evidence rõ hơn các ngành còn lại.
- Dữ liệu chi tiết của CNTT – Đồ họa kỹ thuật số và Du lịch không được coi là verified chỉ vì tên ngành hoặc vì có data trong TypeScript.
- Không có cơ sở audit web đủ để xác nhận đồng loạt tổng học phần, STT, tín chỉ, 9 học kỳ, PLO hoặc điều kiện tốt nghiệp cho cả 5 ngành.

## Trạng thái đang render ở local app

Đã mở và đọc accessibility tree của 4 route local. Homepage hiển thị 5 card ngành. Ba trang được yêu cầu đang hiển thị:

- QTKD: mã 7340101, 126 tín chỉ, 9 học kỳ, 59 học phần.
- CNTT – Đồ họa kỹ thuật số: mã 7480201, 126 tín chỉ, 9 học kỳ, 53 học phần.
- Du lịch: mã 7810103, 126 tín chỉ, 9 học kỳ, 57 học phần.

Các số này xác nhận **current render**, không xác nhận **official approval**. Không dùng chúng làm căn cứ học thuật nếu chưa có DOCX/PDF đúng ngành, đúng phiên bản và người phụ trách duyệt.

## Ma trận 5 ngành

| Ngành | Route/data hiện tại | Nguồn web chính thức | Trạng thái audit | Không được suy diễn |
|---|---|---|---|---|
| Quản trị kinh doanh – Marketing số | `data/program-details.ts`, `data/program-page-content.ts`; code 7340101; local DOCX QTKD 2026 | S01, S08, S11; S03 tuyển QTKD | `needs-review` cho public academic detail; local evidence tốt hơn | Không coi mọi course/PLO/career trong code là claim web đã duyệt |
| CNTT – Đồ họa kỹ thuật số | `data/supplemental-program-details.ts`, `data/program-page-content.ts`; registry marketing label | S01, S09, S11; S03 tuyển CNTT – Digital Graphics | `needs-review` | Không dùng chuẩn đầu ra CNTT chung để xác nhận toàn bộ chuyên ngành đồ họa |
| Quản trị Dịch vụ Du lịch & Lữ hành | `data/supplemental-program-details.ts`, `data/program-page-content.ts` | S01/S10 có ngành; S03 không liệt kê | `conflicting` về phạm vi đợt tuyển; academic detail `needs-review` | Không kết luận ngành đã bị dừng hoặc vẫn mở tuyển nếu chưa có notice mới |
| Ngôn ngữ Anh | `data/supplemental-program-details.ts`, `data/programs.ts` | S01; S03/S04 có trong danh mục tuyển | `needs-review` cho academic detail | Không suy ra course count/credits/PLO từ ngành khác |
| Ngôn ngữ Trung | `data/supplemental-program-details.ts`, `data/programs.ts` | S01; S03/S04 có trong danh mục tuyển | `needs-review` cho academic detail | Không suy ra course count/credits/PLO từ ngành khác |

## Đối chiếu 3 trang hiện tại

### 1. QTKD – Truyền thông & Marketing số

| Trường dữ liệu | Hiện tại trong repo | Evidence | Kết luận |
|---|---|---|---|
| Tên/ngành | QTKD, marketing số/kinh doanh số | S01, S08 | Marketing copy có thể dùng có điều kiện |
| Hình thức | Từ xa · E-learning | S03/S04 | Có nguồn; giữ phạm vi thông báo |
| 126 tín chỉ, 9 học kỳ, 59 học phần | `data/program-details.ts` + local DOCX | Local evidence; chưa phải web source map đủ cho public | Cần đào tạo duyệt trước khi public |
| Course/PLO/career | Có bảng chi tiết trong TypeScript | S11 chỉ hỗ trợ một phần | Không xác nhận toàn bộ; không sửa/bổ sung bằng suy luận |

### 2. CNTT – Chuyên ngành Đồ họa kỹ thuật số

| Trường dữ liệu | Hiện tại trong repo | Evidence | Kết luận |
|---|---|---|---|
| Tên/ngành | CNTT – Đồ họa kỹ thuật số | S01/S03 có tên gần tương ứng; S09 cần đọc lại | Có thể giữ tên marketing sau khi owner xác nhận tên chính thức |
| Hình thức/học phí | Dùng claim dùng chung | S03 | Có thể dùng cautious wording |
| 126 tín chỉ, 9 học kỳ | `supplemental-program-details.ts` | Chưa có bảng web đủ chi tiết | `needs-review` |
| Nội dung đồ họa | Có mỹ thuật, logo, UI/UX, game, motion | S11/CNTT chung không đủ xác minh | Không public như học thuật đã được duyệt |

### 3. Quản trị Dịch vụ Du lịch & Lữ hành

| Trường dữ liệu | Hiện tại trong repo | Evidence | Kết luận |
|---|---|---|---|
| Tên/ngành | Có trong `programs.ts` và trang chi tiết | S01/S10 | Ngành tồn tại trên homepage; phạm vi tuyển hiện tại đang conflict |
| Hình thức/học phí | Dùng claim dùng chung | S03 | Có thể dùng cautious wording |
| 126 tín chỉ, 9 học kỳ, 57 học phần | `supplemental-program-details.ts` + local evidence | Chưa có nguồn web đủ chi tiết | Không coi là verified |
| Lữ hành/khách sạn/career | Có trong marketing content | S10 chưa đủ academic evidence | Cần đào tạo/marketing duyệt |

## Quy tắc dữ liệu học thuật

1. DOCX/PDF đúng ngành, đúng phiên bản là nguồn bắt buộc cho course count, STT, mã, tín chỉ, học kỳ, PLO và tốt nghiệp.
2. Không suy ra dữ liệu của 4 ngành từ DOCX QTKD.
3. Không suy ra “chuyên ngành Đồ họa kỹ thuật số” từ chuẩn đầu ra CNTT chung.
4. Không suy ra Du lịch đang mở tuyển chỉ vì homepage có card ngành.
5. Giữ STT 52–53 theo DOCX nếu đó là STT nguồn; bỏ câu chú giải nội bộ khỏi public label, không tự đổi STT.
6. Local TypeScript là bản triển khai hiện tại, không phải bằng chứng độc lập.
7. Mọi trường chưa có evidence phải để `needs-review` hoặc ẩn khỏi public; không điền số ước lượng.

## File/route cần theo dõi trong lần duyệt sau

- `data/programs.ts`
- `data/program-details.ts`
- `data/supplemental-program-details.ts`
- `data/program-page-content.ts`
- `components/cms/ProgramPageView.tsx`
- `app/(main)/[...slug]/page.tsx`
- `components/admission/AdmissionHub.tsx`
- `components/tuition/TuitionHub.tsx`

Audit này không chỉnh các file trên; chỉ ghi nhận rủi ro và nguồn cần duyệt.
