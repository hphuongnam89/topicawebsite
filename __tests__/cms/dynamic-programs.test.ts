import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "@/lib/db";
import { cmsDomainFixture } from "@/__tests__/fixtures/cms-domain";
import { getLivePrograms, getLiveProgramDetail, isKnownProgramPath } from "@/lib/services/public-site";
import { createDraftRevision, submitRevisionForReview, approveRevision, publishRevision } from "@/lib/services/revisions";

describe("Dynamic CMS Programs Management", () => {
  const actorId = "admin";

  beforeEach(() => {
    const db = getDb();
    cmsDomainFixture.up(db);
    for (const role of ["editor", "admin"]) {
      db.prepare(
        "INSERT OR REPLACE INTO users(id,username,name,role,password_hash,created_at) VALUES(?,?,?,?,?,?)",
      ).run(role, role, `Fixture ${role}`, role, "fixture-only", new Date().toISOString());
    }
  });

  it("cho phép biên tập và xuất bản thay đổi nội dung chuyên sâu của 5 ngành hiện tại", () => {
    // 1. Kiểm tra ngành CNTT hiện tại
    const initialDetail = getLiveProgramDetail("cong-nghe-thong-tin");
    expect(initialDetail).not.toBeNull();
    expect(initialDetail?.officialName).toContain("Công nghệ thông tin");

    // 2. Tạo bản nháp sửa đổi nội dung ngành CNTT (summary mới, careers mới)
    const customSummary = "Chương trình CNTT Topica thế hệ mới tích hợp sâu AI & Big Data.";
    const customCareers = [
      "Kỹ sư Trí tuệ nhân tạo và Thị giác máy tính",
      "Chuyên viên thiết kế đồ họa chuyển động 3D",
      "Giám đốc sáng tạo đa phương tiện",
    ];

    const draft = createDraftRevision({
      actorId,
      entityType: "program",
      entityId: "it",
      title: "Cập nhật mô tả và cơ hội việc làm CNTT",
      payload: {
        id: "it",
        slug: "cong-nghe-thong-tin",
        name: "Công nghệ thông tin – chuyên ngành Đồ hoạ kỹ thuật số",
        major: "Đồ hoạ kỹ thuật số",
        code: "7480201",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({ credits: 126, semesters: 9 }),
        source: "Quyết định mở ngành & Kiểm định chất lượng Trường ĐH Phú Xuân",
        summary: customSummary,
        careers: customCareers,
      },
    });

    expect(draft.workflow_state).toBe("draft");

    // 3. Quy trình duyệt và công bố
    submitRevisionForReview(draft.id, actorId, "Admin Test");
    approveRevision(draft.id, actorId, "Admin Test", "Duyệt nội dung CNTT mới");
    publishRevision(draft.id, actorId, "Admin Test");

    // 4. Kiểm tra trang công khai nhận ngay nội dung mới
    const updatedDetail = getLiveProgramDetail("cong-nghe-thong-tin");
    expect(updatedDetail).not.toBeNull();
    expect(updatedDetail?.summary).toBe(customSummary);
    expect(updatedDetail?.careers).toEqual(customCareers);
  });

  it("cho phép tạo mới hoàn toàn ngành đào tạo thứ 6 trực tiếp từ CMS không cần code", () => {
    const newProgramId = "ds_ai";
    const newSlug = "khoa-hoc-du-lieu-ai";
    const newMajorCode = "7480202";

    // Trước khi tạo, ngành mới chưa tồn tại
    expect(isKnownProgramPath(newSlug)).toBe(false);
    expect(getLiveProgramDetail(newSlug)).toBeNull();

    // 1. Tạo bản nháp ngành mới
    const draft = createDraftRevision({
      actorId,
      entityType: "program",
      entityId: newProgramId,
      title: "Mở mới ngành Khoa học Dữ liệu và Trí tuệ Nhân tạo",
      payload: {
        id: newProgramId,
        slug: newSlug,
        name: "Khoa học Dữ liệu và Trí tuệ Nhân tạo",
        major: "Trí tuệ nhân tạo",
        marketing_label: "Khoa học dữ liệu · Học máy & AI",
        code: newMajorCode,
        group: "technology",
        form: "Đào tạo từ xa",
        degree_name: "Bằng Cử nhân do Trường Đại học Phú Xuân cấp",
        awarding_institution: "Trường Đại học Phú Xuân",
        duration_credits: JSON.stringify({ credits: 130, semesters: 9 }),
        summary: "Đào tạo chuyên sâu về phân tích dữ liệu lớn, mô hình ngôn ngữ lớn (LLM) và học sâu.",
        source: "Quyết định mở ngành số 123/QĐ-ĐHPX năm 2026",
        careers: [
          "Kỹ sư Khoa học dữ liệu (Data Scientist)",
          "Kỹ sư Học máy (Machine Learning Engineer)",
          "Chuyên viên Phân tích kinh doanh AI (AI Business Analyst)",
        ],
        curriculum: [
          {
            id: "ds-term-1",
            name: "Học kỳ 1",
            credits: 15,
            courses: [
              { code: "DSAI.101", name: "Nhập môn Khoa học Dữ liệu", credits: 3, requirement: "Bắt buộc" },
              { code: "DSAI.102", name: "Đại số tuyến tính cho AI", credits: 3, requirement: "Bắt buộc" },
              { code: "DSAI.103", name: "Lập trình Python căn bản", credits: 3, requirement: "Bắt buộc" },
            ],
          },
        ],
      },
    });

    // 2. Duyệt & Công bố
    submitRevisionForReview(draft.id, actorId, "Admin Test");
    approveRevision(draft.id, actorId, "Admin Test", "Đã thẩm định hồ sơ mở ngành");
    publishRevision(draft.id, actorId, "Admin Test");

    // 3. Kiểm tra ngành mới xuất hiện trên danh mục toàn hệ thống
    const allPrograms = getLivePrograms();
    const createdProg = allPrograms.find((p) => p.slug === newSlug);
    expect(createdProg).toBeDefined();
    expect(createdProg?.name).toBe("Khoa học Dữ liệu và Trí tuệ Nhân tạo");
    expect(createdProg?.majorCode).toBe(newMajorCode);

    // 4. Kiểm tra trang chi tiết của ngành mới được tạo động hoàn chỉnh
    expect(isKnownProgramPath(newSlug)).toBe(true);
    const detail = getLiveProgramDetail(newSlug);
    expect(detail).not.toBeNull();
    expect(detail?.officialName).toBe("Khoa học Dữ liệu và Trí tuệ Nhân tạo");
    expect(detail?.code).toBe(newMajorCode);
    expect(detail?.summary).toContain("Đào tạo chuyên sâu về phân tích dữ liệu lớn");
    expect(detail?.careers).toHaveLength(3);
    expect(detail?.curriculum).toHaveLength(1);
    expect(detail?.curriculum[0].courses).toHaveLength(3);
    expect(detail?.facts.find((f) => f.label === "Mã ngành")?.value).toBe(newMajorCode);
  });
});
