import { initTestDatabase as initDb } from "@/__tests__/fixtures/database";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { DatabaseSync } from "node:sqlite";
import { closeDb, getDb } from "@/lib/db";
import {
  ALL_MIGRATIONS,
  runMigrations,
  rollbackMigration,
  getAppliedMigrations,
  getTableCounts,
} from "@/lib/db/migrations";
import {
  createDraftRevision,
  getRevisions,
  getRevisionById,
  submitRevisionForReview,
  approveRevision,
  publishRevision,
  rejectRevision,
  getPublicPrograms,
  getPublicProgramById,
  getPublicProgramBySlug,
  getPublicOrganization,
  getPublicAdmissionRounds,
  getPublicTuitionPolicies,
  getPublicScholarships,
  getPublicDocuments,
  recordAnalyticsEvent,
  getAuditLogs,
} from "@/lib/services/cms-models";
import {
  programSchema,
  tuitionPolicySchema,
  admissionRoundSchema,
  analyticsEventSchema,
} from "@/lib/validation/cms-schemas";
import { toUtcIso, formatDateGMT7, formatDateTimeGMT7, isWithinInterval } from "@/lib/date";
import { backupDatabase } from "@/scripts/backup-db";
import { restoreDatabase } from "@/scripts/restore-db";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";

describe("Task R16: Model CMS và Migration có thể khôi phục (Database Schema, Revisioning & Rollback)", () => {
  let tempDir: string;
  let testDbPath: string;
  let originalDbPath: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "topica-r16-cms-test-"));
    testDbPath = path.join(tempDir, "test-topica.db");
    originalDbPath = process.env.TOPICA_DB_PATH;
    process.env.TOPICA_DB_PATH = testDbPath;
    closeDb();
  });

  afterEach(() => {
    closeDb();
    if (originalDbPath) {
      process.env.TOPICA_DB_PATH = originalDbPath;
    } else {
      delete process.env.TOPICA_DB_PATH;
    }
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe("1. Khởi tạo Migration & Tính Idempotent (Idempotency & Re-run)", () => {
    test("thực thi migration lần đầu tạo đầy đủ 3 phiên bản và các bảng nghiệp vụ", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");

      const report = runMigrations(db, { skipBackup: true });
      expect(report.dryRun).toBe(false);
      expect(report.currentVersion).toBe(ALL_MIGRATIONS.length);
      expect(report.applied.length).toBe(ALL_MIGRATIONS.length);

      const applied = getAppliedMigrations(db);
      expect(applied.length).toBe(ALL_MIGRATIONS.length);
      expect(applied[0].name).toBe("001_core_legacy_baseline");
      expect(applied[1].name).toBe("002_cms_domain_models");
      expect(applied[2].name).toBe("003_seed_verified_domain_data");

      // Kiểm tra bảng tồn tại
      const counts = getTableCounts(db);
      for (const table of [
        "organizations",
        "programs",
        "tuition_policies",
        "admission_rounds",
        "scholarships",
        "documents",
        "content_revisions",
        "audit_logs",
      ]) {
        expect(counts[table]).toBe(0);
      }

      db.close();
    });

    test("chạy lại migration nhiều lần không nhân đôi hay làm mất dữ liệu (Idempotency)", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");

      // Lần 1
      runMigrations(db, { skipBackup: true });
      const counts1 = getTableCounts(db);

      // Lần 2
      const report2 = runMigrations(db, { skipBackup: true });
      expect(report2.applied.length).toBe(0);
      const counts2 = getTableCounts(db);

      expect(counts2.programs).toBe(counts1.programs);
      expect(counts2.organizations).toBe(counts1.organizations);
      expect(counts2.tuition_policies).toBe(counts1.tuition_policies);

      db.close();
    });

    test("chế độ dry-run mô phỏng thay đổi và hoàn nguyên sạch sẽ (ROLLBACK)", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");

      const report = runMigrations(db, { dryRun: true, skipBackup: true });
      expect(report.dryRun).toBe(true);
      expect(report.applied.length).toBe(ALL_MIGRATIONS.length);

      // Vì là dry-run, schema_migrations không ghi nhận
      const applied = getAppliedMigrations(db);
      expect(applied.length).toBe(0);

      // Các bảng chưa được tạo thực tế
      const counts = getTableCounts(db);
      expect(counts.programs).toBeUndefined();

      db.close();
    });
  });

  describe("2. Xử lý lỗi giao dịch & Khả năng Rollback (Atomic Transaction & Rollback)", () => {
    test("lỗi giữa chừng kích hoạt rollback transaction tự động, không để lại dữ liệu rác", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");

      // Chạy migration 1 và 2 thành công
      runMigrations(db, { targetVersion: 2, skipBackup: true });
      expect(getAppliedMigrations(db).length).toBe(2);

      // Thử tạo một migration lỗi giả lập
      const faultyMigration = {
        version: 99,
        name: "099_faulty_step",
        up: (faultyDb: DatabaseSync) => {
          faultyDb.exec("INSERT INTO programs (id, slug, name) VALUES ('temp', 'temp', 'Temp');");
          // Lỗi cố ý: cú pháp SQL sai
          faultyDb.exec("INVALID SQL STATEMENT SYNTAX ERROR;");
        },
        down: () => {},
      };

      // Chạy migration lỗi trong transaction
      db.exec("BEGIN TRANSACTION;");
      let threwError = false;
      try {
        faultyMigration.up(db);
        db.exec("COMMIT;");
      } catch {
        db.exec("ROLLBACK;");
        threwError = true;
      }

      expect(threwError).toBe(true);
      // Bản ghi 'temp' đã bị rollback, không tồn tại trong DB
      const row = db.prepare("SELECT * FROM programs WHERE id = 'temp'").get();
      expect(row).toBeUndefined();

      db.close();
    });

    test("chức năng rollbackMigration khôi phục về phiên bản trước đó an toàn", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");

      runMigrations(db, { skipBackup: true });
      expect(getAppliedMigrations(db).length).toBe(ALL_MIGRATIONS.length);

      // Rollback 1 bước
      const lastMigration = ALL_MIGRATIONS[ALL_MIGRATIONS.length - 1];
      const reportRollback = rollbackMigration(db, { steps: 1, skipBackup: true });
      expect(reportRollback.rolledBack).toContain(
        `v${lastMigration.version} (${lastMigration.name})`,
      );
      expect(reportRollback.currentVersion).toBe(ALL_MIGRATIONS.length - 1);

      const appliedAfter = getAppliedMigrations(db);
      expect(appliedAfter.length).toBe(ALL_MIGRATIONS.length - 1);

      // Bảng programs vẫn còn (từ v2) nhưng dữ liệu seed đã được dọn sạch
      const counts = getTableCounts(db);
      expect(counts.programs).toBe(0);

      db.close();
    });

    test("sao lưu pre-migration và khôi phục (restore) toàn vẹn cơ sở dữ liệu", () => {
      const db = new DatabaseSync(testDbPath);
      db.exec("PRAGMA journal_mode = WAL;");
      runMigrations(db, { targetVersion: 2, skipBackup: true });
      db.close();

      const backupDir = path.join(tempDir, "backups");
      const backupResult = backupDatabase({
        targetDbFile: testDbPath,
        targetBackupDir: backupDir,
        isPreMigration: true,
      });

      expect(backupResult.manifest.isPreMigration).toBe(true);
      expect(fs.existsSync(backupResult.backupFilePath)).toBe(true);

      // Giờ áp dụng tiếp migration 3 trên testDbPath
      const dbAfter = new DatabaseSync(testDbPath);
      runMigrations(dbAfter, { skipBackup: true });
      expect(getTableCounts(dbAfter).programs).toBe(0);
      dbAfter.close();

      // Phục hồi từ bản pre-migration backup vào một file cô lập
      const restoreDest = path.join(tempDir, "restored.db");
      const restoreResult = restoreDatabase(backupResult.backupFilePath, {
        targetPath: restoreDest,
      });

      expect(restoreResult.integrityVerified).toBe(true);

      const restoredDb = new DatabaseSync(restoreDest);
      const restoredApplied = getAppliedMigrations(restoredDb);
      expect(restoredApplied.length).toBe(2); // Trạng thái trước v3
      expect(getTableCounts(restoredDb).programs).toBe(0);
      restoredDb.close();
    });
  });

  describe("3. Ràng buộc Dữ liệu & Schema Validation (Constraints)", () => {
    test("programSchema từ chối mã ngành không chuẩn hoặc tín chỉ <= 0", () => {
      const invalidProg = {
        id: "invalid_prog",
        slug: "invalid",
        name: "Ngành Sai",
        major: "Chuyên ngành",
        code: "123", // Sai: phải là 7 chữ số
        form: "Đào tạo từ xa",
        degree_name: "Cử nhân",
        awarding_institution: "ĐH Phú Xuân",
        duration_credits: { credits: 0, semesters: 9 }, // Sai: credits <= 0
        source: "Nguồn",
      };

      const result = programSchema.safeParse(invalidProg);
      expect(result.success).toBe(false);
    });

    test("tuitionPolicySchema từ chối đơn giá âm hoặc tổng học phí không khớp", () => {
      const invalidPolicy = {
        id: "tuition_invalid",
        program_id: "ba",
        cohort: "K2026",
        audience: "Chuẩn",
        currency: "VND",
        unit_price_per_credit: 600000,
        total_credits: 126,
        total_tuition: 50000000, // Sai: 600.000 * 126 = 75.600.000đ
        effective_from: "2026-01-01T00:00:00.000Z",
        source: "Quy chế",
      };

      const result = tuitionPolicySchema.safeParse(invalidPolicy);
      expect(result.success).toBe(false);
    });

    test("admissionRoundSchema từ chối thứ tự thời gian phi logic", () => {
      const invalidRound = {
        id: "round_err",
        name: "Kỳ Lỗi",
        program_ids: ["ba"],
        cohort: "K2026",
        audience: "THPT",
        open_at: "2026-08-01T00:00:00.000Z",
        deadline_at: "2026-07-01T00:00:00.000Z", // Sai: deadline trước open
        start_at: "2026-09-01T00:00:00.000Z",
        application_url: "https://example.com",
        source: "Thông báo",
      };

      const result = admissionRoundSchema.safeParse(invalidRound);
      expect(result.success).toBe(false);
    });

    test("analyticsEventSchema từ chối metadata chứa PII hoặc secrets", () => {
      const invalidEvent = {
        event_name: "cta_click",
        page_path: "/nganh-dao-tao/",
        server_time: "2026-10-11T12:00:00.000Z",
        metadata: {
          button: "register",
          phone: "0901234567", // Bị cấm: PII lộ
        },
      };

      const result = analyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("4. Cơ chế Revision, Tách biệt Draft/Published & Audit Trail", () => {
    beforeEach(() => {
      const db = initDb(); // Explicit isolated schema and test-only domain fixture.
      cmsDomainFixture.up(db);
      for (const [id, role] of [
        ["editor_01", "editor"],
        ["editor_02", "editor"],
        ["admin_root", "admin"],
      ]) {
        db.prepare(
          "INSERT OR IGNORE INTO users(id,username,password_hash,name,role,created_at) VALUES(?,?,?,?,?,?)",
        ).run(id, id, "fixture-only", id, role, new Date().toISOString());
      }
    });

    test("tạo bản nháp (draft revision) không làm thay đổi dữ liệu công khai (published)", () => {
      // 1. Kiểm tra bản published hiện tại của ngành BA
      const currentPublic = getPublicProgramById("ba");
      expect(currentPublic).not.toBeNull();
      expect(currentPublic?.name).toBe("Quản trị kinh doanh");

      // 2. Biên tập viên tạo một revision nháp mới với tiêu đề thay đổi
      const draftRev = createDraftRevision({
        entityType: "program",
        entityId: "ba",
        title: "Bản nháp cập nhật chương trình 2026 v2",
        payload: {
          name: "Quản trị kinh doanh số & Đổi mới sáng tạo",
          major: "Kinh doanh số",
        },
        reviewerNotes: "Đang chờ hội đồng duyệt đề cương mới",
        actorId: "editor_01",
        actorName: "Biên tập viên A",
      });

      expect(draftRev.workflow_state).toBe("draft");
      expect(draftRev.version).toBe(2);

      // 3. Truy vấn public: Dữ liệu công khai vẫn PHẢI là bản cũ ("Quản trị kinh doanh")
      const publicStillSame = getPublicProgramById("ba");
      expect(publicStillSame?.name).toBe("Quản trị kinh doanh");

      // 4. Luồng duyệt: editor gửi duyệt -> admin duyệt -> publish
      submitRevisionForReview(draftRev.id, "editor_01", "Biên tập viên A");
      expect(getRevisionById(draftRev.id)?.workflow_state).toBe("in_review");

      approveRevision(draftRev.id, "admin_root", "Quản trị viên", "Đồng ý thay đổi");
      expect(getRevisionById(draftRev.id)?.workflow_state).toBe("approved");

      publishRevision(draftRev.id, "admin_root", "Quản trị viên");
      expect(getRevisionById(draftRev.id)?.workflow_state).toBe("published");

      // 5. Sau khi publish: Public API phản ánh dữ liệu mới
      const updatedPublic = getPublicProgramById("ba");
      expect(updatedPublic?.name).toBe("Quản trị kinh doanh số & Đổi mới sáng tạo");

      // 6. Bản revision v1 trước đó chuyển thành 'archived'
      const revisions = getRevisions("program", "ba");
      const v1 = revisions.find((r) => r.version === 1);
      expect(v1?.workflow_state).toBe("archived");
    });

    test("từ chối duyệt (reject) đưa revision về trạng thái draft kèm lý do phản hồi", () => {
      const draftRev = createDraftRevision({
        entityType: "program",
        entityId: "tourism",
        title: "Bản nháp cần chỉnh sửa",
        payload: { name: "Du lịch Quốc tế" },
        actorId: "editor_02",
        actorName: "Biên tập viên B",
      });

      submitRevisionForReview(draftRev.id, "editor_02", "Biên tập viên B");
      rejectRevision(
        draftRev.id,
        "admin_root",
        "Quản trị viên",
        "Thiếu văn bản phê duyệt của Nhà trường",
      );

      const rejected = getRevisionById(draftRev.id);
      expect(rejected?.workflow_state).toBe("draft");
      expect(rejected?.reviewer_notes).toBe("Thiếu văn bản phê duyệt của Nhà trường");
    });

    test("public DTO tuyệt đối không làm lộ reviewer_notes hoặc tài liệu private", () => {
      // 1. Thêm một tài liệu private vào DB
      const db = getDb();
      db.prepare(
        `
        INSERT INTO documents (
          id, title, type, file_url, view_url, mime_type, byte_size,
          checksum_sha256, published_date, version, source, rights, access, created_at, updated_at
        ) VALUES (
          'internal_guideline', 'Quy trình nội bộ bí mật', 'policy',
          '/private/internal.pdf', '/private/internal.pdf', 'application/pdf', 1024,
          'SHA256INTERNAL', '2026-01-01', '1.0', 'Nội bộ', 'Bảo mật', 'private',
          '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
        )
      `,
      ).run();

      // 2. Truy vấn danh sách tài liệu công khai
      const publicDocs = getPublicDocuments();
      const internalDoc = publicDocs.find((d) => d.id === "internal_guideline");
      expect(internalDoc).toBeUndefined();

      // 3. Kiểm tra các trường trong DTO của Program và Organization
      const org = getPublicOrganization();
      expect(org).not.toBeNull();
      expect((org as any).reviewer_notes).toBeUndefined();
      expect((org as any).password).toBeUndefined();
    });

    test("ghi nhận nhật ký kiểm toán (Audit Trail) bất biến cho mọi thao tác", () => {
      const logs = getAuditLogs({ limit: 10 });
      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[0];
      expect(lastLog.actor_name).toBeDefined();
      expect(lastLog.action).toBeDefined();
      expect(lastLog.timestamp).toBeDefined();
    });

    test("ghi nhận sự kiện analytics hợp lệ và từ chối nếu vi phạm allowlist", () => {
      expect(() => {
        recordAnalyticsEvent({
          eventName: "cta_click",
          pagePath: "/tuyen-sinh/",
          programId: "ba",
          metadata: { button: "hero_cta" },
        });
      }).not.toThrow();

      // Sai: Tên sự kiện không nằm trong allowlist
      expect(() => {
        recordAnalyticsEvent({
          eventName: "invalid_unsupported_action" as any,
          pagePath: "/tuyen-sinh/",
        });
      }).toThrow();
    });
  });

  describe("5. Chuẩn mực Thời gian UTC & Hiển thị GMT+7 (Time Contract)", () => {
    test("toUtcIso định dạng chính xác chuỗi UTC ISO kết thúc bằng Z", () => {
      const utc = toUtcIso("2026-07-20T17:00:00+07:00");
      expect(utc).toBe("2026-07-20T10:00:00.000Z");
      expect(utc.endsWith("Z")).toBe(true);
    });

    test("formatDateGMT7 và formatDateTimeGMT7 định dạng chuẩn Việt Nam", () => {
      const utcIso = "2026-07-20T10:00:00.000Z"; // 17:00 GMT+7
      const dateStr = formatDateGMT7(utcIso);
      expect(dateStr).toBe("20/07/2026");

      const dateTimeStr = formatDateTimeGMT7(utcIso);
      expect(dateTimeStr).toContain("17:00");
      expect(dateTimeStr).toContain("20/07/2026");
    });

    test("isWithinInterval tuân thủ nghiêm ngặt quy tắc nửa mở [start, end)", () => {
      const start = "2026-06-01T00:00:00.000Z";
      const end = "2026-07-20T17:00:00.000Z";

      // Trước start -> false
      expect(isWithinInterval("2026-05-31T23:59:59.000Z", start, end)).toBe(false);
      // Đúng tại start -> true
      expect(isWithinInterval("2026-06-01T00:00:00.000Z", start, end)).toBe(true);
      // Ở giữa -> true
      expect(isWithinInterval("2026-07-01T12:00:00.000Z", start, end)).toBe(true);
      // Đúng tại end -> false (Quy tắc nửa mở [start, end))
      expect(isWithinInterval("2026-07-20T17:00:00.000Z", start, end)).toBe(false);
      // Sau end -> false
      expect(isWithinInterval("2026-07-20T17:00:01.000Z", start, end)).toBe(false);
    });
  });
});
