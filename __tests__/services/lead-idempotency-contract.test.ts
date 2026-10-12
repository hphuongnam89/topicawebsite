import { initTestDatabase as initDb } from "@/__tests__/fixtures/database";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { closeDb, getDb, type LeadRecord } from "@/lib/db";
import { submitLead } from "@/lib/services/leads";
import { leadApiSchema, leadFormSchema } from "@/lib/form-schema";

describe("Task R15: Form tư vấn và Hợp đồng API tin cậy (Idempotency & Consent)", () => {
  let tempDir: string;
  let testDbPath: string;
  let originalDbPath: string | undefined;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "topica-r15-lead-test-"));
    testDbPath = path.join(tempDir, "test-topica.db");
    originalDbPath = process.env.TOPICA_DB_PATH;
    process.env.TOPICA_DB_PATH = testDbPath;
    closeDb();
    initDb();
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

  describe("1. Schema validation client & server", () => {
    test("chấp nhận email rỗng và chuyển đổi thành undefined", () => {
      const validPayload = {
        fullname: "Nguyễn Văn Hùng",
        phone: "0912345678",
        email: "",
        program: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
        consent: true,
      };

      const result = leadApiSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBeUndefined();
      }
    });

    test("từ chối khi email sai định dạng cú pháp", () => {
      const invalidPayload = {
        fullname: "Nguyễn Văn Hùng",
        phone: "0912345678",
        email: "khong-phai-email",
        program: "Quản trị kinh doanh",
        consent: true,
      };

      const result = leadApiSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    test("bắt buộc phải có consent: true từ phía server", () => {
      const missingConsent = {
        fullname: "Lê Thị Lan",
        phone: "0987654321",
        program: "Ngôn ngữ Anh",
      };

      const result = leadApiSchema.safeParse(missingConsent);
      expect(result.success).toBe(false);

      const falseConsent = {
        ...missingConsent,
        consent: false,
      };
      const resultFalse = leadApiSchema.safeParse(falseConsent);
      expect(resultFalse.success).toBe(false);
    });
  });

  describe("2. Lưu trữ Consent & Metadata đầy đủ vào Database", () => {
    test("lưu timestamp consent, phiên bản chính sách và nguồn trang truy cập", () => {
      const submitData = {
        fullname: "Phạm Văn Minh",
        phone: "0934567890",
        email: "minh.pham@example.com",
        program: "Quản trị kinh doanh",
        notes: "Trình độ: Tốt nghiệp THPT",
        consent: true,
        consent_version: "2026.1",
        source: "/quan-tri-kinh-doanh-marketing/",
        idempotency_key: "idem-key-minh-01",
      };

      const { lead, duplicate } = submitLead(submitData);
      expect(duplicate).toBe(false);
      expect(lead.id).toBeGreaterThan(0);
      expect(lead.fullname).toBe("Phạm Văn Minh");
      expect(lead.consent).toBe(1);
      expect(lead.consent_version).toBe("2026.1");
      expect(lead.consent_at).toBeDefined();
      expect(lead.source).toBe("/quan-tri-kinh-doanh-marketing/");
      expect(lead.idempotency_key).toBe("idem-key-minh-01");

      // Đối chiếu trực tiếp từ bảng leads trong SQLite
      const db = getDb();
      const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(lead.id) as any;
      expect(row.fullname).toBe("Phạm Văn Minh");
      expect(row.consent).toBe(1);
      expect(row.consent_version).toBe("2026.1");
      expect(row.source).toBe("/quan-tri-kinh-doanh-marketing/");
      expect(row.idempotency_key).toBe("idem-key-minh-01");
    });
  });

  describe("3. Cơ chế Idempotency & Chống gửi lặp (Zero Double-Submit)", () => {
    test("a new request with changed details is saved even within the short dedupe window", () => {
      const payload = {
        fullname: "QA Fixture",
        phone: "0900000000",
        program: "undecided",
        consent: true,
      };
      const first = submitLead(payload);
      const changed = submitLead({ ...payload, notes: "Updated consultation request" });
      expect(changed.duplicate).toBe(false);
      expect(changed.lead.id).not.toBe(first.lead.id);
    });
    test("refuses changed payload for the same request key and accepts reuse after TTL", () => {
      const payload = {
        fullname: "QA FIXTURE ONLY",
        phone: "0900000000",
        program: "undecided",
        consent: true,
        idempotency_key: "ttl-fixture",
      };
      const first = submitLead(payload);
      expect(() => submitLead({ ...payload, phone: "0900000001" })).toThrow(/thay đổi/);
      getDb()
        .prepare("UPDATE leads SET created_at=? WHERE id=?")
        .run(new Date(Date.now() - 86401000).toISOString(), first.lead.id);
      const next = submitLead(payload);
      expect(next.duplicate).toBe(false);
      expect(next.lead.id).not.toBe(first.lead.id);
    });
    test("cùng idempotency_key chỉ tạo đúng 1 bản ghi duy nhất trong DB", () => {
      const payload = {
        fullname: "Hoàng Thị Mai",
        phone: "0901234567",
        program: "Ngôn ngữ Trung Quốc",
        consent: true,
        idempotency_key: "fixed-session-key-mai-100",
      };

      // Gửi lần 1
      const res1 = submitLead(payload);
      expect(res1.duplicate).toBe(false);

      // Gửi lần 2 với cùng key (mô phỏng double click hoặc retry mạng)
      const res2 = submitLead(payload);
      expect(res2.duplicate).toBe(true);
      expect(res2.lead.id).toBe(res1.lead.id);

      // Kiểm tra tổng số bản ghi trong bảng leads phải chính xác là 1
      const db = getDb();
      const countRow = db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
      expect(countRow.count).toBe(1);
    });

    test("chống double-click nhanh trong vòng 30s ngay cả khi không truyền idempotency_key", () => {
      const payload = {
        fullname: "Đỗ Tuấn Kiệt",
        phone: "0977889900",
        program: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số",
        consent: true,
      };

      const res1 = submitLead(payload);
      expect(res1.duplicate).toBe(false);

      const res2 = submitLead(payload);
      expect(res2.duplicate).toBe(true);
      expect(res2.lead.id).toBe(res1.lead.id);

      const db = getDb();
      const countRow = db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
      expect(countRow.count).toBe(1);
    });

    test("không khóa vĩnh viễn người có cùng số điện thoại khi đăng ký ngành khác", () => {
      const phone = "0944556677";

      // Đăng ký ngành 1
      const res1 = submitLead({
        fullname: "Vũ Hải Nam",
        phone,
        program: "Quản trị kinh doanh",
        consent: true,
      });
      expect(res1.duplicate).toBe(false);

      // Đăng ký thêm ngành 2
      const res2 = submitLead({
        fullname: "Vũ Hải Nam",
        phone,
        program: "Ngôn ngữ Anh",
        consent: true,
      });
      expect(res2.duplicate).toBe(false);
      expect(res2.lead.id).not.toBe(res1.lead.id);

      const db = getDb();
      const countRow = db
        .prepare("SELECT COUNT(*) as count FROM leads WHERE phone = ?")
        .get(phone) as { count: number };
      expect(countRow.count).toBe(2);
    });
  });

  describe("4. An toàn dữ liệu & Cách ly môi trường", () => {
    test("không gửi request notification ra bên ngoài khi đang chạy test", () => {
      // Đảm bảo process.env.NODE_ENV === "test" được tôn trọng
      expect(process.env.NODE_ENV).toBe("test");
      const res = submitLead({
        fullname: "Kiểm tra Cô lập",
        phone: "0900000000",
        consent: true,
      });
      expect(res.lead.id).toBeGreaterThan(0);
    });
  });
});
