# Bàn giao phiên hoàn thiện — 12/10/2026

## Phiên bản và phạm vi

HEAD `f5a6b34709b6f4a88df0e2db10348f7f959ae8bc` đã có nhiều thay đổi trước phiên. Không commit/reset/stash toàn cây. So với bản bất biến buổi sáng: 62 file app/config/script thay đổi hoặc thêm, không file bị xóa; xem `source-review.json` và `source-delta.patch`. Đây là delta theo snapshot sáng, không coi toàn bộ Git diff thuộc phiên này.

Bản cuối: `completion-07`, build `z-dfCLfZfOGKVHtq48mcX`, fingerprint `af766dbc76b773682110d1b05762c95c0b162a124e11a36c86c616543030c8ec`, 228 file. `final-build-manifest.json` ghi compiler Webpack, Node24.19.0/Next16.3.3, build exit0, helper/config root trước/sau không đổi. `source-review-command.log` exit0, source root khớp bản build. Node22.x theo package chưa thử trong phiên.

User cho phép build/Chromium ngoài sandbox; chỉ bản sao scratch, port3107, DB/tài khoản giả lập, upload/backup riêng, notification stub. Automation qua đêm vẫn PAUSED. Không deploy/push/merge, không sửa DB thật. Ba lỗi EPERM sandbox và những lần QA lỗi trước sửa giữ nguyên evidence.

## Thay đổi chính

- R11/R15: hero ưu tiên thông tin/ảnh, form xuống dưới; form ngắn với optional email/trình độ, stable program IDs, consent, focus lỗi, khóa double-click/retry idempotent/TTL, timeout giữ input. Server kiểm schema/body/rate, lưu transaction trước notification và success event; duplicate không nhân lead/event.
- R16–R18: revision snapshot, CAS, editor→review/admin→approve→publish, role đọc lại DB, audit transaction, preview HMAC gắn user/revision/5 phút, lịch UTC `[start,end)`. Sửa published legacy qua workflow, không editor publish trực tiếp. Archive/expiry không làm sống lại bản cũ.
- R19/R21: workbench đa domain, load theo mã, draft/preview/duyệt/lịch, cảnh báo chưa lưu, mobile layout/drawer/focus; readers public/search/category/sitemap/program/contact/tuition/admission lấy version hiệu lực. Sitemap không cắt ở 100 bài hoặc quảng bá CMS-only hub trống.
- R03/R05/R06: đối chiếu topicauni.edu.vn, sửa phí/học bổng có căn cứ, bỏ lời hứa tài chính/chứng thực/file giả; không tự seed kỳ đang mở. Ghi mâu thuẫn thời gian/contact/địa điểm.
- R02: bundle DB+uploads có inventory/checksum, kiểm thay đổi trong lúc copy, restore target mới, chống traversal; không tự maintenance/rotation production.
- R27: bỏ raw query/PII analytics, metadata allowlist, success event sau commit. Các event/funnel chưa có ghi rõ trong contract.

## Kiểm chứng thật

| Kiểm tra | Kết quả / evidence |
| --- | --- |
| Full unit/integration | `01-form/full-tests-5.log`: 33 file, 216 pass, 1 skip Windows hardlink, exit0 |
| TypeScript | `01-form/typecheck-9.log`: exit0; build cuối cũng typecheck đạt |
| ESLint | `01-form/lint-6.log`: exit0, không warning |
| Diff whitespace | `01-form/diff-check-2.log`: exit0 |
| Build cuối | `01-form/build-server-7.log` + manifest: exit0 |
| Form/API/RBAC/preview/workflow/archive/lịch/privacy | `08-workflow/command.log`: exit0; `workflow-results.json` từng case pass, pageErrors=[] |
| Lịch cache nóng | Bắt đầu +531ms, hết hạn +521ms trong một lần đo localhost; không phải SLA production |
| CMS axe mobile | `08-workflow/cms-editor-axe.json`: không violation thuộc tags đã chọn |
| UI/axe public | `09-ui/results.json`, `08-workflow/capture-command.log`: 9 template × 1440/1280/390/320 =36, exit0, không violation/overflow/broken image quan sát được, font loaded |
| Backup DB+media | `01-form/storage-tests.log`: 4 fixture cases đạt; full suite có các ca này |

Browser workflow dùng login API thật và thao tác UI CMS; không thay thế kiểm tra giao diện login hoặc UAT người thật. Tin tức trong matrix là trạng thái empty của DB fixture; chưa phải toàn bộ article/content thực. T06/T07/T09, Lighthouse/Core Web Vitals, thiết bị thật/keyboard ảo, production/staging khác máy còn `not_run` cho source cuối.

## Findings đã sửa

| ID | Mức | Phát hiện → sửa → evidence |
| --- | --- | --- |
| F01 | P1 | GET homepage thiếu admin guard; run04 browser fail403/200 → guard/read trước DB + regression 2 tests → run05/06/07 pass |
| F02 | P1 UX | CMS390 bị header chiếm cột, nội dung quá hẹp → flex-col mobile/min-w-0/sidebar hidden khỏi focus → ảnh run06/07 và workflow geometry/drawer pass |
| F03 | P2 UX | Desktop nav nhiều dòng → padding/font/nowrap hợp lý → ảnh1280/1440 mới, không overflow |
| F04 | P1 a11y | Bộ lọc news trắng trên gold contrast3.19 → navy/white → `07-ui` fail giữ nguyên, `09-ui` 4viewport pass |

Đã xem ảnh thật: homepage1440/390/1280, tuition320, form invalid, CMS editor390/admin1440; ảnh sau sửa xem lại ở `09-ui` và `08-workflow`. Không suy rộng axe thành chứng nhận WCAG toàn site.

## Gate còn mở

1. Nội dung: `SOURCE_RECONCILIATION_2026-10-12.md` D01–D08; chưa có người duyệt giá từng hồ sơ, kỳ đang mở, thời lượng, role contact/địa điểm và quyền ảnh/file. Owner nghiệp vụ Topica chưa chỉ định; không tự accepted.
2. R19: field JSON phụ, preview domain chưa bằng public template, chưa dashboard nghiệp vụ đầy đủ/media UAT 5 nhiệm vụ. Owner kỹ thuật Codex; cần tiếp tục implementation và editor UAT, chưa đóng task.
3. R15/R27: rate limit lead trong process/proxy trust, notification chưa outbox/retry/status; taxonomy/funnel/bot/session chưa đủ. Cần chốt topology/chính sách đo và hoàn thiện kỹ thuật, không gọi dữ liệu hiện có là funnel hoàn chỉnh.
4. R02/R25: disk-full/permissions/restore volume thật, retention/offsite, Node22, RPO/RTO/cutover/rollback còn chờ môi trường/owner. Không dùng fixture rehearsal để ký production.
5. R08/R20/R23/R24: design review/nghiên cứu người thật/UAT và QA đầy đủ còn mở. R28 cần 30 ngày thật sau release. Chưa task nào accepted trong phiên.

Tài liệu vận hành đã cập nhật: `CMS.md`, `STORAGE_BUNDLE_RUNBOOK.md`, `ANALYTICS_CONTRACT.md`. Trạng thái tuần tự ở `progress.json`. Phiên này hoàn tất gói kỹ thuật và vòng kiểm chứng nêu trên; toàn dự án chưa nghiệm thu phát hành.
