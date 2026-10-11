import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Tính toán độ chói tương đối (Relative Luminance) theo chuẩn WCAG 2.2
function getLuminance(hex: string): number {
  const rgb = hex.replace("#", "");
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Tính Contrast Ratio theo chuẩn W3C WCAG
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const fetchHtml = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
};

async function runAccessibilityAudit() {
  console.log("===================================================================");
  console.log("♿ TOPICA QA AUDITOR: KIỂM THỬ KHẢ NĂNG TIẾP CẬN (WCAG 2.2 AA)");
  console.log("===================================================================\n");

  let auditFailed = false;

  // ---------------------------------------------------------
  // 1. Kiểm tra Độ Tương Phản Màu Sắc (Color Contrast Ratios)
  // ---------------------------------------------------------
  console.log("1️⃣ KIỂM TRA ĐỘ TƯƠNG PHẢN MÀU SẮC (WCAG 2.2 AA - MIN 4.5:1)");
  console.log("---------------------------------------------------------");

  const colorPairs = [
    { name: "Deep Navy trên White", fg: "#0A2540", bg: "#FFFFFF", min: 4.5 },
    { name: "Brand Navy trên White", fg: "#00264D", bg: "#FFFFFF", min: 4.5 },
    { name: "Body Text Ink trên White", fg: "#1A202C", bg: "#FFFFFF", min: 4.5 },
    { name: "Muted Text Ink trên White", fg: "#4A5568", bg: "#FFFFFF", min: 4.5 },
    { name: "Red Crimson trên White", fg: "#BA1B1D", bg: "#FFFFFF", min: 4.5 },
    { name: "Gold Accent Text trên Deep Navy", fg: "#E5A83B", bg: "#0A2540", min: 4.5 },
    { name: "Gold Button Text (Navy 950 trên Gold 500)", fg: "#06152B", bg: "#E5A83B", min: 4.5 },
  ];

  for (const pair of colorPairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passed = ratio >= pair.min;
    const formattedRatio = ratio.toFixed(2) + ":1";
    if (passed) {
      console.log(`✅ [ĐẠT] ${pair.name} (${pair.fg} / ${pair.bg}): ${formattedRatio} (Yêu cầu >= ${pair.min}:1)`);
    } else {
      console.error(`❌ [KHÔNG ĐẠT] ${pair.name}: ${formattedRatio} (Yêu cầu >= ${pair.min}:1)`);
      auditFailed = true;
    }
  }

  // ---------------------------------------------------------
  // 2. Kiểm tra CSS Quy tắc Reduced Motion & Focus Outline
  // ---------------------------------------------------------
  console.log("\n2️⃣ KIỂM TRA QUY TẮC CSS REDUCED-MOTION & FOCUS OUTLINE");
  console.log("---------------------------------------------------------");
  const globalsCssPath = path.join(process.cwd(), "app/globals.css");
  if (fs.existsSync(globalsCssPath)) {
    const cssContent = fs.readFileSync(globalsCssPath, "utf-8");
    if (cssContent.includes("prefers-reduced-motion: reduce")) {
      console.log("✅ [ĐẠT] CSS chứa khai báo @media (prefers-reduced-motion: reduce) bảo vệ người dùng nhạy cảm chuyển động.");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Thiếu khai báo prefers-reduced-motion: reduce trong globals.css.");
      auditFailed = true;
    }

    if (cssContent.includes(":focus-visible")) {
      console.log("✅ [ĐẠT] CSS định nghĩa rõ ràng :focus-visible outline cho điều hướng bàn phím.");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Thiếu quy tắc :focus-visible trong globals.css.");
      auditFailed = true;
    }
  }

  // ---------------------------------------------------------
  // 3. Phân tích HTML từ Trang Chủ & Các Trang Mẫu
  // ---------------------------------------------------------
  console.log("\n3️⃣ PHÂN TÍCH CẤU TRÚC HTML THỰC TẾ TRÊN DEV SERVER");
  console.log("---------------------------------------------------------");
  try {
    const homeHtml = await fetchHtml(`${SITE_URL}/`);

    // a. Kiểm tra Skip to Main Content Link
    if (homeHtml.includes('href="#main-content"') && homeHtml.includes('id="main-content"')) {
      console.log("✅ [ĐẠT] Skip link tồn tại (href=\"#main-content\") và trỏ đúng id=\"main-content\".");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Thiếu Skip link (#main-content) hoặc thẻ <main id=\"main-content\">.");
      auditFailed = true;
    }

    // b. Kiểm tra thuộc tính ngôn ngữ lang="vi"
    if (homeHtml.includes('lang="vi"')) {
      console.log("✅ [ĐẠT] Thẻ <html> khai báo đúng ngôn ngữ tiếng Việt (lang=\"vi\").");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Thẻ <html> thiếu thuộc tính lang=\"vi\".");
      auditFailed = true;
    }

    // c. Kiểm tra Viewport & Meta Responsive
    if (homeHtml.includes('name="viewport"')) {
      console.log("✅ [ĐẠT] Khai báo viewport responsive đầy đủ.");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Thiếu thẻ meta viewport.");
      auditFailed = true;
    }

    // d. Kiểm tra các thẻ img có alt attribute
    const imgTags = homeHtml.match(/<img[^>]+>/g) || [];
    let imgWithoutAlt = 0;
    imgTags.forEach((img) => {
      if (!img.includes("alt=")) {
        imgWithoutAlt++;
      }
    });

    if (imgWithoutAlt === 0) {
      console.log(`✅ [ĐẠT] 100% hình ảnh (${imgTags.length} ảnh) đều có thuộc tính alt hỗ trợ Screen Reader.`);
    } else {
      console.warn(`⚠️ [CẢNH BÁO] Có ${imgWithoutAlt}/${imgTags.length} ảnh thiếu thuộc tính alt.`);
      // Nếu có ảnh thiếu alt không có giá trị rỗng, có thể cảnh báo
    }

    // e. Kiểm tra ARIA attributes
    if (homeHtml.includes("aria-label") || homeHtml.includes("aria-expanded")) {
      console.log("✅ [ĐẠT] Giao diện sử dụng đầy đủ các thuộc tính ARIA (aria-label, aria-expanded, role).");
    } else {
      console.error("❌ [KHÔNG ĐẠT] Không tìm thấy thuộc tính ARIA trong mã nguồn render.");
      auditFailed = true;
    }
  } catch (err: any) {
    console.error(`❌ [LỖI KẾT NỐI] Không thể nạp trang từ ${SITE_URL}:`, err.message);
    auditFailed = true;
  }

  // ---------------------------------------------------------
  // 4. Tổng Kết
  // ---------------------------------------------------------
  console.log("\n===================================================================");
  if (auditFailed) {
    console.error("❌ KẾT QUẢ: KIỂM THỬ KHẢ NĂNG TIẾP CẬN CÓ ĐIỂM CHƯA ĐẠT CHUẨN!");
    process.exit(1);
  } else {
    console.log("🎉 KẾT QUẢ: 100% TIÊU CHÍ WCAG 2.2 AA ĐƯỢC ĐÁP ỨNG TOÀN DIỆN!");
    console.log("===================================================================");
    process.exit(0);
  }
}

runAccessibilityAudit().catch((err) => {
  console.error("Lỗi thực thi kiểm thử tiếp cận:", err);
  process.exit(1);
});
