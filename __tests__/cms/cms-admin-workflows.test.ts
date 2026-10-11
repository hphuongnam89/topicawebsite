import { describe, expect, test } from "vitest";
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
} from "@/lib/db";
import { backupDatabase } from "@/scripts/backup-db";
import fs from "node:fs";

describe("Phase 8: CMS & Admin Management Workflows", () => {
  describe("1. Quản lý Trang & Bài viết công khai", () => {
    test("chỉ các trang có trạng thái published mới được truy xuất qua slug", () => {
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
      }
    });

    test("tìm kiếm bài viết công khai chỉ trả về status = published", () => {
      const { items } = getArticles({ status: "published", limit: 10 });
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
    test("cài đặt hệ thống lưu trữ hotline chính thức và địa chỉ chuẩn xác", () => {
      const settings = getSetting<any>("site_settings", {});
      expect(settings).toBeDefined();
      expect(settings.hotline).toBe("1800 646 857");
      expect(settings.email).toBe("tuyensinh@topicauni.edu.vn");
      expect(settings.address).toContain("27 Lê Văn Lương");
    });
  });

  describe("4. Quy trình Sao lưu Cơ sở dữ liệu (Database Backup)", () => {
    test("thực thi sao lưu an toàn và tạo file backup", () => {
      const backupPath = backupDatabase();
      expect(fs.existsSync(backupPath)).toBe(true);
      expect(fs.statSync(backupPath).size).toBeGreaterThan(1024); // File > 1KB
    });
  });
});
