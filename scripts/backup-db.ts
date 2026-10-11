import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "topica.db");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

export function backupDatabase(): string {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`File cơ sở dữ liệu không tồn tại: ${DB_FILE}`);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupFileName = `topica_backup_${timestamp}.db`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  fs.copyFileSync(DB_FILE, backupFilePath);
  console.log(`✓ Đã tạo bản sao lưu thành công tại: ${backupFilePath}`);

  // Dọn dẹp bản sao lưu cũ, chỉ giữ lại 10 bản gần nhất
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("topica_backup_") && f.endsWith(".db"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 10) {
    const toDelete = files.slice(10);
    for (const f of toDelete) {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      console.log(`- Đã xóa bản sao lưu cũ: ${f.name}`);
    }
  }

  return backupFilePath;
}

// Chạy trực tiếp nếu script được gọi qua CLI
if (process.argv[1]?.includes("backup-db")) {
  try {
    backupDatabase();
  } catch (err: any) {
    console.error("Lỗi sao lưu cơ sở dữ liệu:", err.message);
    process.exit(1);
  }
}
