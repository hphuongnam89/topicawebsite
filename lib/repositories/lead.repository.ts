import "server-only";
import { getDb, transaction } from "@/lib/db/connection";
import type { Lead, LeadStatus } from "@/lib/db/schema";

export interface CreateLeadInput {
  full_name: string;
  phone: string;
  email?: string;
  program_code?: string;
  campus?: string;
  note?: string;
  ip_hash: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  limit?: number;
  offset?: number;
}

export class LeadRepository {
  /**
   * Tạo lead mới từ form đăng ký tư vấn tuyển sinh
   */
  async create(input: CreateLeadInput): Promise<Lead> {
    const db = getDb();
    const result = await db.query(
      `INSERT INTO leads (full_name, phone, email, program_code, campus, note, status, ip_hash)
       VALUES ($1, $2, $3, $4, $5, $6, 'new', $7)
       RETURNING *`,
      [
        input.full_name,
        input.phone,
        input.email || null,
        input.program_code || null,
        input.campus || null,
        input.note || null,
        input.ip_hash,
      ],
    );
    return result.rows[0] as Lead;
  }

  /**
   * Lấy danh sách leads theo bộ lọc trạng thái và phân trang
   */
  async list(filter: LeadFilter = {}): Promise<{ leads: Lead[]; total: number }> {
    const db = getDb();
    const { status, limit = 50, offset = 0 } = filter;

    let whereClause = "";
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      whereClause = `WHERE status = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*)::int as count FROM leads ${whereClause}`,
      params,
    );
    const total = countResult.rows[0]?.count || 0;

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const rowsResult = await db.query(
      `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    return {
      leads: rowsResult.rows as Lead[],
      total,
    };
  }

  /**
   * Tìm lead theo ID
   */
  async findById(id: string): Promise<Lead | null> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM leads WHERE id = $1`, [id]);
    return (result.rows[0] as Lead) || null;
  }

  /**
   * Cập nhật trạng thái xử lý lead
   */
  async updateStatus(id: string, status: LeadStatus, note?: string): Promise<Lead | null> {
    const db = getDb();
    const params: unknown[] = [status, id];
    let noteSql = "";

    if (note !== undefined) {
      params.splice(1, 0, note);
      noteSql = ", note = $2";
    }

    const result = await db.query(
      `UPDATE leads SET status = $1 ${noteSql}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
      params,
    );
    return (result.rows[0] as Lead) || null;
  }

  /**
   * Đếm số lượng leads theo từng trạng thái (dùng cho dashboard)
   */
  async countByStatus(): Promise<Record<string, number>> {
    const db = getDb();
    const result = await db.query(
      `SELECT status, COUNT(*)::int as count FROM leads GROUP BY status`,
    );
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      counts[row.status] = row.count;
    }
    return counts;
  }
}

export const leadRepository = new LeadRepository();
