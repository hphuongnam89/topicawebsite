import { initTestDatabase as initDb } from "@/__tests__/fixtures/database";
import { describe, expect, test, beforeAll, afterAll } from "vitest";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import {
  getPages,
  getPageBySlug,
  getLeads,
  createLead,
  updateLeadStatus,
  deleteLead,
  getSetting,
  setSetting,
  getArticles,
  closeDb,
} from "@/lib/db";
import { backupDatabase } from "@/scripts/backup-db";
import { cms } from "@/lib/cms/queries";

describe("Phase 8: CMS & Admin Management Workflows", () => {
  let tempTestDir: string;
  let originalDbPath: string | undefined;

  beforeAll(() => {
    originalDbPath = process.env.TOPICA_DB_PATH;
    tempTestDir = fs.mkdtempSync(path.join(os.tmpdir(), "topica-cms-test-"));
    const testDb = path.join(tempTestDir, "test-topica.db");
    process.env.TOPICA_DB_PATH = testDb;
    process.env.TOPICA_BACKUP_DIR = path.join(tempTestDir, "backups");
    process.env.STUB_NOTIFICATIONS = "true";
    closeDb();
    const db = initDb();
    const now = new Date().toISOString();
    for (const slug of [
      "chat-luong-dao-tao",
      "chinh-sach-bao-mat",
      "dieu-khoan-su-dung",
      "trai-nghiem-hoc-tap",
    ]) {
      db.prepare(
        `INSERT INTO pages (title, slug, content_html, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, 'published', ?, ?, ?)`,
      ).run(
        `Fixture ${slug}`,
        slug,
        "<p>Nội dung fixture nội bộ đủ dài để kiểm tra đường đọc trang công khai từ CMS.</p>",
        now,
        now,
        now,
      );
    }
    db.prepare(
      `INSERT INTO pages (title, slug, content_html, status, published_at, created_at, updated_at)
      VALUES ('Draft fixture', 'draft-fixture', '<p>Private draft</p>', 'draft', ?, ?, ?)`,
    ).run(now, now, now);
    for (const status of ["published", "draft"]) {
      db.prepare(
        `INSERT INTO articles (title, slug, content_html, status, published_at, created_at, updated_at)
        VALUES (?, ?, '<p>Fixture</p>', ?, ?, ?, ?)`,
      ).run(`Fixture ${status}`, `fixture-${status}`, status, now, now, now);
    }
    setSetting("site_settings", {
      hotline: "fixture-hotline",
      email: "admissions@example.test",
      address: "Fixture address",
    });
  });

  afterAll(() => {
    closeDb();
    if (originalDbPath) {
      process.env.TOPICA_DB_PATH = originalDbPath;
    } else {
      delete process.env.TOPICA_DB_PATH;
    }
    delete process.env.TOPICA_BACKUP_DIR;
    try {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    } catch {
      // Ignore if Windows releases file asynchronously
    }
  });
  describe("1. Quản lý Trang & Bài viết công khai", () => {
    test("chỉ các trang có trạng thái published mới được truy xuất qua CMS public", async () => {
      const publicSlugs = [
        "chat-luong-dao-tao",
        "chinh-sach-bao-mat",
        "dieu-khoan-su-dung",
        "trai-nghiem-hoc-tap",
      ];

      for (const slug of publicSlugs) {
        const page = getPageBySlug(slug);
        expect(page).toBeDefined();
        expect(page?.status).toBe("published");
        expect(page?.content_html).toBeDefined();
        expect(page?.content_html.length).toBeGreaterThan(50);
        expect(await cms.getPageBySlug(slug)).not.toBeNull();
      }
      expect(await cms.getPageBySlug("draft-fixture")).toBeNull();
    });

    test("tìm kiếm bài viết công khai chỉ trả về status = published", () => {
      const { items } = getArticles({ status: "published", limit: 10 });
      expect(items).toHaveLength(1);
      expect(items[0].slug).toBe("fixture-published");
      for (const article of items) {
        expect(article.status).toBe("published");
      }
    });
  });

  describe("2. Quản lý Quy trình Tuyển sinh & Leads", () => {
    test("tạo lead mới, kiểm tra trạng thái và cập nhật vòng đời xử lý", () => {
      const testPhone = "0901234567";
      const newLead = createLead({
        fullname: "Nguyễn Văn Thử Nghiệm",
        phone: testPhone,
        email: "test.lead@topica.edu.vn",
        program: "Công nghệ thông tin",
        notes: "Quan tâm chính sách học bổng Talent 30%",
      });

      expect(newLead.id).toBeGreaterThan(0);
      expect(newLead.status).toBe("new");

      // Cập nhật trạng thái sang contacted
      const updated = updateLeadStatus(newLead.id, "contacted");
      expect(updated).toBe(true);

      const { items } = getLeads({ search: testPhone });
      const found = items.find((l) => l.id === newLead.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe("contacted");

      // Dọn dẹp dữ liệu thử nghiệm
      const deleted = deleteLead(newLead.id);
      expect(deleted).toBe(true);
    });
  });

  describe("3. Quản lý Cài đặt Website (Site Settings)", () => {
    test("cài đặt hệ thống đọc đúng dữ liệu đã lưu trên fixture", () => {
      const settings = getSetting<any>("site_settings", {});
      expect(settings).toBeDefined();
      expect(settings.hotline).toBe("fixture-hotline");
      expect(settings.email).toBe("admissions@example.test");
      expect(settings.address).toBe("Fixture address");
    });
  });

  describe("4. Quy trình Sao lưu Cơ sở dữ liệu (Database Backup)", () => {
    test("thực thi sao lưu an toàn và tạo file backup kèm manifest", () => {
      const { backupFilePath, manifestFilePath, manifest } = backupDatabase();
      expect(fs.existsSync(backupFilePath)).toBe(true);
      expect(fs.existsSync(manifestFilePath)).toBe(true);
      expect(fs.statSync(backupFilePath).size).toBeGreaterThan(1024); // File > 1KB
      expect(manifest.integrityCheck).toBe("ok");
      expect(manifest.sha256).toBeDefined();
    });
  });
});
