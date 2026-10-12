import { describe, expect, test } from "vitest";
import {
  cleanWordPressEntities,
  stripWordPressShortcodes,
  sanitizeWordPressHtml,
  wordpressText,
} from "@/lib/cms/html";

describe("Task R06: lib/cms/html - Entity cleaning, XSS protection and Plain-text formatting", () => {
  describe("1. Entity cleaning (cleanWordPressEntities)", () => {
    test("chuyển đổi hoàn toàn các thực thể HTML phổ biến sang ký tự chuẩn", () => {
      expect(cleanWordPressEntities("Học phí &#038; Học bổng | Topica")).toBe("Học phí & Học bổng | Topica");
      expect(cleanWordPressEntities("Tin tức &amp; Sự kiện")).toBe("Tin tức & Sự kiện");
      expect(cleanWordPressEntities("Quy định &#8211; Khóa 2026")).toBe("Quy định – Khóa 2026");
      expect(cleanWordPressEntities("Lời khuyên &#8220;vàng&#8221; từ giảng viên")).toBe("Lời khuyên “vàng” từ giảng viên");
      expect(cleanWordPressEntities("Thông tin chi tiết&#8230;")).toBe("Thông tin chi tiết…");
    });

    test("không để sót thực thể &#038; hoặc &amp; trong tiêu đề hoặc chuỗi", () => {
      const dirtyTitle = "Tuyển sinh &#038; Đào tạo &amp; Hướng nghiệp &#038; Khảo thí";
      const cleaned = cleanWordPressEntities(dirtyTitle);
      expect(cleaned).not.toContain("&#038;");
      expect(cleaned).not.toContain("&amp;");
      expect(cleaned).toBe("Tuyển sinh & Đào tạo & Hướng nghiệp & Khảo thí");
    });
  });

  describe("2. Shortcodes removal (stripWordPressShortcodes)", () => {
    test("loại bỏ triệt để các shortcode Visual Composer, WPBakery, CF7", () => {
      const raw = "[vc_row][vc_column width=\"1/2\"][vc_custom_heading text=\"Topica\"]Nội dung đào tạo[/vc_column][/vc_row]";
      expect(stripWordPressShortcodes(raw)).toBe("Nội dung đào tạo");
    });

    test("loại bỏ shortcode biểu mẫu CF7 mà không làm mất nội dung xung quanh", () => {
      const raw = "<p>Liên hệ chúng tôi [contact-form-7 id=\"123\" title=\"Form tư vấn\"] sớm nhất.</p>";
      expect(stripWordPressShortcodes(raw)).toBe("<p>Liên hệ chúng tôi  sớm nhất.</p>");
    });
  });

  describe("3. XSS Sanitization (sanitizeWordPressHtml)", () => {
    test("bảo tồn các thẻ HTML an toàn và hợp lệ", () => {
      const html = "<p>Nội dung <strong>chính thức</strong> và <em>tin cậy</em>.</p>";
      const clean = sanitizeWordPressHtml(html);
      expect(clean).toContain("<p>Nội dung <strong>chính thức</strong> và <em>tin cậy</em>.</p>");
    });

    test("loại bỏ hoàn toàn thẻ script độc hại", () => {
      const dangerous = "<p>Nội dung hợp lệ</p><script>alert('xss')</script>";
      const clean = sanitizeWordPressHtml(dangerous);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert('xss')");
    });

    test("loại bỏ các thuộc tính bắt sự kiện nguy hiểm (onerror, onload, onclick)", () => {
      const dangerous = "<img src=\"https://images.unsplash.com/photo-1\" onerror=\"alert('hacked')\" alt=\"test\" />";
      const clean = sanitizeWordPressHtml(dangerous);
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("alert('hacked')");
      expect(clean).toContain("<img");
    });

    test("loại bỏ pseudo-protocol javascript: trong liên kết thẻ a", () => {
      const dangerous = "<a href=\"javascript:alert('malicious')\">Bấm vào đây</a>";
      const clean = sanitizeWordPressHtml(dangerous);
      expect(clean).not.toContain("javascript:");
    });

    test("loại bỏ thẻ iframe và object nhúng ngoài danh mục cho phép", () => {
      const dangerous = "<iframe src=\"https://evil.com/phishing\"></iframe><object data=\"bad.swf\"></object>";
      const clean = sanitizeWordPressHtml(dangerous);
      expect(clean).not.toContain("<iframe");
      expect(clean).not.toContain("<object");
    });
  });

  describe("4. Plain-text Excerpt & Metadata (wordpressText)", () => {
    test("tạo đoạn trích plain text sạch, không còn thẻ HTML và thực thể mã hóa", () => {
      const input = "<p>Chào mừng bạn đến với <strong>Topica</strong> &#038; ĐH Phú Xuân. [vc_row]Chi tiết xem tại đây.[/vc_row]</p>";
      const result = wordpressText(input);
      expect(result).toBe("Chào mừng bạn đến với Topica & ĐH Phú Xuân. Chi tiết xem tại đây.");
      expect(result).not.toContain("<p>");
      expect(result).not.toContain("&#038;");
      expect(result).not.toContain("[vc_row]");
    });

    test("chuẩn hóa khoảng trắng và ngắt dòng thừa", () => {
      const input = "  Đoạn văn   có     nhiều      khoảng trắng   \n\n\n  và xuống dòng   ";
      expect(wordpressText(input)).toBe("Đoạn văn có nhiều khoảng trắng và xuống dòng");
    });
  });
});
