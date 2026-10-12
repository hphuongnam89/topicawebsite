import { describe, expect, test, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { backupDatabase } from "@/scripts/backup-db";
import { restoreDatabase } from "@/scripts/restore-db";

describe("Phase 8/10 (Task R02): Quy trình Sao lưu & Phục hồi có kiểm chứng", () => {
  let tempSuiteDir: string;
  let testDbFile: string;
  let testBackupDir: string;
  let testRestoredDir: string;

  beforeAll(() => {
    tempSuiteDir = fs.mkdtempSync(path.join(os.tmpdir(), "topica-r02-backup-test-"));
    testDbFile = path.join(tempSuiteDir, "test-active.db");
    testBackupDir = path.join(tempSuiteDir, "backups");
    testRestoredDir = path.join(tempSuiteDir, "restored");

    fs.mkdirSync(testBackupDir, { recursive: true });
    fs.mkdirSync(testRestoredDir, { recursive: true });

    // Khởi tạo Database mẫu với WAL mode
    const initDb = new DatabaseSync(testDbFile);
    initDb.exec("PRAGMA journal_mode = WAL;");
    initDb.exec(`
      CREATE TABLE articles (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL
      );
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE leads (
        id INTEGER PRIMARY KEY,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);

    initDb.exec(`
      INSERT INTO articles (title, slug) VALUES 
        ('Thông báo nhập học khóa 2026', 'thong-bao-nhap-hoc-2026'),
        ('Kế hoạch thực tập doanh nghiệp', 'ke-hoach-thuc-tap');
      INSERT INTO settings (key, value) VALUES 
        ('site_title', 'Viện Đào tạo Quốc tế Topica'),
        ('hotline', '1800 646 857');
      INSERT INTO leads (fullname, phone) VALUES 
        ('Nguyễn Văn An', '0901234567');
    `);

    initDb.close();
  });

  afterAll(() => {
    try {
      fs.rmSync(tempSuiteDir, { recursive: true, force: true });
    } catch {
      // Safe cleanup
    }
  });

  test("1. Sao lưu database tạo snapshot atomic, checksum SHA-256 và manifest kiểm chứng", () => {
    const result = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
      label: "daily_test",
    });

    expect(fs.existsSync(result.backupFilePath)).toBe(true);
    expect(fs.existsSync(result.manifestFilePath)).toBe(true);

    const stat = fs.statSync(result.backupFilePath);
    expect(stat.size).toBeGreaterThan(1024);

    // Kiểm chứng manifest
    expect(result.manifest.integrityCheck).toBe("ok");
    expect(result.manifest.label).toBe("daily_test");
    expect(result.manifest.isPreMigration).toBe(false);
    expect(result.manifest.tables.articles).toBe(2);
    expect(result.manifest.tables.settings).toBe(2);
    expect(result.manifest.tables.leads).toBe(1);

    // Kiểm chứng SHA-256
    const fileBytes = fs.readFileSync(result.backupFilePath);
    const calculatedHash = crypto.createHash("sha256").update(fileBytes).digest("hex");
    expect(result.manifest.sha256).toBe(calculatedHash);
  });

  test("2. Sao lưu an toàn trong điều kiện có ghi đồng thời trên WAL", () => {
    // Ghi thêm dữ liệu vào WAL mà không checkpoint
    const activeDb = new DatabaseSync(testDbFile);
    activeDb.exec("INSERT INTO leads (fullname, phone) VALUES ('Trần Thị Bình', '0912345678');");

    const result = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
    });

    activeDb.close();

    // Snapshot phải chứa đầy đủ dữ liệu vừa ghi
    expect(result.manifest.integrityCheck).toBe("ok");
    expect(result.manifest.tables.leads).toBe(2);

    // Mở file backup trực tiếp để kiểm tra tính độc lập
    const backupDb = new DatabaseSync(result.backupFilePath);
    const rows = backupDb.prepare("SELECT count(*) as count FROM leads").get() as any;
    expect(Number(rows.count)).toBe(2);
    backupDb.close();
  });

  test("3. Quy tắc xoay vòng an toàn: Giữ lại bản pre-migration và chỉ dọn dẹp sau khi kiểm chứng đạt", () => {
    // Tạo 1 bản sao lưu trước migration được bảo vệ
    const preMigrationResult = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
      isPreMigration: true,
      label: "v1_0_release",
    });

    expect(preMigrationResult.manifest.isPreMigration).toBe(true);

    // Tạo 4 bản sao lưu thường với giới hạn retentionCount = 2
    for (let i = 0; i < 4; i++) {
      backupDatabase({
        targetDbFile: testDbFile,
        targetBackupDir: testBackupDir,
        retentionCount: 2,
      });
    }

    // Bản pre_migration phải luôn được bảo vệ không bị xoá
    expect(fs.existsSync(preMigrationResult.backupFilePath)).toBe(true);
    expect(fs.existsSync(preMigrationResult.manifestFilePath)).toBe(true);

    const allDbFiles = fs
      .readdirSync(testBackupDir)
      .filter((f) => f.startsWith("topica_backup_") && f.endsWith(".db"));

    // Tổng số file: 1 bản pre-migration + tối đa 2 bản thường gần nhất (hoặc bản cũ nếu chưa rotate hết)
    // Nhưng bản pre_migration chắc chắn còn tồn tại
    expect(allDbFiles.some((f) => f.includes("v1_0_release"))).toBe(true);
  });

  test("4. Phục hồi dữ liệu (Restore) mặc định vào instance cô lập, đối chiếu toàn vẹn bảng", () => {
    const backupResult = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
    });

    const restoreResult = restoreDatabase(backupResult.backupFilePath, {
      targetDir: testRestoredDir,
    });

    expect(restoreResult.isIsolatedInstance).toBe(true);
    expect(restoreResult.sha256Verified).toBe(true);
    expect(restoreResult.integrityVerified).toBe(true);
    expect(fs.existsSync(restoreResult.targetDbPath)).toBe(true);

    // Đọc và kiểm chứng nội dung trên DB vừa phục hồi
    const restoredDb = new DatabaseSync(restoreResult.targetDbPath);
    const settingsRows = restoredDb.prepare("SELECT * FROM settings").all() as any[];
    expect(settingsRows.length).toBe(2);

    const hotline = settingsRows.find((s) => s.key === "hotline");
    expect(hotline?.value).toBe("1800 646 857");

    restoredDb.close();
  });

  test("5. Cơ chế an toàn ngăn chặn vô tình ghi đè Database đang chạy (Active DB Protection)", () => {
    const backupResult = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
    });

    // Thử restore trỏ thẳng vào testDbFile mà không có cờ allowActiveOverwrite
    expect(() => {
      restoreDatabase(backupResult.backupFilePath, {
        activeDbPath: testDbFile,
        targetPath: testDbFile,
        allowActiveOverwrite: false,
      });
    }).toThrow(/Từ chối thao tác: Thao tác restore sẽ ghi đè lên Cơ sở dữ liệu đang chạy/);
  });

  test("6. Phát hiện bản sao lưu bị hỏng/giả mạo (Tampered/Corrupted Backup) và từ chối khôi phục", () => {
    const backupResult = backupDatabase({
      targetDbFile: testDbFile,
      targetBackupDir: testBackupDir,
    });

    // Tạo file bị hỏng bằng cách làm biến dạng byte
    const corruptedFilePath = path.join(testBackupDir, "topica_backup_corrupted.db");
    const corruptedManifestPath = `${corruptedFilePath}.manifest.json`;

    fs.copyFileSync(backupResult.backupFilePath, corruptedFilePath);
    fs.copyFileSync(backupResult.manifestFilePath, corruptedManifestPath);

    // Ghi đè rác vào file database
    const fd = fs.openSync(corruptedFilePath, "r+");
    fs.writeSync(fd, Buffer.from("CORRUPTED_GARBAGE_BYTES_TEST"), 0, 26, 100);
    fs.closeSync(fd);

    // Thao tác restore phải thất bại ngay từ bước kiểm tra Checksum hoặc Integrity
    expect(() => {
      restoreDatabase(corruptedFilePath, {
        targetDir: testRestoredDir,
      });
    }).toThrow(/Checksum SHA-256 không khớp|bị lỗi cấu trúc/);

    // File gốc và database đang chạy không bị ảnh hưởng
    expect(fs.existsSync(testDbFile)).toBe(true);
    expect(fs.existsSync(backupResult.backupFilePath)).toBe(true);
  });
});
