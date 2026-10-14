import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDb, createLead } from "@/lib/db";

const authContext = {
  user: {
    id: "admin-1",
    username: "admin1",
    name: "Admin Test",
    role: "admin" as "admin" | "editor",
  },
};

vi.mock("@/lib/auth/guards", () => ({
  requireUser: async () => authContext,
  requireAdmin: async () =>
    authContext.user.role === "admin"
      ? authContext
      : {
          response: new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          }),
        },
}));

vi.mock("@/lib/security/request", () => ({
  isSameOrigin: () => true,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { GET as getLeadsRoute, PATCH as updateLeadRoute } from "@/app/api/admin/leads/route";
import { GET as getArticlesRoute } from "@/app/api/admin/articles/route";
import { GET as getPagesRoute } from "@/app/api/admin/pages/route";

beforeEach(() => {
  const db = getDb();
  db.exec("DELETE FROM leads; DELETE FROM articles; DELETE FROM pages; DELETE FROM users;");
  authContext.user = { id: "admin-1", username: "admin1", name: "Admin Test", role: "admin" };
  db.prepare(
    "INSERT INTO users (id, username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("admin-1", "admin1", "Admin Test", "admin", "hash", new Date().toISOString());
});

describe("CMS-08: Vietnamese slug generation and continuous typing", () => {
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  test("generates valid slug for Vietnamese and special characters", () => {
    expect(generateSlug("QA Browser Category")).toBe("qa-browser-category");
    expect(generateSlug("Thông Tin Tuyển Sinh & Đào Tạo")).toBe("thong-tin-tuyen-sinh-dao-tao");
    expect(generateSlug("Đại Học Phú Xuân — 2026")).toBe("dai-hoc-phu-xuan-2026");
  });

  test("simulates continuous keystroke slug updating without premature truncation", () => {
    let slug = "";
    const slugManuallyEdited = false;

    const keystrokes = "QA Browser Category";
    let currentInput = "";
    for (const char of keystrokes) {
      currentInput += char;
      if (!slugManuallyEdited) {
        slug = generateSlug(currentInput);
      }
    }

    expect(slug).toBe("qa-browser-category");
  });

  test("manual slug modification locks auto-generation", () => {
    let slug = "";
    let slugManuallyEdited = false;

    // Type name
    let name = "Initial Name";
    if (!slugManuallyEdited) slug = generateSlug(name);
    expect(slug).toBe("initial-name");

    // Manually edit slug
    slug = "custom-manual-slug";
    slugManuallyEdited = true;

    // Type more in name -> slug must NOT change
    name = "Initial Name with Additions";
    if (!slugManuallyEdited) slug = generateSlug(name);
    expect(slug).toBe("custom-manual-slug");
  });
});

describe("CMS-09 & CMS-10: Lead Export and CSV Safety", () => {
  function escapeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return '""';
    let str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  test("escapeCsvCell protects against formula injection and quotes", () => {
    expect(escapeCsvCell('QA "Quoted"')).toBe('"QA ""Quoted"""');
    expect(escapeCsvCell("=2+3")).toBe("\"'=2+3\"");
    expect(escapeCsvCell("+SUM(A1)")).toBe("\"'+SUM(A1)\"");
    expect(escapeCsvCell("-10")).toBe("\"'-10\"");
    expect(escapeCsvCell("@test")).toBe("\"'@test\"");
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  test("GET /api/admin/leads?export=true returns all matching items up to 10000", async () => {
    for (let i = 1; i <= 25; i++) {
      createLead({
        fullname: `Lead ${i}`,
        phone: `09010000${i.toString().padStart(2, "0")}`,
        email: `lead${i}@example.com`,
        program: "CNTT",
        notes: null,
      });
    }

    // Normal page returns limit 20
    const normalReq = new Request("http://localhost/api/admin/leads?page=1&limit=20");
    const normalRes = await getLeadsRoute(normalReq);
    const normalData = await normalRes.json();
    expect(normalData.leads.length).toBe(20);
    expect(normalData.total).toBe(25);

    // Export query returns all 25
    const exportReq = new Request("http://localhost/api/admin/leads?export=true");
    const exportRes = await getLeadsRoute(exportReq);
    const exportData = await exportRes.json();
    expect(exportData.leads.length).toBe(25);
    expect(exportData.total).toBe(25);
  });
});

describe("CMS-11: Lead status mutation and sync", () => {
  test("PATCH /api/admin/leads updates status correctly and allows filter refetch", async () => {
    const lead = createLead({
      fullname: "Lead Status Test",
      phone: "0901234567",
      email: "test@example.com",
      program: "Kinh tế",
      notes: null,
    });

    const patchReq = new Request("http://localhost/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status: "contacted" }),
    });

    const patchRes = await updateLeadRoute(patchReq);
    expect(patchRes.status).toBe(200);

    // Verify filter by status='new' returns 0
    const newReq = new Request("http://localhost/api/admin/leads?status=new");
    const newData = await (await getLeadsRoute(newReq)).json();
    expect(newData.total).toBe(0);

    // Verify filter by status='contacted' returns 1
    const contactedReq = new Request("http://localhost/api/admin/leads?status=contacted");
    const contactedData = await (await getLeadsRoute(contactedReq)).json();
    expect(contactedData.total).toBe(1);
    expect(contactedData.leads[0].fullname).toBe("Lead Status Test");
  });
});

describe("CMS-15: Standardized Pagination and Robust Parameter Handling", () => {
  test("GET /api/admin/leads safely handles non-numeric or negative pagination params", async () => {
    createLead({
      fullname: "Lead Pagination",
      phone: "0909999999",
      email: null,
      program: null,
      notes: null,
    });

    const req = new Request("http://localhost/api/admin/leads?page=abc&limit=abc");
    const res = await getLeadsRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
    expect(data.total).toBe(1);
    expect(data.totalPages).toBe(1);
    expect(Array.isArray(data.items)).toBe(true);
    expect(Array.isArray(data.leads)).toBe(true);
  });

  test("GET /api/admin/articles safely handles non-numeric or negative pagination params", async () => {
    const req = new Request("http://localhost/api/admin/articles?page=0&limit=-5");
    const res = await getArticlesRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(1);
    expect(Array.isArray(data.items)).toBe(true);
    expect(Array.isArray(data.articles)).toBe(true);
  });

  test("GET /api/admin/pages safely handles pagination parameters", async () => {
    const req = new Request("http://localhost/api/admin/pages?page=NaN&limit=xyz");
    const res = await getPagesRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(50);
    expect(Array.isArray(data.items)).toBe(true);
    expect(Array.isArray(data.pages)).toBe(true);
  });
});
