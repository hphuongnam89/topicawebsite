# Vòng lặp hoàn thiện Topica qua đêm

Ngày bắt đầu: 12/10/2026, giờ Việt Nam (`Asia/Bangkok`, UTC+7).
Mốc kết thúc đã được người dùng xác nhận: **07:00 ngày 12/10/2026** (UTC+7).
Nếu người dùng chọn mốc khác trong chat, cập nhật mốc này và lịch automation trước lượt tiếp theo.

## Mục tiêu và nguồn kế hoạch

Tiếp tục dự án hiện hữu theo `README.md`, `IMPLEMENTATION_BACKLOG.md`,
`DESIGN_UX_SPEC.md`, `ACCEPTANCE_AND_EVIDENCE.md`, `AGENT_HANDOFF.md`
và `docs/kiem-tra-tien-do-2026-10-12.md`. `progress.json` là sổ task;
trạng thái có sẵn là claim cần kiểm chứng, không phải quyền bỏ dependency/gate.

Mục tiêu qua đêm là hoàn thiện tối đa phần kỹ thuật có thể kiểm chứng và
bàn giao chính xác vào buổi sáng. Không cam kết toàn bộ R00–R29 được nghiệm thu
trong một đêm: dữ liệu chính thức, nghiên cứu người thật, UAT, quyết định release
và 30 ngày quan sát vẫn cần bằng chứng thực tế.

## Cơ chế chạy

Heartbeat gắn với chat hiện tại đánh thức agent mỗi giờ. Lượt khởi động được
thực hiện ngay trong phiên thiết lập. Mỗi lần thức dậy, làm liên tiếp các vòng
nhỏ trong khoảng 40 phút, chừa thời gian kiểm tra và ghi checkpoint. Không chờ
hết giờ nếu đã hoàn tất một gói và có thể bắt đầu gói độc lập kế tiếp.
Không mở thêm chat hoặc worker theo tài liệu phối hợp cũ nếu chưa có yêu cầu.

Scheduler cần ứng dụng/máy hoạt động, kết nối và hạn mức đủ; thiết lập lịch
không chứng minh lượt tương lai đã chạy. `OVERNIGHT_LOG.md` ghi kết quả thật.

## Vòng lặp bắt buộc

1. Đọc yêu cầu mới nhất, runbook/log này, `AGENTS.md`, progress và task liên quan.
   Kiểm tra giờ Việt Nam trước mutation. Đến mốc kết thúc thì chỉ chốt báo cáo,
   lưu checkpoint, dừng automation; không mở gói mới.
2. Kiểm tra Git status, source, dependency/evidence và process có thể dùng chung
   file. Giữ nguyên thay đổi chưa hiểu; nếu có agent khác đang sửa cùng phạm vi,
   chọn phần độc lập. Không reset/stash/ghi đè, không tự commit tất cả thay đổi.
3. Chọn một đầu ra nhỏ, ưu tiên P0/P1 và nút thắt dependency. Ghi task/phạm vi,
   hành vi mong đợi, phiên bản đầu vào và kiểm tra dự kiến trước khi sửa.
4. Đọc guide Next trong `node_modules/next/dist/docs/` tương ứng trước code.
   Triển khai patch có thể review; không đổi framework hay mở thêm sản phẩm.
5. Chạy kiểm tra đúng tác động. Trước integration/E2E/migration/build, chứng minh
   DB/uploads/backups/notification/build/port cô lập. Không chạy `verify` mù khi
   build còn dùng dữ liệu hoặc output của dev. Chỉ dùng fixture nội bộ không PII.
6. Nếu fail, lưu lỗi gốc, sửa và retest. Không hạ assertion/bỏ test/đổi threshold
   để xanh. Sau hai lần cùng lỗi mà không có giả thuyết mới, ghi blocker và chuyển
   sang phần độc lập; lượt sau chỉ thử lại khi có thông tin/điều kiện mới.
7. Review diff; UI phải được xem thật ở desktop/mobile và các state liên quan.
   Ghi screenshot/trace/log theo khả năng; thiếu browser/thiết bị ghi `not_run`.
8. Lưu evidence vào `docs/evidence/overnight-2026-10-12/<batch>/` và handoff theo
   mẫu chuẩn. Cập nhật progress tuần tự trong phạm vi đã làm, có command/exit code,
   dirty snapshot/build, findings và next action. Không nâng `accepted` nếu thiếu
   dependency, reviewer hoặc xác nhận nghiệp vụ tương ứng. Lặp bước 2–8.

## Hàng đợi ưu tiên

| Thứ tự | Gói                              | Đầu ra trước khi chuyển tiếp                                                                                            |
| ------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1      | R00, rà R01/R02                  | Baseline dirty snapshot, runtime, nguồn dữ liệu, test/build isolation; xác minh backup trên fixture                     |
| 2      | Findings P1 của R16/R02 và R03   | Migration không bỏ qua backup bắt buộc; không tự seed/publish nội dung chưa duyệt; sổ mâu thuẫn/nguồn/đầu vào còn thiếu |
| 3      | R08 → R11/R15                    | Prototype và trang chủ/form theo spec; email/trình độ tùy chọn thống nhất client/server; review T01/T03/T05             |
| 4      | R16 → R17 → R18 → R19            | Workflow/quyền/preview và lịch hiệu lực có test; CMS nghiệp vụ; public đọc revision đúng                                |
| 5      | R21 và R27                       | Tích hợp consumer/route, không hồi sinh draft qua fallback; events không PII và đúng nghĩa                              |
| 6      | R22, milestone staging R25, R23  | Runner thật, server/build cô lập, browser/axe/Lighthouse nếu môi trường cho phép; sửa findings và kiểm lại              |
| 7      | R24/R26/R29 trong phạm vi có thể | RC, handbook, evidence index, gate matrix và báo cáo sáng; mọi UAT/release chưa xác nhận để mở                          |

Đây là thứ tự ưu tiên, không phải cho phép vượt dependency. R03 thiếu dữ liệu
chính thức thì chuẩn bị register/contract bằng fixture, ghi blocker cho việc
công bố/nghiệm thu; tiếp tục kỹ thuật độc lập theo README. Chuẩn bị kịch bản
R20, nhưng không tạo người tham gia. R28 luôn cần 30 ngày thật sau release.

## Giới hạn vận hành

- Không sửa/xóa/seed/restore DB, uploads hoặc backup thật; không đọc/in secret,
  lead hay `.env` vào evidence. Không gửi Telegram/webhook/email thử ra ngoài.
- Không tự xác nhận học phí, bằng cấp, kỳ tuyển sinh, ảnh/chứng thực hoặc UAT.
- Không tự deploy production, push/merge/publish khi gate và quyền tương ứng chưa đủ.
  Chuẩn bị staging fixture, RC và runbook có thể review.
- Không dừng server người dùng hoặc build vào `.next` đang dùng. Runtime quan sát
  lúc thiết lập là Node v24.19.0, còn `package.json` yêu cầu 22.x: ghi chênh lệch,
  kiểm tương thích/runtime phù hợp; không tự đổi engines để che vấn đề.
- Không thông báo mỗi lượt nếu không có thay đổi đáng kể. Báo khi có kết quả quan
  trọng, lỗi nghiêm trọng, cần đầu vào hoặc khi kết thúc; log vẫn cập nhật mỗi lượt.

## Chốt buổi sáng

Ở lượt sát mốc kết thúc, ưu tiên đóng gói patch đang làm và retest phần đã sửa;
không mở migration/refactor lớn. Lượt tại/sau mốc kết thúc tạo
`docs/bao-cao-sang-2026-10-12.md` gồm: đã triển khai, đã kiểm chứng, command/exit code
và evidence, gate còn mở, blocker cần người thật, thay đổi chưa commit, next task.
Không ghi hoàn thành/production-ready chỉ vì hết thời gian.

Đặt trạng thái automation thành `PAUSED` qua công cụ automation chính thức,
giữ nguyên các trường khác; ID được ghi ở log sau khi tạo thành công. Nếu việc
dừng scheduler thất bại, ghi lỗi và thông báo; các lượt đến sau deadline vẫn
phải thoát mà không sửa dự án. Nếu hoàn thành hết phần được phép sớm, chốt báo
cáo và dừng sớm. Không duy trì vòng lặp vô hạn khi chỉ còn blocker bên ngoài.

