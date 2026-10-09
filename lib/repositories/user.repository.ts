import "server-only";
import { getDb } from "@/lib/db/connection";
import type { UserRole } from "@/lib/db/schema";

export interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: UserRole;
  session_version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  password_hash: string;
  name: string;
  role?: UserRole;
}

export class UserRepository {
  /**
   * Tìm người dùng theo ID
   */
  async findById(id: string): Promise<UserRecord | null> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return (result.rows[0] as UserRecord) || null;
  }

  /**
   * Tìm người dùng theo username
   */
  async findByUsername(username: string): Promise<UserRecord | null> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return (result.rows[0] as UserRecord) || null;
  }

  /**
   * Tạo tài khoản người dùng mới
   */
  async create(input: CreateUserInput): Promise<UserRecord> {
    const db = getDb();
    const result = await db.query(
      `INSERT INTO users (username, password_hash, name, role, session_version)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [input.username, input.password_hash, input.name, input.role || "admin"],
    );
    return result.rows[0] as UserRecord;
  }

  /**
   * Tăng session version để vô hiệu hóa tất cả các token phiên cũ (Revoke Session)
   */
  async incrementSessionVersion(id: string): Promise<number> {
    const db = getDb();
    const result = await db.query(
      `UPDATE users SET session_version = session_version + 1, updated_at = NOW() WHERE id = $1 RETURNING session_version`,
      [id],
    );
    return result.rows[0]?.session_version ?? 0;
  }

  /**
   * Lấy danh sách tất cả người dùng quản trị
   */
  async list(): Promise<UserRecord[]> {
    const db = getDb();
    const result = await db.query(
      `SELECT id, username, name, role, session_version, created_at, updated_at FROM users ORDER BY created_at ASC`,
    );
    return result.rows as UserRecord[];
  }

  /**
   * Cập nhật mật khẩu người dùng
   */
  async updatePassword(id: string, newPasswordHash: string): Promise<boolean> {
    const db = getDb();
    const result = await db.query(
      `UPDATE users SET password_hash = $1, session_version = session_version + 1, updated_at = NOW() WHERE id = $2`,
      [newPasswordHash, id],
    );
    return (result.rowCount || 0) > 0;
  }
}

export const userRepository = new UserRepository();
