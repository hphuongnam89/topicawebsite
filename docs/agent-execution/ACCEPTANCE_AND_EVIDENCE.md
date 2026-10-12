# Nghiệm thu, hợp đồng dữ liệu và bằng chứng

Không đánh dấu pass nếu chưa chạy. Không gộp lỗi môi trường với lỗi ứng dụng. Các ngưỡng nội bộ dưới đây là mục tiêu dự án cần giữ nhất quán khi review; không tự hạ ngưỡng để đạt.

## 1. Definition of Done cho mọi task

- [ ] Đã đọc dependency, source hiện tại, yêu cầu người dùng và guide Next liên quan.
- [ ] Có danh sách file/contract/data migration bị tác động và phạm vi không đổi.
- [ ] Đầu ra tồn tại, dùng được; không chỉ tài liệu mô tả hoặc placeholder.
- [ ] Thông tin mới dùng nguồn đã xác nhận; không có dữ liệu giả trong public.
- [ ] Test phù hợp bắt được hành vi sai, chạy trong môi trường riêng; lưu command/exit code/log.
- [ ] UI có screenshot thực ở viewport/states liên quan, đã xem ảnh và sửa lỗi nhìn thấy.
- [ ] Không hồi quy consumer/route/admin liên quan; khi source mới thay đổi sau test, chạy lại phần bị ảnh hưởng.
- [ ] Không mất DB/upload/lead, không gửi notification thử ra ngoài, không lộ secret/PII trong bằng chứng.
- [ ] Docs/contract đúng source cuối cùng; findings còn lại có mức độ, owner và hạn.
- [ ] Có handoff với evidence/build/commit; review độc lập hoặc xác nhận nghiệp vụ khi cần.

Task có thể `implemented` khi code xong nhưng môi trường/người kiểm tra còn thiếu; chỉ `verified` khi test phù hợp đã chạy, chỉ `accepted` khi đủ gate nghiệp vụ liên quan. Nếu không có nhu cầu approval nghiệp vụ riêng, người review kỹ thuật có thể accept và ghi lý do.

## 2. Hợp đồng dữ liệu tối thiểu cho R16

Đây là yêu cầu logic, không buộc mỗi dòng là một table. Backend đề xuất schema ít phức tạp nhất, có validation và migration rõ.

| Entity                       | Dữ liệu tối thiểu                                                                                                           | Quy tắc                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Organization/contact/service | ID, tên, vai trò/phạm vi, phone/email/URL, giờ hỗ trợ, địa điểm, nguồn, version                                             | Nguồn chung cho mọi điểm chạm; URL dịch vụ có loại library/LMS/assessment/application/status          |
| Program                      | ID, slug/aliases, tên chính thức, chuyên ngành, mã, hình thức, văn bằng/đơn vị cấp, thời gian/tín chỉ theo đối tượng, nguồn | Không dùng slug như tên chính thức; không giữ facts trùng ở nhiều file không đồng bộ                  |
| AdmissionRound               | ID, programs/cohort/audience, open/deadline/start timestamps, application URL, documents, source                            | Trạng thái nghiệp vụ từ thời gian và bản đã duyệt; quy ước ngày/hạn rõ                                |
| TuitionPolicy                | ID, program/cohort/audience/currency, unit price, fees, credits/assumptions, effective interval, source/doc                 | Tiền nguyên VNĐ, phạm vi không mơ hồ; không chọn ngẫu nhiên policy khi chồng hiệu lực                 |
| Scholarship                  | ID, phạm vi, giá trị/cách tính, điều kiện, thời hạn, cách xét, nguồn                                                        | Không tự áp ưu đãi vào tổng nếu người học chưa đủ điều kiện                                           |
| Document/media               | ID, title/type, file/view URL, MIME/bytes/checksum khi có, date/version/source, rights, alt/caption/focal, access           | Không giả ngày/MB; private không lộ; link xem và tải có nghĩa khác nhau                               |
| Content/revision             | Entity ID, revision ID, payload, workflow state, publishAt/expireAt/highlightUntil nếu cần                                  | Public trỏ revision approved/published phù hợp; draft không làm thay public                           |
| Audit                        | actor, action, entity/revision, timestamp, changed fields/reason                                                            | Append-only theo service; tránh lưu secret/PII không cần thiết; không biến editor thành người xóa log |
| Lead                         | ID, dữ liệu tư vấn tối thiểu, program ID hoặc chưa xác định, source sạch, status, consent timestamp/policy version          | Backend validate, phân quyền; idempotency không khóa số điện thoại vĩnh viễn                          |
| Analytics                    | event allowlist, anonymous/session policy, page/program/category, server time, environment                                  | Không PII/raw input, loại test/bot theo quy tắc; retention/consent theo chính sách được chốt          |

**Workflow khởi điểm:** draft → in_review → approved → scheduled/published → archived. Reject trả về draft kèm lý do. Publication phải gắn revision được duyệt. Nếu scheduled là trạng thái tính toán thay vì enum lưu, ghi contract rõ. Sửa published tạo draft mới; sửa revision đã duyệt làm mất hiệu lực approval của revision mới. Archive không đồng nghĩa xóa vĩnh viễn.

**Quyền khởi điểm:** editor tạo/sửa/gửi duyệt nội dung; admin duyệt/công bố/quản tài khoản/cấu hình nhạy cảm. Lead chỉ người được phân công có quyền. Quyền chi tiết và người duyệt thực do Topica chốt, không suy từ việc UI có nút.

**Cache/time:** mọi public consumer đọc cùng một published DTO. Lưu UTC, nhập/hiển thị GMT+7; mục tiêu lịch/hết highlight cập nhật ≤60 giây kể cả cache nóng. Thời gian của một ngày tuyển sinh cần quy ước cụ thể, không tự hiểu date-only theo UTC.

## 3. Ma trận UI/thiết bị

### Coverage tối thiểu

| Phạm vi                                           | Bề rộng kiểm tra                                          | Trạng thái                                                                |
| ------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| T01 trang chủ, T03 ngành, T05 học phí, shell/form | 320, 360, 390, 768, 1024, 1280, 1440px                    | populated, nội dung dài, thiếu ảnh/file; menu/form errors theo ngữ cảnh   |
| T02, T04, T06–T12                                 | 360 hoặc 390, 768, 1440px; thêm 320 và breakpoint vừa sửa | template states phù hợp, links/anchor/search/404                          |
| T13 CMS                                           | 390, 768, 1440px                                          | draft/review/published/scheduled, validation/save/error/quyền/concurrency |
| Mọi template trước release                        | Kiểm tra nhanh 320 và 1024px                              | Reflow, vùng tràn, font, heading, CTA và thông tin quyết định             |

Chrome/Edge desktop, WebKit browser automation, Safari iPhone thật và Chrome Android thật theo thiết bị sẵn có. Ghi version/thiết bị thực; nếu chưa có thiết bị thật thì ghi thiếu, không gọi mô phỏng là đã test iPhone/Android. Thiết bị bổ sung theo traffic sau release.

Kiểm tra zoom 200%, reflow 320 CSS px, landscape, font tải chậm, mạng chậm, bàn phím ảo form và nội dung cuối trang. Ảnh before/after cùng kích thước/route/dataset để so được. Không dùng ảnh cắt chỉ vùng đẹp làm bằng chứng toàn template.

## 4. Kịch bản E2E và integration bắt buộc

Các case phải có fixture và expected result; không nhất thiết mỗi dòng là một test độc lập nếu cùng hành vi. Test chức năng thay đổi cần meaningful assertions, không chỉ `page has text`.

| ID  | Tình huống                                           | Kết quả cần kiểm tra                                                         |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| E01 | Homepage → danh mục → một ngành; lặp dữ liệu 5 ngành | Tên/facts/chuyên ngành đúng nguồn, đích và canonical thống nhất              |
| E02 | Người học tìm đơn vị cấp bằng, cách học/thi          | Nội dung dễ thấy, không mâu thuẫn giữa homepage/ngành/học phí/FAQ            |
| E03 | Xem học phí theo khóa/đối tượng                      | Policy đúng hiệu lực, đơn giá/tổng/giả định và khoản khác nhất quán          |
| E04 | Kỳ tương lai/đang mở/đóng; không có kỳ               | Trạng thái/CTA đúng ở homepage, admission, search/news liên quan             |
| E05 | Đồng hồ trước/tại/sau publish/expiry, cache nóng     | Không công bố sớm; hết ưu tiên đúng hạn; sai lệch nằm trong budget           |
| E06 | Form trống/sai/thiếu consent                         | Lỗi trường + summary đúng, server từ chối request không hợp lệ               |
| E07 | Form hợp lệ                                          | Lưu đúng một lead vào DB test, nguồn/consent đúng, success đúng nghĩa        |
| E08 | Double click/retry/timeout/429/500                   | Không nhân đôi cùng idempotency; giữ input; feedback phân biệt được          |
| E09 | Notification provider lỗi                            | Lead đã lưu không mất; có trạng thái/log xử lý được, không gửi lại gây trùng |
| E10 | Search có/không kết quả, back navigation             | Query giữ, loại kết quả/empty hợp lý, không draft/lead/private               |
| E11 | Menu desktop/mobile, search drawer, keyboard         | Escape/focus/scroll lock, link và close đúng, không CTA nền nhận focus       |
| E12 | File xem/tải; file thiếu; tên dài                    | MIME/bytes/nội dung đúng, không download HTML; fallback phù hợp              |
| E13 | Route legacy/alias/broken URL                        | Redirect đích cuối đúng chủ đề, không loop; 404 đúng status và hữu ích       |
| E14 | Editor gọi publish/users/settings endpoint trực tiếp | Server từ chối thao tác vượt quyền; UI không là lớp bảo vệ duy nhất          |
| E15 | Draft → review → approve → publish                   | Public chỉ đổi theo revision đã duyệt; sửa sau duyệt cần duyệt lại           |
| E16 | Preview có quyền/không quyền/expired                 | Không public/cache/index draft; exit preview trả trạng thái đúng             |
| E17 | Hai tab sửa một record                               | Phát hiện version conflict; không silently overwrite                         |
| E18 | Upload sai MIME/quá dung lượng/path độc hại          | Server từ chối, không ghi file ngoài thư mục; file hợp lệ dùng được          |
| E19 | Published → draft/archived trong CMS                 | Không lọt qua static fallback, sitemap/search/catch-all                      |
| E20 | Migration lần đầu/lặp/lỗi giữa chừng                 | Idempotent, dữ liệu không mất, transaction/rollback đúng                     |
| E21 | Backup trong WAL/write → restore riêng               | Integrity/data/media đúng, không xóa backup tốt khi bản mới lỗi              |
| E22 | Restart/redeploy instance                            | DB/uploads tồn tại, không init admin/seed public ngoài ý muốn                |
| E23 | Event CTA/form/download                              | Một thao tác đúng event, không PII, không success khi API fail               |
| E24 | Sửa contact/policy/kỳ đã duyệt qua CMS               | Mọi consumer cập nhật đúng, cache không hiển thị trái policy                 |

## 5. Accessibility

Mục tiêu các tiêu chí WCAG 2.2 AA áp dụng, kiểm tra tự động kết hợp thủ công. Theo [WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/): tương phản chữ thường 4.5:1, chữ lớn 3:1; mục tiêu chạm tối thiểu AA có quy tắc 24×24 CSS px và ngoại lệ. Dự án đặt mục tiêu tiện dụng nội bộ 44px cho nút/thao tác mobile chính, không gọi đây là ngưỡng AA cho mọi link.

Checklist thực thi nội bộ:

- Axe trên template và trạng thái đang mở/error, lưu violations/incomplete/selector; không còn critical/serious chưa xử lý. Các mức khác vẫn phải review theo tiêu chí áp dụng.
- Dùng Tab/Shift+Tab/Enter/Space/Escape trong shell, form, accordion, search; không mắc kẹt hoặc mất dấu focus. Focus không bị sticky che.
- Thử skip link, label/error, tên liên kết, heading/landmark, ảnh/caption, table headers và live feedback qua NVDA/VoiceOver cho luồng chính; ghi thiết bị/công cụ và hành vi.
- Zoom/reflow, pointer/touch, reduced motion, ảnh lỗi và dữ liệu dài; thông tin trạng thái đọc được khi không phân biệt màu.
- Đo computed colors thực tế, nền/opacity/image overlay trong các trạng thái. Không lấy màu khác token rồi coi là kiểm tra giao diện.
- Ghi checklist tiêu chí áp dụng, pass/fail/not_applicable/not_tested cùng lý do và evidence. Pass axe không tự đổi `not_tested` thành pass.

## 6. Hiệu năng và SEO

### Mục tiêu và cách đo

Theo [Core Web Vitals](https://web.dev/articles/vitals), mục tiêu field ở percentile 75, tách mobile/desktop: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Chưa đủ traffic/RUM/CrUX thì ghi chưa có field data; không dùng Lighthouse thay bằng chứng field.

Ngân sách lab nội bộ khởi điểm: Lighthouse mobile Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 trên T01/T03/T05; LCP/CLS lab đối chiếu mục tiêu trên, TBT mục tiêu ≤200ms và ghi rõ là lab. Điểm accessibility cao vẫn không thay manual review. Tối ưu dựa vào trace/LCP element/long task/CLS source; nếu môi trường không tái lập được, ghi blocker thay vì xuất score.

Chạy production build staging, 3 lần/route/config, lưu từng report và trung vị, browser/tool/runtime/network/CPU/thời gian/cache. Không chọn riêng lần cao nhất. Template khác có tải nặng cũng cần đo. Ngân sách ảnh hero khởi điểm ≤300KB ở kích thước mobile phổ biến nếu chất lượng vẫn đạt; thay đổi có đo và lý do, không giảm chất lượng ảnh mù.

### SEO/links

- Titles/descriptions/canonical/OG plain text đúng nội dung, không entities lộ; không ép mọi description cùng một độ dài bằng cắt mù.
- Sitemap chỉ public/canonical đủ điều kiện; robots phù hợp môi trường; staging/preview không index. Structured data khớp nội dung nhìn thấy, không rating/scholarship tự tạo.
- Crawl links trong rendered page, đích redirect cuối, anchor tồn tại, file MIME/bytes và external theo timeout/rate hợp lý. Lỗi kết nối giữ mã gốc, không giả status HTTP.
- Link quan trọng phải đúng chức năng, không chỉ trả 200. External CAPTCHA/403/timeout ghi needs_review và owner; không tự bypass.

## 7. UAT nghiệp vụ do Topica thực hiện

| Người xác nhận          | Nhiệm vụ                                                          | Bằng chứng                                    |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| Đào tạo                 | So sánh 5 ngành, bằng cấp, học/thi, tín chỉ/thời gian, curriculum | Record nguồn và danh sách field được duyệt    |
| Tài chính/tuyển sinh    | Xem giá/phí/học bổng theo đối tượng, kỳ/hạn/hồ sơ, file           | Bản policy/kỳ có version và xác nhận          |
| Biên tập viên           | Tạo kỳ, cập nhật học phí, thay ảnh, đăng tin, đặt hết ưu tiên     | Walkthrough trên staging, kết quả public đúng |
| Reviewer/admin          | Duyệt revision, kiểm quyền, sửa lịch, xử lý conflict              | Transition/audit log và screenshot            |
| Vận hành                | Restore, rollback, kiểm volume/restart, notification/monitoring   | Runbook được làm thử và log                   |
| UX/đại diện thương hiệu | Review T01/T03/T05 và các mẫu còn lại                             | Screenshot rubric và findings đã xử lý        |

Agent chuẩn bị và hỗ trợ, không giả mạo người duyệt. Nếu thiếu người, ghi rõ task/gate đang chờ; phần kỹ thuật độc lập vẫn có thể tiếp tục.

## 8. Release gates G0–G9

| Gate                         | Điều kiện bắt buộc                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| G0 — Phiên bản và môi trường | Biết source/build/runtime/dataset; test biệt lập, không chạm production                 |
| G1 — Nội dung                | Thông tin quyết định có nguồn/duyệt, không mâu thuẫn; file/contact/cổng đúng            |
| G2 — Visual                  | Spec/rubric/ma trận đạt; hero và mobile chỉnh chu, không CTA/bảng khó đọc               |
| G3 — Hành trình              | 6 luồng hoạt động, nghiên cứu có evidence và findings nghiêm trọng đã sửa/thử lại       |
| G4 — CMS                     | Biên tập viên làm được nghiệp vụ; quyền/workflow/preview/time/cache thực sự có hiệu lực |
| G5 — Chức năng               | Unit/integration/E2E phù hợp đạt; migration/idempotency/error handling đã kiểm tra      |
| G6 — Accessibility           | Automation và manual đạt phạm vi áp dụng, không blocker còn mở                          |
| G7 — Build/performance/SEO   | Build tái lập đạt, báo cáo lab thật, links/metadata/index đúng                          |
| G8 — Vận hành                | Backup/restore/rollback/persistence/notification/monitoring và owner được xác nhận      |
| G9 — Quyết định release      | Không P0/P1, P2 có quyết định; Topica xác nhận RC cụ thể, bàn giao sẵn sàng             |

Phase 11 có gate riêng: 30 ngày dữ liệu thật và vòng cải tiến R28. Không bắt field INP chưa đủ dữ liệu thành “đã đạt” trước release; đây là chỉ số cần theo dõi sau release.

## 9. Severity và cách xử lý lỗi

| Mức | Ví dụ                                                                                                | Xử lý                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| P0  | Mất dữ liệu, lộ dữ liệu/credential, truy cập trái phép nghiêm trọng                                  | Dừng hành động gây hại, giữ evidence an toàn, báo ngay; rollback theo runbook được phép |
| P1  | Sai chi phí/bằng cấp/hạn; form lõi hỏng; CTA không đọc/nhấn được; public draft; backup không restore | Chặn release, sửa và test lại luồng liên quan                                           |
| P2  | Vướng UX mức vừa, inconsistency phụ, hiệu năng chưa budget có phương án                              | Owner/hạn và quyết định chấp nhận nếu để sau; không tự hạ severity                      |
| P3  | Chi tiết trang trí/wording không ảnh hưởng quyết định                                                | Gom đợt polish, vẫn ghi rõ                                                              |

Defect record: ID, build, route/template/state, viewport/device, steps, expected/actual, severity, screenshot/log, owner, task sửa, retest build/result. Không ghi “đã sửa” chỉ vì patch đã áp dụng.

## 10. Bằng chứng phải lưu

Đề xuất thư mục `docs/evidence/<run-id>/` cho manifest/log đã khử nhạy cảm. Screenshot/report lớn dùng kho artifact hoặc đường dẫn ngoài Git phù hợp, manifest trỏ tới nơi truy cập được. Không commit DB, recordings có thông tin riêng, raw lead hoặc secret. Nếu repo chọn ignore evidence, lưu artifact trước khi dọn worktree.

```text
<run-id>/
  manifest.json         # source/build/runtime/browser/config/dataset/start/end
  summary.md            # kết quả, findings, giới hạn, next action
  commands.json         # command, exit code, log path, pass/fail/blocked/not_run
  screenshots/          # template-state-viewport-before-or-after
  links.json            # requested/final URL, status/MIME/anchor/error
  axe/                  # reports theo route/state
  lighthouse/           # từng JSON/HTML thật + trung vị, không score tự in
  e2e/                  # report/trace cho lỗi và luồng quan trọng
  manual-qa.csv         # device/criteria/result/evidence/reviewer
  uat.md                # xác nhận thật hoặc còn chờ
```

Một evidence manifest phải ghi source dirty status hoặc patch hash nếu chưa commit, không ghi mỗi commit cũ làm như đã bao gồm thay đổi mới. Dữ liệu fixture/version và clock của test thời gian phải tái lập được.

## 11. Lệnh kiểm tra và giới hạn hiện tại

Hiện có `format:check`, `typecheck`, `lint`, `test`, `build`, `test:e2e`, `test:seo`, `test:links`, `test:a11y`, `test:lighthouse`, `verify` trong package.json. Trước R01/R22, không coi các script QA hiện tại là bằng chứng đầy đủ; CMS test có thể chạm DB thật.

Trình tự sau khi R01/R22 đã được xác minh:

1. Cài dependency theo lockfile ở checkout riêng khi cần; xác nhận Node thực và docs Next đi kèm.
2. Format các file thuộc task; full-repo format là commit riêng có review. Chạy format check/typecheck/lint.
3. Unit/integration dùng DB fixture riêng và notification stub; không gọi seed/clean DB thật.
4. Build release ở checkout/output riêng, lưu log/exit code; kiểm tra middleware/proxy theo version, không migrate mù.
5. Start build trên port riêng được cấu hình, gắn baseURL rõ; không dừng server người dùng để giành 3000.
6. Chạy E2E/links/axe/Lighthouse runner đã sửa, rồi manual QA/UAT.
7. Chạy lại phần bị ảnh hưởng nếu còn sửa source sau đó; ghi đúng RC cuối cùng.

Nếu bị EACCES/EPERM/port conflict, xác định process/path/permissions, dùng temp/port/checkout hợp lệ và ghi blocker. Không tắt auth/CSP/validation, không giả pass, không thay test suite bằng một script kiểm tra chuỗi để vượt gate.
