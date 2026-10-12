// TEST FIXTURE ONLY. Historical values below are not approved public content.
import type { DatabaseSync } from "node:sqlite";
import type { Migration } from "@/lib/db/migrations/types";

export const cmsDomainFixture: Migration = {
  version: 3,
  name: "003_seed_verified_domain_data",
  up: (db: DatabaseSync) => {
    if (process.env.NODE_ENV !== "test") throw new Error("Fixture seed is test-only");
    const now = new Date().toISOString();

    // 1. Seed Organization
    const checkOrg = db.prepare("SELECT id FROM organizations WHERE id = ?").get("pxu_topica");
    if (!checkOrg) {
      const orgLocations = JSON.stringify([
        {
          name: "Trụ sở Đào tạo Hà Nội",
          address: "27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội",
          city: "Hà Nội",
          hotline: "1800 646 857",
        },
        {
          name: "Trung tâm Khảo thí & Học liệu Hà Nội",
          address: "Số 1 Nguyễn Tuân, Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội",
          city: "Hà Nội",
          hotline: "0901 795 580",
        },
        {
          name: "Trụ sở Trường Đại học Phú Xuân",
          address: "176 Trần Phú, Phường Phước Vĩnh, TP. Huế, Thừa Thiên Huế",
          city: "Huế",
          hotline: "0234 7306 888",
        },
        {
          name: "Cơ sở Đào tạo TP. Hồ Chí Minh",
          address: "Số 70 Tô Ký, Phường Tân Chánh Hiệp, Quận 12, TP. Hồ Chí Minh",
          city: "TP. Hồ Chí Minh",
          hotline: "1800 646 857",
        },
        {
          name: "Văn phòng Tuyển sinh Đà Nẵng",
          address: "Khu Công nghệ thông tin tập trung, Quận Hải Châu, Đà Nẵng",
          city: "Đà Nẵng",
          hotline: "1800 646 857",
        },
        {
          name: "Văn phòng Tuyển sinh Cần Thơ",
          address: "Số 207 Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ",
          city: "Cần Thơ",
          hotline: "1800 646 857",
        },
      ]);

      const orgServices = JSON.stringify({
        library: "https://elib.pxu.edu.vn/",
        lms: "/he-thong/",
        assessment: "/he-thong/",
        application: "https://www.tuyensinh.topicauni.edu.vn/",
        status: "/he-thong/",
      });

      db.prepare(
        `
        INSERT INTO organizations (
          id, name, role_scope, phone, hotline, email, website_url,
          support_hours, locations, service_urls, source, version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      ).run(
        "pxu_topica",
        "Viện Đào tạo Quốc tế Topica – Trường Đại học Phú Xuân",
        "Chương trình đào tạo cử nhân trực tuyến chuẩn quốc gia do Trường Đại học Phú Xuân cấp bằng",
        "1800 646 857",
        "0901 795 580",
        "tuyensinh@topicauni.edu.vn",
        "https://topica.edu.vn",
        "08:00 - 18:00, Thứ Hai - Thứ Bảy",
        orgLocations,
        orgServices,
        "Đề án liên kết đào tạo cử nhân trực tuyến ĐH Phú Xuân & Topica",
        now,
      );

      // Revision for organization
      db.prepare(
        `
        INSERT INTO content_revisions (
          entity_type, entity_id, version, title, payload, workflow_state,
          created_by, approved_by, published_at, created_at, updated_at
        ) VALUES (?, ?, 1, ?, ?, 'published', 'system', 'system', ?, ?, ?)
      `,
      ).run(
        "organization",
        "pxu_topica",
        "Thông tin tổ chức và mạng lưới cơ sở",
        JSON.stringify({
          id: "pxu_topica",
          name: "Viện Đào tạo Quốc tế Topica – Trường Đại học Phú Xuân",
          hotline: "1800 646 857",
        }),
        now,
        now,
        now,
      );
    }

    // 2. Seed 5 Programs
    const verifiedPrograms = [
      {
        id: "ba",
        slug: "quan-tri-kinh-doanh-marketing",
        aliases: JSON.stringify(["quan-tri-kinh-doanh"]),
        name: "Quản trị kinh doanh",
        major: "Quản trị doanh nghiệp",
        code: "7340101",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({
          credits: 126,
          semesters: 9,
          estimatedMonths: 36,
          tracks: [
            { audience: "THPT", credits: 126, duration: "3 - 3.5 năm" },
            { audience: "Trung cấp / Cao đẳng", credits: 60, duration: "1.5 - 2 năm" },
            { audience: "Văn bằng 2", credits: 50, duration: "1.5 năm" },
          ],
        }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
      },
      {
        id: "tourism",
        slug: "quan-tri-dich-vu-du-lich-va-lu-hanh",
        aliases: JSON.stringify(["du-lich"]),
        name: "Quản trị dịch vụ du lịch và lữ hành",
        major: "Quản trị lữ hành & khách sạn",
        code: "7810103",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({
          credits: 126,
          semesters: 9,
          estimatedMonths: 36,
          tracks: [
            { audience: "THPT", credits: 126, duration: "3 - 3.5 năm" },
            { audience: "Trung cấp / Cao đẳng", credits: 60, duration: "1.5 - 2 năm" },
            { audience: "Văn bằng 2", credits: 50, duration: "1.5 năm" },
          ],
        }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
      },
      {
        id: "it",
        slug: "cong-nghe-thong-tin",
        aliases: JSON.stringify(["it", "do-hoa-ky-thuat-so"]),
        name: "Công nghệ thông tin – chuyên ngành Đồ hoạ kỹ thuật số",
        major: "Đồ hoạ kỹ thuật số",
        code: "7480201",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({
          credits: 126,
          semesters: 9,
          estimatedMonths: 36,
          tracks: [
            { audience: "THPT", credits: 126, duration: "3 - 3.5 năm" },
            { audience: "Trung cấp / Cao đẳng", credits: 60, duration: "1.5 - 2 năm" },
            { audience: "Văn bằng 2", credits: 50, duration: "1.5 năm" },
          ],
        }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
      },
      {
        id: "english",
        slug: "ngon-ngu-anh",
        aliases: JSON.stringify(["tieng-anh"]),
        name: "Ngôn ngữ Anh",
        major: "Tiếng Anh thương mại",
        code: "7220201",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({
          credits: 126,
          semesters: 9,
          estimatedMonths: 36,
          tracks: [
            { audience: "THPT", credits: 126, duration: "3 - 3.5 năm" },
            { audience: "Trung cấp / Cao đẳng", credits: 60, duration: "1.5 - 2 năm" },
            { audience: "Văn bằng 2", credits: 50, duration: "1.5 năm" },
          ],
        }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
      },
      {
        id: "chinese",
        slug: "ngon-ngu-trung-quoc",
        aliases: JSON.stringify(["tieng-trung"]),
        name: "Ngôn ngữ Trung Quốc",
        major: "Tiếng Trung thương mại",
        code: "7220204",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({
          credits: 126,
          semesters: 9,
          estimatedMonths: 36,
          tracks: [
            { audience: "THPT", credits: 126, duration: "3 - 3.5 năm" },
            { audience: "Trung cấp / Cao đẳng", credits: 60, duration: "1.5 - 2 năm" },
            { audience: "Văn bằng 2", credits: 50, duration: "1.5 năm" },
          ],
        }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
      },
    ];

    for (const prog of verifiedPrograms) {
      const checkProg = db.prepare("SELECT id FROM programs WHERE id = ?").get(prog.id);
      if (!checkProg) {
        db.prepare(
          `
          INSERT INTO programs (
            id, slug, aliases, name, major, code, form,
            degree_name, awarding_institution, duration_credits, source, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `,
        ).run(
          prog.id,
          prog.slug,
          prog.aliases,
          prog.name,
          prog.major,
          prog.code,
          prog.form,
          prog.degree_name,
          prog.awarding_institution,
          prog.duration_credits,
          prog.source,
          now,
          now,
        );

        // Content Revision for Program
        db.prepare(
          `
          INSERT INTO content_revisions (
            entity_type, entity_id, version, title, payload, workflow_state,
            created_by, approved_by, published_at, created_at, updated_at
          ) VALUES (?, ?, 1, ?, ?, 'published', 'system', 'system', ?, ?, ?)
        `,
        ).run(
          "program",
          prog.id,
          `Bản phát hành chuẩn: ${prog.name}`,
          JSON.stringify(prog),
          now,
          now,
          now,
        );
      }
    }

    // 3. Seed Admission Round
    const checkRound = db
      .prepare("SELECT id FROM admission_rounds WHERE id = ?")
      .get("round_2026_k2026_q3");
    if (!checkRound) {
      db.prepare(
        `
        INSERT INTO admission_rounds (
          id, name, program_ids, cohort, audience, open_at, deadline_at, start_at,
          application_url, documents, source, status, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 1, ?, ?)
      `,
      ).run(
        "round_2026_k2026_q3",
        "Kỳ tuyển sinh Đại học từ xa Đợt 3/2026",
        JSON.stringify(["ba", "tourism", "it", "english", "chinese"]),
        "K2026",
        "Tốt nghiệp THPT, Trung cấp, Cao đẳng, Đại học",
        "2026-06-01T00:00:00.000Z",
        "2026-07-20T17:00:00.000Z",
        "2026-08-01T08:00:00.000Z",
        "https://www.tuyensinh.topicauni.edu.vn/",
        JSON.stringify(["doc-de-an-tuyen-sinh-2026"]),
        "Thông báo tuyển sinh số 15/TB-PXU ngày 15/01/2026",
        now,
        now,
      );

      db.prepare(
        `
        INSERT INTO content_revisions (
          entity_type, entity_id, version, title, payload, workflow_state,
          created_by, approved_by, published_at, created_at, updated_at
        ) VALUES (?, ?, 1, ?, ?, 'published', 'system', 'system', ?, ?, ?)
      `,
      ).run(
        "admission_round",
        "round_2026_k2026_q3",
        "Kỳ tuyển sinh Đợt 3/2026",
        JSON.stringify({
          id: "round_2026_k2026_q3",
          deadline_at: "2026-07-20T17:00:00.000Z",
        }),
        now,
        now,
        now,
      );
    }

    // 4. Seed Tuition Policy
    const checkTuition = db
      .prepare("SELECT id FROM tuition_policies WHERE id = ?")
      .get("tuition_pxu_2026_all");
    if (!checkTuition) {
      db.prepare(
        `
        INSERT INTO tuition_policies (
          id, program_id, cohort, audience, currency, unit_price_per_credit,
          total_credits, total_tuition, other_fees, assumptions, effective_from,
          effective_to, source, doc_ref, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'VND', ?, ?, ?, ?, ?, ?, NULL, ?, ?, 1, ?, ?)
      `,
      ).run(
        "tuition_pxu_2026_all",
        "all",
        "K2026",
        "Toàn bộ 5 ngành đào tạo cử nhân từ xa chuẩn",
        600000,
        126,
        75600000,
        JSON.stringify({
          admissionFee: 0,
          graduationFee: 0,
          learningMaterials: 0,
        }),
        JSON.stringify({
          note: "Học phí thu theo số tín chỉ thực tế sinh viên đăng ký trong từng học kỳ. Không tăng giá trong suốt lộ trình chuẩn.",
        }),
        "2026-01-01T00:00:00.000Z",
        "Quyết định ban hành biểu mức thu học phí năm 2026 - ĐH Phú Xuân",
        "doc-quy-dinh-hoc-phi-2026",
        now,
        now,
      );

      db.prepare(
        `
        INSERT INTO content_revisions (
          entity_type, entity_id, version, title, payload, workflow_state,
          created_by, approved_by, published_at, created_at, updated_at
        ) VALUES (?, ?, 1, ?, ?, 'published', 'system', 'system', ?, ?, ?)
      `,
      ).run(
        "tuition_policy",
        "tuition_pxu_2026_all",
        "Chính sách học phí 600.000đ/tín chỉ K2026",
        JSON.stringify({
          unit_price_per_credit: 600000,
          total_tuition: 75600000,
        }),
        now,
        now,
        now,
      );
    }

    // 5. Seed Scholarship
    const checkScholarship = db
      .prepare("SELECT id FROM scholarships WHERE id = ?")
      .get("scholarship_talent_2026");
    if (!checkScholarship) {
      db.prepare(
        `
        INSERT INTO scholarships (
          id, name, program_ids, scope, value_type, value,
          conditions, deadline_at, evaluation_method, source, version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'percent', 30, ?, NULL, ?, ?, 1, ?, ?)
      `,
      ).run(
        "scholarship_talent_2026",
        "Học bổng Tài năng Phú Xuân",
        JSON.stringify(["ba", "tourism", "it", "english", "chinese"]),
        "Tân sinh viên đạt kết quả xét tuyển cao hoặc đăng ký nhập học sớm",
        "Áp dụng giảm 30% học phí khi học viên nộp hồ sơ sớm hoặc có thành tích học tập loại Giỏi",
        "Xét duyệt trực tiếp theo hồ sơ đăng ký hợp lệ",
        "Quy chế Học bổng & Hỗ trợ sinh viên 2026 - ĐH Phú Xuân",
        now,
        now,
      );
    }

    // 6. Seed Documents
    const verifiedDocs = [
      {
        id: "asset-mau-phoi-bang",
        title: "Mẫu Phôi bằng Cử nhân — Trường Đại học Phú Xuân",
        type: "license",
        file_url: "/official-assets/mau-phoi-bang.png",
        view_url: "/official-assets/mau-phoi-bang.png",
        mime_type: "image/png",
        byte_size: 1625985,
        checksum_sha256: "499C3FA5AF144D098722FEA9BB594AD7D23B938BA8F8F37E145ACB219612F7D3",
        published_date: "2026-01-15",
        version: "1.0",
        source: "Trường Đại học Phú Xuân",
        rights: "Công khai theo quy định của Bộ GD&ĐT",
        access: "public",
      },
      {
        id: "asset-mau-bang-diem",
        title: "Mẫu Bảng điểm tốt nghiệp Cử nhân — Trường Đại học Phú Xuân",
        type: "license",
        file_url: "/official-assets/mau-bang-diem.png",
        view_url: "/official-assets/mau-bang-diem.png",
        mime_type: "image/png",
        byte_size: 1785491,
        checksum_sha256: "5F8505509A692454E291AE7D4D2AA013B16B0EC4CFCD8D29F15EF4AF7EA178F9",
        published_date: "2026-01-15",
        version: "1.0",
        source: "Trường Đại học Phú Xuân",
        rights: "Công khai theo quy định của Bộ GD&ĐT",
        access: "public",
      },
      {
        id: "doc-thong-tu-27",
        title:
          "Thông tư 27/2019/TT-BGDĐT quy định về nội dung chính ghi trên văn bằng và phụ lục văn bằng",
        type: "policy",
        file_url: "/chat-luong-dao-tao/",
        view_url: "/chat-luong-dao-tao/",
        mime_type: "text/html",
        byte_size: 0,
        checksum_sha256: "ONLINE_HTML_REGULATION_TT27",
        published_date: "2019-12-30",
        version: "1.0",
        source: "Bộ Giáo dục và Đào tạo",
        rights: "Văn bản quy phạm pháp luật công khai",
        access: "public",
      },
    ];

    for (const doc of verifiedDocs) {
      const checkDoc = db.prepare("SELECT id FROM documents WHERE id = ?").get(doc.id);
      if (!checkDoc) {
        db.prepare(
          `
          INSERT INTO documents (
            id, title, type, file_url, view_url, mime_type, byte_size,
            checksum_sha256, published_date, version, source, rights, access, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        ).run(
          doc.id,
          doc.title,
          doc.type,
          doc.file_url,
          doc.view_url,
          doc.mime_type,
          doc.byte_size,
          doc.checksum_sha256,
          doc.published_date,
          doc.version,
          doc.source,
          doc.rights,
          doc.access,
          now,
          now,
        );
      }
    }

    // 7. Audit log for migration 003
    db.prepare(
      `
      INSERT INTO audit_logs (
        actor_id, actor_name, action, entity_type, entity_id, revision_id,
        timestamp, changed_fields, reason, ip_address
      ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL)
    `,
    ).run(
      "system",
      "Migration Runner",
      "create",
      "migration",
      "003_seed_verified_domain_data",
      now,
      JSON.stringify([
        "organizations",
        "programs",
        "admission_rounds",
        "tuition_policies",
        "scholarships",
        "documents",
      ]),
      "Initial verified domain data seed for R16",
    );
  },
  down: (db: DatabaseSync) => {
    db.exec(`
      DELETE FROM audit_logs WHERE entity_id = '003_seed_verified_domain_data';
      DELETE FROM documents WHERE id IN ('asset-mau-phoi-bang', 'asset-mau-bang-diem', 'doc-thong-tu-27');
      DELETE FROM scholarships WHERE id = 'scholarship_talent_2026';
      DELETE FROM tuition_policies WHERE id = 'tuition_pxu_2026_all';
      DELETE FROM admission_rounds WHERE id = 'round_2026_k2026_q3';
      DELETE FROM programs WHERE id IN ('ba', 'tourism', 'it', 'english', 'chinese');
      DELETE FROM organizations WHERE id = 'pxu_topica';
      DELETE FROM content_revisions WHERE entity_id IN ('pxu_topica', 'ba', 'tourism', 'it', 'english', 'chinese', 'round_2026_k2026_q3', 'tuition_pxu_2026_all');
    `);
  },
};
