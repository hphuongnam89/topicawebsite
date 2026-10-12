# Handoff R01/R02 và remediation UI — 12/10/2026

- Status: implemented và kiểm chứng kỹ thuật trong phạm vi dưới đây; các task vẫn in_progress, không accepted.
- Owner: Codex; reviewer/UAT: chưa có. Giữ nguyên các thay đổi antigravity có từ trước.
- Source: HEAD f5a6b34709b6f4a88df0e2db10348f7f959ae8bc + dirty; source-manifest.json ghi từng file/hash. Diff toàn cây chứa cả thay đổi trước đêm này.
- Build cuối: QQdjcbczvweMrV56Nv5zU; snapshot afe7e3333ca2fdcb3fbf0a2c74242e072b41fd678854f7cb6a784364b1abe50a. Xem qa-final-manifest.json để đối chiếu chính xác file đã build.
- Runtime: Node24.19.0, Chromium151.0.7922.34. Node22 theo package chưa chạy.
- Dataset: DB trống migrate trong scratch/qa-overnight-final-ui; lượt kiểm tra form thêm đúng một lead giả QA FIXTURE ONLY. Không dùng người tham gia nghiên cứu/dữ liệu thật. Notification stub, port3107, uploads/backups/output riêng.
- Nguồn nội dung chính thức/reviewer: chưa đủ. CONTENT_REGISTER.csv có192field static needs_source,0confirmed; chưa phải toàn bộ inventory.

## Hành vi cuối cùng

Restore từ manifest thiếu/sai hoặc SHA không khớp dừng trước ghi đích. Source được kiểm tra SQLite readonly; đích phải mới, không active/existing, copy độc quyền và kiểm tra lại sau copy. --force overwrite bị từ chối; quy trình vận hành cũ dùng force cần chuyển sang đích mới và handoff maintenance riêng. Restore DB+media, rehearsal downtime/RPO/RTO chưa hoàn thành.

QA build chạy trong bản sao source allowlist không chứa env/DB/uploads thật; dependency junction dùng lại node_modules. Environment allowlist loại service credentials và NODE_OPTIONS. Root next-env/config/build-helper hashes không đổi ở build cuối. Lỗi wrapper khi chạy typecheck đồng thời được giữ trong log; build lại tuần tự đạt. Root next-env từ lượt01 vẫn là generated helper; không giả khôi phục bản trước khi chưa có baseline.

UI sửa giới hạn: Tailwind merge nhận diện typography custom để giữ đúng màu chữ CTA; tăng contrast ink/success/badge, CTA hero wrap, header hit targets, dl semantics, sticky program label wrap320px. Chưa triển khai concept/prototype hay sửa toàn bộ form theo spec.

## Kiểm tra và evidence

| Command/case | Kết quả | Evidence |
| --- | --- | --- |
| npm run test (vitest run --maxWorkers=2) | exit0;27files,191pass,1skip/not_run hardlink Windows EPERM | full-tests-final-2.log |
| npm run typecheck | exit0, trước patch sticky chỉ CSS/class | typecheck-final-2.log |
| npm run lint | exit0 sau patch cuối | lint-final-2.log |
| QA build overnight-final-ui | build exit0, protectedUnchanged=true | qa-server-final-ui.log; qa-final-manifest.json |
| capture-baseline.ts, batch08-final-ui | exit0;9 axe scans không violation;18screenshots | ../08-final-ui/results.json |
| browser-states.ts | exit0;menu focus/Escape, lỗi trống,503 giữ input, API save thật vào fixture, sticky bounds | ../11-browser-states/results.json |
| git diff --check | exit0 | diff-check.log |

Snapshot trước UI: ../05-before-ui. Sau UI: ../08-final-ui, cùng routes T01 /, T03 /cong-nghe-thong-tin/, T05 /tuyen-sinh/hoc-phi-hoc-bong/, widths1440/390/320. Fonts loaded, không ảnh lỗi và scrollWidth bằng viewport trong mẫu. Zero axe violations chỉ nói về mẫu tự động, không chứng nhận WCAG toàn site.

Đã xem cả9 top screenshots T01/T03/T05 ×1440/390/320; menu và full-page lỗi/thành công form có ảnh nhưng full-page dài không đủ để review từng chi tiết. Sticky320 đã xem trực quan và xác nhận bounds bằng browser. Không claim full-page/full-site manual review.

Giữ nguyên lần lỗi: hardlink EPERM; typecheck environment type; Vitest vô tình discover tests của dependency qua scratch junction (đã giới hạn all project test paths, không bỏ test dự án); concurrent root typecheck bị guard chặn; browser trước server ready; axe thiếu explicit context; alert locator trùng Next announcer. Các lần sửa selector/context không đổi assertion. Xem manifest.json và logs, không xóa lỗi cũ.

## Còn thiếu và bước tiếp theo

1. R02: bundle DB+media, restore rehearsal tại môi trường được duyệt, disk faults và đo RPO/RTO; hardlink Windows chạy khi có điều kiện cho phép.
2. R03/R04/R05: đầu mối Phú Xuân/Topica cung cấp nguồn, thời gian hiệu lực, quyền ảnh/contact/học phí/đợt tuyển sinh; inventory CMS/tài liệu/hình còn thiếu.
3. R08/R15: prototype/research người thật; email/trình độ optional thống nhất client/server, lựa chọn chưa chọn ngành; xác minh lời hứa phản hồi24h. Form hiện tại vẫn chưa đạt spec này.
4. R16–R21: workflow/quyền/preview/lịch revision/public consumers và integration còn cần audit; chưa triển khai thêm trong lượt02.
5. R22–R28: Node22, staging, đa browser/keyboard thật, Lighthouse thực, analytics không PII, reviewer/UAT/release gate và dữ liệu30ngày. Không production deploy.

Server QA3107 do lượt này tạo đã dừng chủ động06:53. Không chạm server3000. Build/fixture được giữ tại scratch để điều tra; bản chứng cứ bền vững nằm trong docs/evidence.

Đối chiếu cuối06:56: cả209source files trong build manifest khớp hash working source; progress JSON đọc hợp lệ, các evidence paths được liệt kê đều tồn tại. Xem final-consistency.json; file tồn tại không tự chứng minh gate đạt.

