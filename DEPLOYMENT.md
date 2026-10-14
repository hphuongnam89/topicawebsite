# Hướng dẫn Triển khai & Vận hành Hệ thống Topica Edu

## 1. Môi trường Thực thi & Cấu hình Runtime

- **Runtime:** Node.js 22.x theo `package.json` (sử dụng `node:sqlite`). Lượt QA đêm 12/10 chạy trên v24.19.0; tương thích runtime 22.x vẫn cần kiểm riêng.
- **Framework:** Next.js (App Router) với React 19.
- **Cơ sở dữ liệu:** SQLite trong chế độ Write-Ahead Logging (`WAL`).
- **Thư mục lưu trữ bền vững (Persistent Volumes):**
  - `data/`: Chứa file cơ sở dữ liệu `topica.db`, `topica.db-wal`, `topica.db-shm` và thư mục `backups/`.
  - `public/uploads/`: Chứa các tài nguyên media, hình ảnh, tài liệu do ban biên tập tải lên.
- **Biến môi trường cần thiết:**
  - `TOPICA_DB_PATH`: Đường dẫn tuyệt đối tới file SQLite (mặc định: `<cwd>/data/topica.db`).
  - `TOPICA_DATA_DIR`: Thư mục dữ liệu gốc (mặc định: `<cwd>/data`).
  - `TOPICA_BACKUP_DIR`: Thư mục lưu bản sao lưu (mặc định: `<cwd>/data/backups`).
  - `ADMIN_SESSION_SECRET`: Khóa ký session quản trị, tối thiểu 32 ký tự ngẫu nhiên; production không dùng khóa mặc định. `SESSION_SECRET` là tên fallback tương thích; `ADMIN_JWT_SECRET` không được session hiện tại đọc.
  - `ADMIN_INITIAL_PASSWORD`: Chỉ cấp khi chủ động provision tài khoản admin qua migration 001; không có mật khẩu mặc định. Database đã migrate cần quy trình quản trị riêng để tạo/đổi tài khoản.
  - `NEXT_PUBLIC_SITE_URL`: URL chính thức của trang web.
  - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: tùy chọn; ưu tiên secret runtime cho thông báo lead thay vì giá trị legacy trong `site_settings`.
  - `LEAD_NOTIFICATION_CRON_SECRET`: secret ngẫu nhiên riêng, bắt buộc để scheduler gọi worker `POST /api/internal/lead-notifications` với `Authorization: Bearer <secret>`.

Trước khi phát hành code có outbox, sao lưu và áp dụng migration 005 theo runbook; không chạy migration khi chưa cô lập/backup DB đích. Sau đó cấu hình scheduler của hosting gọi worker định kỳ (ví dụ mỗi phút). Worker gửi tối đa 10 thông báo/lượt, retry theo exponential backoff, và chuyển bản ghi sang `failed` sau 12 lần. Việc gửi là at-least-once: nếu tiến trình dừng sau khi Telegram nhận tin nhưng trước khi DB đánh dấu `sent`, lần retry có thể gửi trùng. Theo dõi `claimed/sent/retried/failed` từ phản hồi; endpoint không cho phép gọi khi chưa đặt secret.

---

## 2. Triển khai Container với Docker

### Build Image

```bash
docker build -t topica-edu .
```

### Chạy Container với Volume Mount

```bash
docker run -d \
  --name topica-edu \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  -e NODE_ENV=production \
  -e ADMIN_SESSION_SECRET="$ADMIN_SESSION_SECRET" \
  topica-edu
```

---

## 3. Quy trình Sao lưu Cơ sở dữ liệu (Backup Runbook)

### Cơ chế kỹ thuật

Hệ thống sử dụng cơ chế `VACUUM INTO` tích hợp sẵn của SQLite (SQLite 3.27+). Đây là phương thức snapshot online nguyên tử (atomic), tự động kết hợp các trang chưa ghi trong WAL vào file snapshot độc lập mà không cần ngắt kết nối hay khóa ghi ứng dụng.

### Lệnh thực thi sao lưu

```bash
# 1. Sao lưu định kỳ tiêu chuẩn
npx tsx scripts/backup-db.ts

# 2. Sao lưu trước khi chạy Migration hoặc nâng cấp phiên bản (Bản được bảo vệ, không bao giờ bị xoay vòng xóa)
npx tsx scripts/backup-db.ts --pre-migration --label=v1_1_update
```

### Cấu trúc Bản sao lưu & Manifest

Mỗi lần sao lưu, hệ thống tạo ra 2 tệp:

1. `topica_backup_<timestamp>_<ms>_<id>.db`: Snapshot cơ sở dữ liệu hoàn chỉnh, độc lập.
2. `topica_backup_<timestamp>_<ms>_<id>.db.manifest.json`: Siêu dữ liệu kiểm chứng bao gồm:
   - `sha256`: Mã băm SHA-256 của file `.db` để chống giả mạo hoặc hỏng file.
   - `integrityCheck`: Kết quả kiểm tra toàn vẹn (`"ok"`).
   - `schemaVersion`: Migration version lớn nhất trong `schema_migrations`; fallback `user_version` cho DB không có ledger.
   - `tables`: Thống kê số lượng bản ghi của từng bảng dữ liệu tại thời điểm chụp.
   - `isPreMigration`: Cờ bảo vệ bản sao lưu quan trọng.

### Chính sách Xoay vòng & Lưu trữ (Retention Policy)

- **Giới hạn:** Mặc định giữ lại 10 bản sao lưu thường gần nhất trong thư mục `data/backups/`.
- **Nguyên tắc an toàn (Safe Rotation):** Bản sao lưu cũ **chỉ bị xoá** sau khi bản sao lưu mới nhất đã được ghi đĩa và vượt qua bài kiểm tra `PRAGMA integrity_check;` thành công.
- **Bảo vệ bản pre-migration:** Mọi bản sao lưu có gắn nhãn `--pre-migration` được giữ lại vĩnh viễn và không bao giờ bị xoay vòng tự động xóa.

---

## 4. Quy trình Phục hồi Cơ sở dữ liệu (Restore & Disaster Recovery)

### Nguyên tắc bảo vệ môi trường chạy (Active DB Protection)

Để ngăn ngừa tai nạn ghi đè nhầm dữ liệu đang hoạt động của người dùng (leads mới, bài viết mới), script phục hồi **mặc định khôi phục vào thư mục cô lập** (`data/restored/`), không chạm vào file `data/topica.db` đang chạy.

### Kiểm tra tính toàn vẹn trước phục hồi (Pre-restore Verification)

Trước khi ghi bất kỳ dữ liệu nào, script thực hiện kiểm tra 2 lớp:

1. Đối chiếu mã băm SHA-256 thực tế của file backup với file `manifest.json`. Nếu file bị biến dạng (corrupted) hoặc sửa đổi, tiến trình dừng ngay lập tức.
2. Chạy `PRAGMA integrity_check;` trong bộ nhớ/phiên đọc thử.

### Lệnh thực thi phục hồi

```bash
# 1. Kiểm tra tính toàn vẹn của bản sao lưu mới nhất (chỉ kiểm tra, không phục hồi)
npx tsx scripts/restore-db.ts --verify-only

# 2. Khôi phục bản sao lưu mới nhất vào thư mục cô lập để kiểm chứng dữ liệu
npx tsx scripts/restore-db.ts

# 3. Khôi phục một file cụ thể vào thư mục chỉ định
npx tsx scripts/restore-db.ts data/backups/topica_backup_2026-10-11T16-00-00_v1_0.db --target=data/restored/inspect.db

# Script từ chối mọi đích đã tồn tại và cờ --force-overwrite-active.
# Chuyển instance đã restore thành active là bước offline riêng do operator thực hiện.
```

---

## 5. Chỉ số RPO & RTO Đo lường Thực tế

- **RPO (Recovery Point Objective):**
  - Tần suất sao lưu khuyến nghị: Chạy cronjob mỗi ngày vào lúc 02:00 sáng và trước mỗi đợt deploy/migration.
  - Chưa có phép đo RPO trên deployment thật. Tần suất nêu trên là đề xuất, cần owner vận hành xác nhận.
- **RTO (Recovery Time Objective):**
  - Chưa đo thời gian restore trên deployment thật; không coi kết quả fixture nhỏ là SLA cho DB 1MB–100MB.
  - Cần rehearsal có kích thước DB/media, máy, thời điểm, thời gian restore/smoke và tác động dữ liệu.

---

## 6. Kịch bản Xử lý Sự cố (Incident Runbook)

1. **Phát hiện file backup bị hỏng (Checksum Mismatch / Integrity Failure):**
   - Hệ thống tự động báo lỗi và từ chối phục hồi.
   - Không xóa bất kỳ bản sao lưu cũ nào còn tốt.
   - Thao tác: Kiểm tra bản sao lưu kế tiếp gần nhất (`npx tsx scripts/restore-db.ts <previous_backup.db> --verify-only`).
2. **Khóa file Windows (File Lock / EPERM):**
   - Đảm bảo gọi `closeDb()` trên mọi kết nối SQLite trước khi copy hoặc checkpoint.
   - Sử dụng thư mục tạm độc lập trong môi trường test (`TOPICA_DB_PATH` và `TOPICA_BACKUP_DIR`).

## 7. Migration có kiểm soát và fixture QA

Restore yêu cầu manifest version1, SHA-256 đầy đủ, đúng tên/size/integrity và số
bản ghi; thiếu/sai JSON/metadata thì dừng trước tạo đích. Nguồn đọc readonly,
từ chối snapshot có WAL chưa được manifest kiểm chứng. Copy dùng exclusive-create,
kiểm lại SHA/integrity sau copy, không ghi đè active/existing DB hoặc sidecar.
Backup chỉ có DB; media bundle và rehearsal DB+media vẫn chưa hoàn tất.

Ứng dụng chỉ mở DB đã áp dụng đủ migration; đọc trang/API không tự tạo schema,
không tự seed hay tạo admin. Operator chạy `npm run db:migrate -- --status`,
`--dry-run`, rồi migration thật theo runbook trên staging trước khi triển khai.
`--status` chỉ đọc; `--dry-run` dùng transaction rollback, DB mới dùng memory.
Mỗi migration/rollback thật có backup đã kiểm chứng của chính DB connection;
backup lỗi thì dừng, không tiếp tục và không thay snapshot bằng copy main file.
`--skip-backup` chỉ hợp lệ với fixture trong `NODE_ENV=test`, thư mục `topica-*`
bên trong OS temp. Không dùng cờ này để triển khai.

Migration 003 giữ số/tên lịch sử nhưng không còn seed. Dữ liệu cũ đã seed từ
phiên bản trước được giữ nguyên để audit R03/R21; không coi đó là dữ liệu đã
duyệt, không tự xóa/đảo ngược các chỉnh sửa nghiệp vụ. `down` của 003 cũng không
xóa record. Môi trường mới nhận schema trống; nhập nội dung đã duyệt bằng luồng
CMS/import có kiểm soát. Admin đầu tiên chỉ được tạo khi operator cung cấp
`ADMIN_INITIAL_PASSWORD` trong migration 001; không còn mật khẩu mặc định.

Vitest tự tạo DB schema trống riêng cho mỗi test file, backup/uploads tạm và
stub notification. Test nghiệp vụ bổ sung fixture nội bộ tường minh, không copy
`data/topica.db`. Nếu sandbox Windows gặp EPERM ở cache temp, đặt `TEMP` và `TMP`
trong shell test vào thư mục scratch riêng trong workspace; giữ nguyên lỗi gốc
trong log, không tắt kiểm tra quyền. QA production build riêng đã chạy trên Node24,
browser baseline ba template có evidence; E2E journey/admin và Node22 chưa kiểm.
QA hiện copy source/config/public an toàn vào `scratch/qa-<runID>/workspace`, loại
env/DB/uploads/backups/helpers cũ, dùng dependency installation chung qua junction.
Next sinh helper trong copy; manifest ghi source fingerprint và so sánh root
helper/tsconfig/tsbuildinfo/BUILD_ID trước-sau. Child env chỉ giữ OS allowlist và
fixture config; token dịch vụ không được truyền. Không reuse dev server3000.
