# Backup và restore DB + uploads

`scripts/storage-bundle.ts` cung cấp `backupStorageBundle` và `restoreStorageBundle`. Thư viện đã kiểm thử fixture, chưa có lịch backup/diễn tập volume production. Không import vào request web.

Operator phải dừng ghi CMS/lead/upload, đóng process ghi và xác nhận đường dẫn DB/uploads/backup trước backup. `quiesced: true` là xác nhận operator, không tự bật maintenance. Backup đặt ngoài uploads/Git, quyền đọc giới hạn, mã hóa/lưu ngoài máy theo chính sách vận hành.

```ts
import { backupStorageBundle, restoreStorageBundle } from "./scripts/storage-bundle";
// Các biến đường dẫn do operator xác nhận; không chạy với DB thật từ QA.
const bundle = backupStorageBundle({
  dbFile: confirmedDbPath, uploadsDir: confirmedUploadsPath,
  backupDir: confirmedBackupPath, quiesced: true,
});
const restored = restoreStorageBundle(bundle.directory, newEmptyInstancePath, {
  dbFile: confirmedDbPath, uploadsDir: confirmedUploadsPath,
});
```

Backup snapshot SQLite nhất quán, kiểm integrity/checksum, inventory SHA-256 uploads trước/sau; từ chối symlink/junction/hardlink. Chỉ `bundle-*` có `bundle.json` hoàn tất mới restore. `.partial` là bản lỗi để điều tra, không tính backup tốt. Lỗi không rotation/xóa bundle tốt trước đó. Retention bundle chưa tự động; chỉ xóa bản cũ sau xác minh bản mới/restore theo chính sách được duyệt; giữ bản trước migration.

Restore xác minh manifest/path/checksum DB và media trước tạo target mới; từ chối target tồn tại hoặc đụng storage đang dùng. Kiểm `restore.json`, khởi động instance riêng, đọc nội dung/mở asset. Nếu lỗi giữa restore, giữ target để điều tra, chọn target mới, không coi target lỗi là thành công. Cutover/rollback cần bước riêng, giữ lead mới; không đè DB cũ lên dữ liệu đang chạy. Operator chỉ mở ghi khi kết thúc.

Evidence: `__tests__/operations/storage-bundle.test.ts`, `docs/evidence/completion-2026-10-12/01-form/storage-tests.log`: 4 ca DB+media, tamper, thay đổi media, path traversal. Disk-full/quota/permissions/volume production còn `not_run`. Chưa có RPO/RTO production đo hoặc cam kết.
