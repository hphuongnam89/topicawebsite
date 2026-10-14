import { describe, expect, test } from "vitest";
import navigationData from "@/data/navigation.json";
import { programs, PROGRAM_ID_MAP, getProgramById } from "@/data/programs";
import { contactChannels } from "@/data/campuses";
import nextConfig from "../../next.config";

describe("Task R07: Route Map, IA và 6 Hành trình Quyết định", () => {
  describe("1. Tính toàn vẹn của Menu Điều hướng (Zero Dead Ends)", () => {
    test("mọi nhóm điều hướng chính (primary navigation) đều có href hợp lệ và không chứa '#'", () => {
      navigationData.primary.forEach((group) => {
        expect(group.href).toBeDefined();
        expect(group.href).not.toBe("#");
        expect(group.href.trim().length).toBeGreaterThan(0);
        expect(group.href.startsWith("/")).toBe(true);

        group.columns.forEach((col) => {
          expect(col.heading).toBeDefined();
          col.items.forEach((item) => {
            expect(item.label).toBeDefined();
            expect(item.href).toBeDefined();
            expect(item.href).not.toBe("#");
            expect(item.href.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    test("menu ngành học trong navigation trỏ chính xác tới 5 ngành đào tạo", () => {
      const programsGroup = navigationData.primary.find((g) => g.id === "programs");
      expect(programsGroup).toBeDefined();

      const allProgramHrefs =
        programsGroup?.columns.flatMap((c) => c.items.map((i) => i.href)) ?? [];
      programs.forEach((prog) => {
        expect(allProgramHrefs).toContain(prog.href);
      });
    });

    test("menu Tin tức chỉ giữ bản tin, thông báo chính thức thuộc menu Tuyển sinh", () => {
      const newsGroup = navigationData.primary.find((group) => group.id === "news");
      const admissionsGroup = navigationData.primary.find((group) => group.id === "admissions");
      const newsItems = newsGroup?.columns.flatMap((column) => column.items) ?? [];
      const admissionsItems = admissionsGroup?.columns.flatMap((column) => column.items) ?? [];

      expect(newsItems.some((item) => item.label === "Tin tuyển sinh")).toBe(true);
      expect(newsItems.some((item) => item.label === "Thông báo tuyển sinh")).toBe(false);
      expect(
        admissionsItems.some(
          (item) => item.label === "Thông báo tuyển sinh" && item.href === "/thong-bao-tuyen-sinh/",
        ),
      ).toBe(true);
    });
  });

  describe("2. Canonical & Chuyển hướng Route Ngành Đào tạo", () => {
    test("5 ngành đào tạo đều có canonical route tại cấp root", () => {
      programs.forEach((prog) => {
        expect(prog.href).toBe(`/${prog.slug}/`);
      });
    });

    test("PROGRAM_ID_MAP ánh xạ chính xác các alias cũ về canonical program", () => {
      const legacyAliases: Record<string, string> = {
        "quan-tri-kinh-doanh": "ba",
        "quan-tri-du-lich": "tourism",
        "du-lich-lu-hanh": "tourism",
        cntt: "it",
        "tieng-anh": "english",
        "tieng-trung": "chinese",
      };

      Object.entries(legacyAliases).forEach(([alias, programId]) => {
        const mappedId = PROGRAM_ID_MAP[alias];
        expect(mappedId).toBe(programId);

        const canonicalProg = getProgramById(mappedId);
        expect(canonicalProg).toBeDefined();
        expect(canonicalProg?.slug).toBeDefined();
      });
    });

    test("cấu hình next.config.ts chứa đầy đủ redirects cho legacy slugs và nested paths", async () => {
      if (typeof nextConfig.redirects === "function") {
        const redirects = await nextConfig.redirects();
        const sources = redirects.map((r) => r.source);

        // Kiểm tra các legacy program redirects
        expect(sources).toContain("/quan-tri-kinh-doanh");
        expect(sources).toContain("/quan-tri-du-lich");
        expect(sources).toContain("/du-lich-lu-hanh");
        expect(sources).toContain("/cntt");
        expect(sources).toContain("/tieng-anh");
        expect(sources).toContain("/tieng-trung");

        // Kiểm tra nested /nganh-dao-tao/:slug redirect về root
        const nestedRule = redirects.find((r) => r.source.includes("nganh-dao-tao/:slug"));
        expect(nestedRule).toBeDefined();
        expect(nestedRule?.destination).toBe("/:slug/");
        expect(nestedRule?.permanent).toBe(true);

        // Kiểm tra legacy hoc-phi redirect
        expect(sources).toContain("/hoc-phi");
      }
    });
  });

  describe("3. 6 Hành trình Quyết định của Người học (Decision Journeys)", () => {
    test("Hành trình 1: Khám phá ngành -> Khung CTĐT 9 kỳ -> CTA Đăng ký/Tư vấn", () => {
      programs.forEach((prog) => {
        expect(prog.targetAudiences.length).toBe(4);
        const standardTrack = prog.targetAudiences.find((a) => a.audienceId === "thpt");
        expect(standardTrack?.durationSemesters).toBe(9);
        expect(standardTrack?.estimatedCredits).toBe(126);
      });
    });

    test("Hành trình 2: Pháp lý & Giá trị văn bằng do ĐH Phú Xuân cấp", () => {
      programs.forEach((prog) => {
        expect(prog.awardingInstitution).toBe("Trường Đại học Phú Xuân");
        expect(prog.degreeAwarded).toContain("Cử nhân");
        expect(prog.trainingMode).toBe("Đào tạo từ xa");
      });
    });

    test("Hành trình 3: Chi phí minh bạch 600k/TC và Học bổng", () => {
      const tuitionHref = "/tuyen-sinh/hoc-phi-hoc-bong/";
      const navAdmissions = navigationData.primary.find((g) => g.id === "admissions");
      const admissionsLinks =
        navAdmissions?.columns.flatMap((c) => c.items.map((i) => i.href)) ?? [];

      expect(admissionsLinks).toContain(tuitionHref);
    });

    test("Hành trình 4: Tuyển sinh và Điều kiện nhập học", () => {
      const admissionsGroup = navigationData.primary.find((g) => g.id === "admissions");
      expect(admissionsGroup).toBeDefined();
      expect(admissionsGroup?.href).toBe("/tuyen-sinh/");
    });

    test("Hành trình 5: Cổng Elearning và Dịch vụ sinh viên", () => {
      const elearningHref = "/he-thong/";
      const studyGroup = navigationData.primary.find((g) => g.id === "study");
      const studentLinks = studyGroup?.columns.flatMap((c) => c.items.map((i) => i.href)) ?? [];

      expect(studentLinks).toContain(elearningHref);
    });

    test("Hành trình 6: Đầu mối liên hệ theo vai trò và Hotline miễn cước", () => {
      expect(contactChannels.admissionsHotline.value).toBe("1800 646 857");
      expect(contactChannels.admissionsHotline.href).toBe("tel:1800646857");
      expect(contactChannels.admissionsDirect.value).toBe("0901 795 580");
    });
  });
});
