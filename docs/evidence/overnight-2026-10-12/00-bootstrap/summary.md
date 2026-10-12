# Bootstrap vòng lặp qua đêm

Owner: Codex trong chat hiện tại. Trạng thái: cơ chế đã thiết lập; R00 từng phần.
Nguồn: dirty snapshot trong `manifest.json`, không phải release đã build.

Đã tạo runbook, checkpoint và heartbeat có hạn cuối. Công cụ automation trả về
thành công; TOML lưu `ACTIVE`, đúng chat và thời hạn 07:00 ngày 12/10/2026 UTC+7.
Không chạy ứng dụng, mở DB, thực hiện migration hay gửi notification trong bước này.

Findings cần lượt kế tiếp xử lý:

| ID     | Mức | Quan sát                                                         | Task / hành động                                                          |
| ------ | --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| ON-001 | P1  | `lib/db/index.ts` gọi migration với `skipBackup: true` khi mở DB | R01/R02/R16: rà toàn caller, backup failure và seed trên fixture          |
| ON-002 | P1  | Playwright dùng port 3000 và reuse server                        | R01/R22: cô lập DB/storage/notification/build/port trước browser mutation |
| ON-003 | P2  | Node v24.19.0; package engines 22.x                              | R00/R25: xác định runtime phù hợp, lưu giới hạn kiểm chứng                |
| ON-004 | P2  | Progress có verified nhưng dependency/evidence còn thiếu         | R00/R29: rà claim theo audit; không tự nâng accepted                      |

Người xử lý tiếp: agent trong heartbeat này, trước mốc kết thúc. Chưa có reviewer
độc lập hoặc sign-off nghiệp vụ; không đổi mức/gate từ bảng này thành đã đạt.

Kiểm tra bootstrap: đọc kế hoạch/source/runtime/Git thành công; manifest JSON được
tạo. Production build, unit/integration, E2E, screenshot, Lighthouse, UAT: `not_run`.
R00 còn cần inventory rendered URLs, browser/version, T01/T03/T05 desktop/mobile
và đối chiếu claim báo cáo phase. Không có UI/app code đổi ở bootstrap.

Tiếp theo: đọc R00/R01/R02 và audit, ghi ownership/phạm vi, kiểm source isolation,
đọc Next docs liên quan rồi xử lý ON-001/ON-002 bằng gói nhỏ có evidence.
