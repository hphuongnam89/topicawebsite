import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { assertFixturePath, canonicalPath } from "@/lib/db/safety";
import type { BackupManifest } from "./backup-db";

export interface RestoreOptions {
  activeDbPath?: string;
  targetPath?: string;
  targetDir?: string;
  verifyOnly?: boolean;
  /** @deprecated Active/existing databases cannot be overwritten by this tool. */
  allowActiveOverwrite?: boolean;
}
export interface RestoreResult {
  sourceBackupFile: string;
  targetDbPath: string;
  sha256Verified: boolean;
  integrityVerified: boolean;
  tableCounts: Record<string, number>;
  restoredAt: string;
  isIsolatedInstance: boolean;
}
function sha256(file: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function inspectSnapshot(file: string): Record<string, number> {
  if (fs.existsSync(`${file}-wal`) && fs.statSync(`${file}-wal`).size > 0) {
    throw new Error("Bản sao lưu có WAL ngoài manifest; cần snapshot độc lập.");
  }
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const checks = db.prepare("PRAGMA integrity_check").all() as { integrity_check: string }[];
    if (checks.length !== 1 || checks[0].integrity_check !== "ok")
      throw new Error("File bản sao lưu bị lỗi cấu trúc.");
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all() as { name: string }[];
    return Object.fromEntries(
      tables.map(({ name }) => {
        const row = db
          .prepare(`SELECT count(*) AS count FROM "${name.replace(/"/g, '""')}"`)
          .get() as { count: number };
        return [name, Number(row.count)];
      }),
    );
  } finally {
    db.close();
  }
}
export function restoreDatabase(
  backupFilePath?: string,
  options: RestoreOptions = {},
): RestoreResult {
  const dataDir = process.env.TOPICA_DATA_DIR || path.join(process.cwd(), "data");
  const activeDbPath =
    options.activeDbPath || process.env.TOPICA_DB_PATH || path.join(dataDir, "topica.db");
  const backupDir = process.env.TOPICA_BACKUP_DIR || path.join(dataDir, "backups");
  if (options.allowActiveOverwrite)
    throw new Error(
      "Từ chối ghi đè active DB; restore vào instance riêng và chuyển đổi offline theo runbook.",
    );
  let source = backupFilePath;
  if (!source) {
    if (process.env.NODE_ENV === "test") assertFixturePath(path.join(backupDir, "snapshot.db"));
    const backups = fs
      .readdirSync(backupDir)
      .filter((file) => /^topica_backup_.*\.db$/.test(file))
      .map((file) => path.join(backupDir, file))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    if (!backups.length) throw new Error("Không tìm thấy bản sao lưu.");
    source = backups[0];
  }
  if (process.env.NODE_ENV === "test") assertFixturePath(source);
  const sourcePath = canonicalPath(source);
  if (sourcePath === canonicalPath(activeDbPath))
    throw new Error("Không dùng DB đang chạy làm snapshot restore.");
  const stat = fs.statSync(sourcePath);
  if (!stat.isFile() || stat.size === 0)
    throw new Error("File bản sao lưu rỗng hoặc không hợp lệ.");
  let manifest: BackupManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(`${sourcePath}.manifest.json`, "utf8"));
  } catch (error) {
    throw new Error("Manifest backup thiếu/không đọc được/JSON lỗi; từ chối restore.", {
      cause: error,
    });
  }
  if (
    !manifest ||
    manifest.manifestVersion !== 1 ||
    typeof manifest.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/i.test(manifest.sha256)
  )
    throw new Error("Manifest backup không hợp lệ: cần version1 và SHA-256 đầy đủ.");
  const expectedHash = manifest.sha256.toLowerCase();
  if (sha256(sourcePath) !== expectedHash)
    throw new Error("Checksum SHA-256 không khớp; từ chối restore.");
  if (
    manifest.sizeBytes !== stat.size ||
    manifest.backupFile !== path.basename(sourcePath) ||
    manifest.integrityCheck !== "ok"
  )
    throw new Error("Manifest backup không khớp file/size/integrity.");
  const tableCounts = inspectSnapshot(sourcePath);
  if (
    !manifest.tables ||
    JSON.stringify(Object.entries(manifest.tables).sort()) !==
      JSON.stringify(Object.entries(tableCounts).sort())
  )
    throw new Error("Manifest backup không khớp số bản ghi.");
  if (options.verifyOnly)
    return {
      sourceBackupFile: sourcePath,
      targetDbPath: sourcePath,
      sha256Verified: true,
      integrityVerified: true,
      tableCounts,
      restoredAt: new Date().toISOString(),
      isIsolatedInstance: true,
    };
  const target =
    options.targetPath ||
    path.join(
      options.targetDir || path.join(dataDir, "restored"),
      `topica_restored_${Date.now()}_${crypto.randomUUID()}.db`,
    );
  if (process.env.NODE_ENV === "test") assertFixturePath(target);
  const targetPath = canonicalPath(target);
  if (targetPath === canonicalPath(activeDbPath))
    throw new Error("Từ chối thao tác: Thao tác restore sẽ ghi đè lên Cơ sở dữ liệu đang chạy.");
  if (
    targetPath === sourcePath ||
    fs.existsSync(targetPath) ||
    fs.existsSync(`${targetPath}-wal`) ||
    fs.existsSync(`${targetPath}-shm`)
  )
    throw new Error("Đích restore/sidecar đã tồn tại; từ chối ghi đè.");
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath, fs.constants.COPYFILE_EXCL);
  try {
    if (sha256(targetPath) !== expectedHash) throw new Error("Checksum thay đổi khi copy restore.");
    if (JSON.stringify(inspectSnapshot(targetPath)) !== JSON.stringify(tableCounts))
      throw new Error("Dữ liệu restored không khớp snapshot.");
  } catch (error) {
    fs.unlinkSync(targetPath);
    throw error;
  }
  return {
    sourceBackupFile: sourcePath,
    targetDbPath: targetPath,
    sha256Verified: true,
    integrityVerified: true,
    tableCounts,
    restoredAt: new Date().toISOString(),
    isIsolatedInstance: true,
  };
}
if (process.argv[1]?.includes("restore-db")) {
  try {
    restoreDatabase(
      process.argv.slice(2).find((arg) => !arg.startsWith("-") && arg.endsWith(".db")),
      {
        verifyOnly: process.argv.includes("--verify-only"),
        allowActiveOverwrite: process.argv.includes("--force-overwrite-active"),
        targetPath: process.argv
          .find((arg) => arg.startsWith("--target="))
          ?.slice("--target=".length),
      },
    );
  } catch (error) {
    console.error("Lỗi phục hồi cơ sở dữ liệu:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
