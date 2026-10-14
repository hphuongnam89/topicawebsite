# Báo cáo audit Frontend — Topica Edu

**Ngày audit:** 14/10/2026  
**Commit hiện hành:** `2478238` (`chore: ignore .work test temp directory`); thay đổi ứng dụng được kiểm tra nằm trong commit `e16ebcc` ngay trước đó.  
**Kết luận:** **Chưa nên đánh dấu release/acceptance cho thay đổi CMS + English/Việt.** Typecheck và unit suite đạt, nhưng còn lỗi lint thật trong app, metadata English chưa nhất quán, một số text trợ năng chưa được dịch, và bằng chứng nội dung học phí/tuyển sinh chưa đạt điều kiện nghiệm thu của dự án.

## Tóm tắt cho người quyết định

| Hạng mục | Kết quả | Nhận định |
|---|---|---|
| TypeScript | Đạt (`tsc --noEmit --incremental false`, exit 0) | Không tìm thấy lỗi type ở snapshot cuối |
| Vitest | 47 file, 291 test đạt | Chạy với DB/upload/backup fixture dưới thư mục temp, notification stub; không dùng DB thật |
| ESLint app source | 1 error, 0 warning | Có thể chặn CI/release nếu lint là gate bắt buộc |
| ESLint toàn repo | 308 errors, 20 warnings | Kết quả bị nhiễu bởi `.next-bilingual-qa`, `.next-verify`, test và evidence scripts |
| English UI smoke | Nội dung chính chuyển ngữ được | Route English là redirect sang URL tiếng Việt có `?lang=en`; page title còn tiếng Việt |
| Visual/accessibility/performance | Chưa kiểm chứng đầy đủ | Không chạy axe/Lighthouse/build hoặc ma trận thiết bị trên snapshot này |
| Acceptance/backlog | 0 task được `accepted` | `progress.json`: 22 `in_progress`, 3 `verified`, 4 `planned`, 1 `implemented` |

> Đây là audit code + kiểm tra UI theo mẫu trên dev server đang chạy, không phải nghiệm thu toàn bộ route hoặc xác nhận dữ liệu tuyển sinh chính thức.

## Findings ưu tiên cao

### F-01 — English route trả nội dung dịch nhưng metadata/canonical vẫn theo tiếng Việt

**Mức độ: P1 — cần giải quyết trước khi phát hành song ngữ.**

- Khi mở `/en/contact`, app redirect tới `/lien-he?lang=en`. Browser snapshot cho thấy nội dung trang và nhãn biểu mẫu bằng English, nhưng `document.title` vẫn là **“Liên hệ | Topica”**.
- `app/(main)/lien-he/page.tsx:15–23` tạo metadata từ CMS tiếng Việt, canonical về `/lien-he`, đồng thời khai báo `en: /en/contact`. Trong khi đó `app/en/[...slug]/page.tsx:8–14` redirect các URL `/en/*` về đường dẫn tiếng Việt kèm `lang=en`.
- Điều này làm URL, title, canonical và hreflang không nhất quán; ảnh hưởng tab trình duyệt, chia sẻ link và khả năng index đúng trang English. Các Open Graph/description cũng cần được rà theo cùng locale.

**Đề xuất:** Có metadata theo locale cho title/description/OG; dùng URL English trả nội dung 200 ổn định hoặc bảo đảm hreflang trỏ thẳng tới URL canonical 200 tương ứng. Kiểm tra tương tự ở Home, Programs, Tuition, News và Admission.

### F-02 — Lint ứng dụng đang fail ở trang admin pages

**Mức độ: P1 nếu lint là CI gate; nếu không thì P2.**

- Chạy riêng ESLint trên app source (`app components lib proxy.ts`) cho **1 error**: rule `react-hooks/set-state-in-effect` tại `app/(admin)/admin/pages/page.tsx:55–57`, nơi effect gọi `fetchPages()` và helper này set loading/error state.
- `package.json` đặt script lint là `eslint .`; flat ESLint hiện quét cả `.next-bilingual-qa` và `.next-verify`. Vì vậy kết quả toàn repo tăng lên **308 errors / 20 warnings**, gồm generated build output và evidence/test scripts, không phản ánh riêng chất lượng source.

**Đề xuất:** Sửa effect/fetch state theo pattern được rule chấp nhận; cấu hình global ignore cho mọi build output `.next*/**` và đường dẫn evidence phù hợp; sau đó chạy lint theo cùng lệnh CI.

## Findings ưu tiên trung bình

### F-03 — Image alt của thẻ chương trình còn tiếng Việt ở giao diện English

**Mức độ: P2 — lỗi accessibility/localization.**

- Homepage English chuyển được heading và nội dung thẻ, nhưng accessibility snapshot vẫn có alt như **“Ảnh minh họa cho ngành Quản trị kinh doanh”**.
- `components/sections/ProgramsSection.tsx:51–56` dựng alt động từ tiếng Việt. `LocalizedImage.tsx:7–9` có gọi translator, nhưng không có key tương ứng cho chuỗi alt động này trong dictionary; do đó giá trị fallback còn tiếng Việt.

**Đề xuất:** Dịch alt từ một key ổn định hoặc tạo localized alt từ tên ngành đã dịch; kiểm tra accessible name của ảnh khi đổi locale, không chỉ text nhìn thấy.

### F-04 — Một phần test CMS kiểm tra lại helper tự định nghĩa thay vì implementation thật

**Mức độ: P2 — làm giảm độ tin cậy của test evidence.**

- `__tests__/cms/cms-p2-remediation.test.ts:47–100` tự khai báo lại `generateSlug` và tự mô phỏng keystroke/manual edit. `app/(admin)/admin/articles/categories/page.tsx:21–31` có implementation thật nhưng test không import nó; vì vậy implementation có thể lỗi mà test vẫn xanh.
- `__tests__/cms/cms-p2-remediation.test.ts:102–121` cũng tự khai báo `escapeCsvCell`; assertion xác minh helper trong test, không bảo đảm hàm export CSV production dùng cùng logic.
- Một số API-level test vẫn hữu ích, nhưng không nên mô tả toàn bộ hạng mục UI tương ứng là đã bao phủ chỉ dựa vào các helper test này.

**Đề xuất:** Tách helper production thành module dùng chung và import trực tiếp trong test; bổ sung component/integration test cho auto-slug khi gõ liên tục, sửa slug thủ công, tải/xuất CSV qua code production và cập nhật lại danh sách sau mutation.

### F-05 — `eslint .` đang trộn source với artifact sinh tự động

**Mức độ: P2 — chất lượng gate không phân biệt lỗi thật/nhiễu.**

- Các file có nhiều lỗi nhất trong lần lint toàn repo là `.next-bilingual-qa/types/*`, `.next-verify/types/*` và JavaScript chunk đã build.
- Điều này cùng tồn tại với một lỗi thật trong source ở F-02; hiện tại phải chạy lint giới hạn thư mục mới nhìn được lỗi ứng dụng.

**Đề xuất:** Bổ sung `globalIgnores` cho output sinh tự động và evidence; để lint command mặc định chỉ đánh giá source/test được hỗ trợ.

### F-06 — Runtime dùng để kiểm tra khác phiên bản Node được khai báo

**Mức độ: P2 — chưa xác nhận tương thích môi trường triển khai.**

- `package.json` khai báo `engines.node: 22.x`; môi trường audit đang là **Node v26.7.0**.
- Vitest/typecheck đạt trên runtime hiện tại, nhưng điều đó chưa thay thế việc xác minh trên Node 22.x mà dự án yêu cầu.

**Đề xuất:** Chạy CI/build/test trên đúng Node 22.x; giữ Node 26 làm môi trường phụ nếu có chủ đích.

## Release gate nội dung và evidence

- `docs/agent-execution/progress.json` ghi nhận 30 task nhưng **không có task nào `accepted`**; đa số vẫn `in_progress` hoặc `planned`.
- Theo hướng dẫn dự án, không tự xác nhận tuition/admission content chính thức nếu thiếu nguồn/evidence phê duyệt. Vì vậy dữ liệu học phí, học bổng, thời hạn tuyển sinh và giá trị văn bằng cần được đối chiếu với nguồn chính thức trước khi phát hành; audit frontend này không xác minh tính đúng của các con số.
- Báo cáo browser baseline ngày 12/10 là bằng chứng của snapshot cũ; không coi các lỗi hoặc điểm số trong đó là kết quả đã tái xác nhận trên commit hiện tại.

## Validation đã thực hiện

1. **Typecheck:** `node ./node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false` — `TSC_EXIT=0`.
2. **Unit suite:** `vitest run` — **47 test files, 291 tests passed**. `vitest.setup.ts` cấu hình DB, backup và upload riêng trong thư mục `topica-*` dưới temp, đồng thời bật notification stubs; fixture tạm do audit tạo đã được dọn.
3. **Lint source:** 1 error ở `app/(admin)/admin/pages/page.tsx:56`; 0 warning.
4. **Lint toàn repo:** 308 errors, 20 warnings; phần lớn bị ảnh hưởng bởi `.next-bilingual-qa`/`.next-verify`, test và evidence scripts.
5. **Browser smoke, chỉ đọc:** Home tiếng Việt → chuyển English; trang `/en/contact` → redirect `/lien-he?lang=en`, body English nhưng title tiếng Việt. Không gửi biểu mẫu hay thay đổi dữ liệu.
6. **Không thực hiện:** `next build`, E2E, axe, Lighthouse, kiểm thử trên nhiều viewport/browser. Dev server đang dùng port 3000 và các build output riêng tồn tại; tránh khởi chạy build/test browser có nguy cơ đụng môi trường dùng chung.

## Khuyến nghị thứ tự khắc phục

1. Đồng bộ URL/metadata/canonical/hreflang cho English; kiểm tra title, description và OG trên các route quan trọng.
2. Sửa lint error source và cấu hình bỏ qua build artifacts/evidence trong lint gate.
3. Hoàn thiện accessible text/alt của ảnh và các thuộc tính ARIA theo locale; thêm kiểm thử accessible name.
4. Thay helper test bị sao chép bằng test trực tiếp production helper/component; bổ sung integration test cho trạng thái loading/error, mutation và refresh.
5. Chạy lại CI trên Node 22.x; sau đó build và QA trên môi trường tách biệt với dev server, gồm responsive, keyboard, axe và các hành trình Home → Programs → Tuition → Contact.
6. Chỉ cập nhật task sang `accepted` khi có evidence theo `ACCEPTANCE_AND_EVIDENCE.md` và dữ liệu tuyển sinh đã được xác minh.

## Ghi chú trạng thái repository

Trong lúc audit, commit ứng dụng `e16ebcc` được tạo và sau đó có commit `2478238` chỉ thêm ignore rule `.work/`; các test và lint cuối được chạy sau commit ứng dụng. Báo cáo này **không sửa source và không tạo commit**. `git show --check HEAD` còn một finding line-ending ở `.gitignore:73` (`.work/` bị Git xem là trailing whitespace do CRLF).