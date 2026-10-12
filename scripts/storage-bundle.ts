import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { backupDatabase } from "./backup-db";
import { restoreDatabase } from "./restore-db";
import { assertFixturePath, canonicalPath } from "@/lib/db/safety";

type MediaEntry = { path: string; bytes: number; sha256: string };
interface BundleManifest {
  version: 1;
  createdAt: string;
  database: string;
  media: MediaEntry[];
  quiesced: true;
}
function digest(file: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function within(root: string, file: string) {
  const relative = path.relative(canonicalPath(root), canonicalPath(file));
  return (
    relative !== "" &&
    !relative.startsWith(".." + path.sep) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}
function safeChild(root: string, relative: string) {
  if (
    !relative ||
    relative.includes("\\") ||
    relative.split("/").some((part) => !part || part === "." || part === "..") ||
    path.isAbsolute(relative)
  )
    throw new Error("Bundle path không hợp lệ");
  const target = path.join(root, ...relative.split("/"));
  if (!within(root, target)) throw new Error("Bundle path vượt thư mục cho phép");
  return target;
}
function inventory(root: string): MediaEntry[] {
  if (
    !fs.existsSync(root) ||
    !fs.lstatSync(root).isDirectory() ||
    fs.lstatSync(root).isSymbolicLink()
  )
    throw new Error("Uploads phải là thư mục thường có thật");
  const files: MediaEntry[] = [];
  function visit(directory: string) {
    for (const name of fs.readdirSync(directory).sort()) {
      const file = path.join(directory, name),
        stat = fs.lstatSync(file);
      if (stat.isSymbolicLink() || !within(root, file))
        throw new Error("Uploads không được chứa symlink/junction");
      if (stat.isDirectory()) visit(file);
      else if (stat.isFile() && stat.nlink === 1)
        files.push({
          path: path.relative(root, file).split(path.sep).join("/"),
          bytes: stat.size,
          sha256: digest(file),
        });
      else throw new Error("Uploads chỉ được chứa file thường, không hardlink");
    }
  }
  visit(root);
  return files;
}
function fixture(...files: string[]) {
  if (process.env.NODE_ENV === "test") for (const file of files) assertFixturePath(file);
}

/** Operator must stop content/media writes first; a changing inventory fails closed. */
export function backupStorageBundle(options: {
  dbFile: string;
  uploadsDir: string;
  backupDir: string;
  quiesced: boolean;
}) {
  if (options.quiesced !== true) throw new Error("Dừng ghi nội dung/uploads trước khi tạo bundle");
  fixture(
    options.dbFile,
    path.join(options.uploadsDir, "guard"),
    path.join(options.backupDir, "guard"),
  );
  if (
    within(options.uploadsDir, options.backupDir) ||
    canonicalPath(options.uploadsDir) === canonicalPath(options.backupDir)
  )
    throw new Error("Backup không được nằm trong uploads");
  const before = inventory(options.uploadsDir);
  fs.mkdirSync(options.backupDir, { recursive: true });
  const staging = path.join(
    options.backupDir,
    `bundle-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.partial`,
  );
  if (!within(options.backupDir, staging)) throw new Error("Invalid staging root");
  fs.mkdirSync(staging);
  const database = backupDatabase({
    targetDbFile: options.dbFile,
    targetBackupDir: path.join(staging, "db"),
    retentionCount: 1,
    label: "bundle",
  });
  const mediaRoot = path.join(staging, "media");
  fs.mkdirSync(mediaRoot);
  for (const file of before) {
    const source = safeChild(options.uploadsDir, file.path),
      target = safeChild(mediaRoot, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    if (fs.statSync(target).size !== file.bytes || digest(target) !== file.sha256)
      throw new Error("Media thay đổi trong khi sao lưu; giữ partial để điều tra");
  }
  if (JSON.stringify(before) !== JSON.stringify(inventory(options.uploadsDir)))
    throw new Error("Uploads đã thay đổi; bundle chưa được xác nhận");
  const manifest: BundleManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    database: path.relative(staging, database.backupFilePath).split(path.sep).join("/"),
    media: before,
    quiesced: true,
  };
  fs.writeFileSync(path.join(staging, "bundle.json"), JSON.stringify(manifest, null, 2), {
    flag: "wx",
  });
  const target = staging.slice(0, -".partial".length);
  fs.renameSync(staging, target);
  return { directory: target, manifest };
}

/** Restore creates a new directory, never overwrites a running DB or media tree. */
export function restoreStorageBundle(
  bundleDir: string,
  targetDir: string,
  active: { dbFile: string; uploadsDir: string },
) {
  fixture(
    path.join(bundleDir, "bundle.json"),
    path.join(targetDir, "guard"),
    active.dbFile,
    path.join(active.uploadsDir, "guard"),
  );
  if (fs.existsSync(targetDir)) throw new Error("Restore chỉ được tạo instance mới");
  if (
    within(targetDir, active.dbFile) ||
    within(active.uploadsDir, targetDir) ||
    within(targetDir, active.uploadsDir) ||
    canonicalPath(active.uploadsDir) === canonicalPath(targetDir)
  )
    throw new Error("Restore không được chạm storage đang dùng");
  const raw = JSON.parse(fs.readFileSync(path.join(bundleDir, "bundle.json"), "utf8"));
  if (
    raw.version !== 1 ||
    raw.quiesced !== true ||
    !Array.isArray(raw.media) ||
    typeof raw.database !== "string"
  )
    throw new Error("Bundle manifest không hợp lệ");
  const manifest = raw as BundleManifest,
    database = safeChild(bundleDir, manifest.database),
    mediaRoot = path.join(bundleDir, "media");
  const actual = inventory(mediaRoot);
  if (JSON.stringify(actual) !== JSON.stringify(manifest.media))
    throw new Error("Media bị thiếu, thêm hoặc checksum không khớp");
  restoreDatabase(database, { activeDbPath: active.dbFile, verifyOnly: true });
  fs.mkdirSync(targetDir);
  const restoredMedia = path.join(targetDir, "uploads");
  fs.mkdirSync(restoredMedia);
  for (const file of manifest.media) {
    const target = safeChild(restoredMedia, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(safeChild(mediaRoot, file.path), target, fs.constants.COPYFILE_EXCL);
    if (digest(target) !== file.sha256) throw new Error("Restore media verification failed");
  }
  const result = restoreDatabase(database, {
    activeDbPath: active.dbFile,
    targetPath: path.join(targetDir, "topica.db"),
  });
  const report = {
    ...result,
    uploadsDir: restoredMedia,
    mediaFiles: manifest.media.length,
    completedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(targetDir, "restore.json"), JSON.stringify(report, null, 2), {
    flag: "wx",
  });
  return report;
}
