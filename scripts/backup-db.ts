import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { assertFixturePath } from "@/lib/db/safety";

export interface BackupOptions {
  targetDbFile?: string;
  targetBackupDir?: string;
  retentionCount?: number;
  label?: string;
  isPreMigration?: boolean;
}

export interface BackupManifest {
  manifestVersion: number;
  backupFile: string;
  backupPath: string;
  timestamp: string;
  sha256: string;
  sizeBytes: number;
  nodeVersion: string;
  schemaVersion: number;
  integrityCheck: string;
  tables: Record<string, number>;
  label?: string;
  isPreMigration: boolean;
}

export interface BackupResult {
  backupFilePath: string;
  manifestFilePath: string;
  manifest: BackupManifest;
}

function computeFileSha256(filePath: string): string {
  const hash = crypto.createHash("sha256");
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest("hex");
}

export function backupDatabase(
  targetDbFileOrOptions?: string | BackupOptions,
  optionalBackupDir?: string,
): BackupResult {
  let options: BackupOptions = {};

  if (typeof targetDbFileOrOptions === "string") {
    options.targetDbFile = targetDbFileOrOptions;
    if (optionalBackupDir) {
      options.targetBackupDir = optionalBackupDir;
    }
  } else if (targetDbFileOrOptions && typeof targetDbFileOrOptions === "object") {
    options = { ...targetDbFileOrOptions };
  }

  const dbFile =
    options.targetDbFile ||
    process.env.TOPICA_DB_PATH ||
    path.join(process.cwd(), "data", "topica.db");

  const backupDir =
    options.targetBackupDir ||
    process.env.TOPICA_BACKUP_DIR ||
    path.join(path.dirname(dbFile), "backups");

  const retentionCount = options.retentionCount ?? 10;
  const isPreMigration = options.isPreMigration ?? false;
  const label = options.label || (isPreMigration ? "pre_migration" : undefined);

  if (process.env.NODE_ENV === "test") {
    assertFixturePath(dbFile);
    assertFixturePath(path.join(backupDir, "snapshot.db"));
  }
  if (!Number.isInteger(retentionCount) || retentionCount < 1) {
    throw new Error("retentionCount phải là số nguyên dương.");
  }
  if (label && !/^[a-zA-Z0-9_-]+$/.test(label)) {
    throw new Error("Backup label chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới.");
  }

  if (!fs.existsSync(dbFile)) {
    throw new Error(`File cơ sở dữ liệu không tồn tại: ${dbFile}`);
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  const rand = Math.random().toString(36).substring(2, 6);
  const labelSuffix = label ? `_${label}` : "";
  const backupFileName = `topica_backup_${timestamp}_${ms}_${rand}${labelSuffix}.db`;
  const backupFilePath = path.join(backupDir, backupFileName);
  const manifestFilePath = path.join(backupDir, `${backupFileName}.manifest.json`);

  // Never overwrite an existing snapshot, including an unlikely name collision.
  if (fs.existsSync(backupFilePath)) {
    throw new Error("Snapshot đích đã tồn tại; từ chối ghi đè.");
  }

  // Phương thức 1: VACUUM INTO (Online consistent snapshot hỗ trợ SQLite 3.27+)
  let sourceDb: DatabaseSync | null = null;

  try {
    sourceDb = new DatabaseSync(dbFile, { readOnly: true });
    const normalizedDestPath = backupFilePath.replace(/\\/g, "/").replace(/'/g, "''");
    sourceDb.exec(`VACUUM INTO '${normalizedDestPath}';`);
  } catch (error) {
    if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
    throw new Error("Không tạo được snapshot SQLite nhất quán; không dùng file-copy fallback.", {
      cause: error,
    });
  } finally {
    if (sourceDb) {
      try {
        sourceDb.close();
      } catch {
        // Safe close
      }
    }
  }

  // Bước 2: Kiểm chứng tính toàn vẹn (Integrity Check) ngay trên file vừa sao lưu
  let verifyDb: DatabaseSync | null = null;
  let integrityStatus = "unknown";
  let schemaVersion = 0;
  const tables: Record<string, number> = {};

  try {
    verifyDb = new DatabaseSync(backupFilePath);
    const integrityRows = verifyDb.prepare("PRAGMA integrity_check;").all() as any[];
    integrityStatus =
      integrityRows.length > 0 && integrityRows[0].integrity_check === "ok" ? "ok" : "failed";

    if (integrityStatus !== "ok") {
      throw new Error(`Kiểm tra toàn vẹn bản sao lưu thất bại: ${JSON.stringify(integrityRows)}`);
    }

    const versionRows = verifyDb.prepare("PRAGMA user_version;").all() as any[];
    schemaVersion = versionRows.length > 0 ? Number(versionRows[0].user_version || 0) : 0;
    if (verifyDb.prepare("SELECT name FROM sqlite_master WHERE name = 'schema_migrations'").get()) {
      const latest = verifyDb
        .prepare("SELECT MAX(version) AS version FROM schema_migrations")
        .get() as { version: number | null };
      schemaVersion = latest.version ?? 0;
    }

    // Đếm số lượng bản ghi các bảng cốt lõi
    const tableListRows = verifyDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
      .all() as any[];

    for (const t of tableListRows) {
      const tableName = t.name;
      try {
        const countRow = verifyDb
          .prepare(`SELECT count(*) as count FROM "${tableName.replace(/"/g, '""')}";`)
          .get() as any;
        tables[tableName] = countRow ? Number(countRow.count) : 0;
      } catch {
        tables[tableName] = -1;
      }
    }
  } finally {
    if (verifyDb) {
      try {
        verifyDb.close();
      } catch {
        // Safe close
      }
    }
  }

  // Bước 3: Tạo SHA-256 Checksum và lưu Manifest
  const sha256 = computeFileSha256(backupFilePath);
  const stat = fs.statSync(backupFilePath);

  const manifest: BackupManifest = {
    manifestVersion: 1,
    backupFile: backupFileName,
    backupPath: backupFilePath,
    timestamp: now.toISOString(),
    sha256,
    sizeBytes: stat.size,
    nodeVersion: process.version,
    schemaVersion,
    integrityCheck: integrityStatus,
    tables,
    label,
    isPreMigration,
  };

  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`✓ Đã tạo bản sao lưu thành công tại: ${backupFilePath}`);
  console.log(`✓ Manifest kiểm chứng: ${manifestFilePath} (SHA-256: ${sha256.slice(0, 12)}...)`);

  // Bước 4: Safe Rotation - CHỈ thực hiện sau khi bản mới ĐÃ KIỂM CHỨNG THÀNH CÔNG
  // Giữ lại các bản có gắn nhãn pre_migration hoặc trong hạn mức retentionCount
  try {
    const backupFiles = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith("topica_backup_") && f.endsWith(".db"))
      .map((f) => {
        const fullPath = path.join(backupDir, f);
        const manifestPath = `${fullPath}.manifest.json`;
        let isProtected = false;
        if (fs.existsSync(manifestPath)) {
          try {
            const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            if (m.isPreMigration || m.label === "pre_migration") {
              isProtected = true;
            }
          } catch {
            // Safe parse ignore
          }
        }
        return {
          name: f,
          path: fullPath,
          manifestPath,
          time: fs.statSync(fullPath).mtime.getTime(),
          isProtected,
        };
      })
      .sort((a, b) => b.time - a.time);

    // Lọc ra các bản có thể dọn dẹp (không phải pre_migration)
    const rotatableFiles = backupFiles.filter((b) => !b.isProtected);

    if (rotatableFiles.length > retentionCount) {
      const toDelete = rotatableFiles.slice(retentionCount);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
        if (fs.existsSync(item.manifestPath)) {
          fs.unlinkSync(item.manifestPath);
        }
        console.log(`- Đã xoay vòng dọn dẹp bản sao lưu cũ: ${item.name}`);
      }
    }
  } catch (rotationErr: any) {
    console.warn(`[backup-db] Cảnh báo xoay vòng dọn dẹp: ${rotationErr.message}`);
  }

  return {
    backupFilePath,
    manifestFilePath,
    manifest,
  };
}

// Chạy trực tiếp nếu script được gọi qua CLI
if (process.argv[1]?.includes("backup-db")) {
  try {
    const isPreMigration = process.argv.includes("--pre-migration");
    const labelArg = process.argv.find((a) => a.startsWith("--label="));
    const label = labelArg ? labelArg.split("=")[1] : undefined;

    backupDatabase({ isPreMigration, label });
  } catch (err: any) {
    console.error("Lỗi sao lưu cơ sở dữ liệu:", err.message);
    process.exit(1);
  }
}
