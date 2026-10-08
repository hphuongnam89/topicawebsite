import { hashPassword } from "@/lib/auth/password";
import type { Database } from "./connection";
export async function seedDefaults(db: Database) {
  // Provision the first admin only with an explicitly configured password.
  const checkAdmin = await db.prepare("SELECT id FROM users LIMIT 1").get();
  if (!checkAdmin) {
    const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!initialAdminPassword || initialAdminPassword.length < 12) {
      throw new Error(
        "ADMIN_INITIAL_PASSWORD must be set to at least 12 characters before first startup.",
      );
    }
    const adminPasswordHash = hashPassword(initialAdminPassword);
    await db
      .prepare(
        `
      INSERT INTO users (id, username, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        "admin_root",
        "admin",
        adminPasswordHash,
        "Quản trị viên Topica",
        "admin",
        new Date().toISOString(),
      );
  }
  // Seed initial Hero Banner settings if not exists
  const checkHero = await db.prepare("SELECT key FROM settings WHERE key = ?").get("homepage_hero");
  if (!checkHero) {
    const defaultHero = {
      badge: "Trực thuộc Trường Đại học Phú Xuân — Thành viên EQuest",
      title: "HỌC CHỦ ĐỘNG —\nKIẾN TẠO TƯƠNG LAI",
      description:
        "Chương trình đào tạo từ xa chất lượng cao, linh hoạt thời gian, được Bộ GD&ĐT công nhận.",
      bgImage:
        "https://topicauni.edu.vn/wp-content/uploads/2026/06/gen-h-z7974881374708_9928c332948e9dc73c1de5527deb67d3.jpg",
      ctaPrimaryText: "Đăng ký xét tuyển",
      ctaPrimaryLink: "https://www.tuyensinh.topicauni.edu.vn/",
      ctaSecondaryText: "Xem ngành học",
      ctaSecondaryLink: "/nganh-dao-tao/",
      showLeadForm: true,
    };
    await db
      .prepare(
        `
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    `,
      )
      .run("homepage_hero", JSON.stringify(defaultHero), new Date().toISOString());
  }
  // Seed default categories
  const checkCats = (await db.prepare("SELECT COUNT(*) as count FROM categories").get()) as {
    count: number;
  };
  if (checkCats.count === 0) {
    const defaultCats = [
      {
        name: "Tin tuyển sinh",
        slug: "tin-tuyen-sinh",
        desc: "Thông tin tuyển sinh các ngành đào tạo từ xa",
      },
      {
        name: "Tin tức Topica",
        slug: "tin-tuc-topica",
        desc: "Tin tức, sự kiện và hoạt động của Topica",
      },
      {
        name: "Góc học tập & Hướng nghiệp",
        slug: "huong-nghiep",
        desc: "Cẩm nang học tập trực tuyến và cơ hội nghề nghiệp",
      },
    ];
    for (const cat of defaultCats) {
      await db
        .prepare(
          `
        INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?)
      `,
        )
        .run(cat.name, cat.slug, cat.desc, new Date().toISOString());
    }
  }
}
