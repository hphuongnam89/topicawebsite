import "server-only";
import { getDb } from "@/lib/db/connection";

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parent_id?: string | null;
}

export class CategoryRepository {
  /**
   * Tạo danh mục mới
   */
  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    const db = getDb();
    const result = await db.query(
      `INSERT INTO categories (name, slug, parent_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.name, input.slug, input.parent_id || null],
    );
    return result.rows[0] as CategoryRecord;
  }

  /**
   * Tìm danh mục theo Slug
   */
  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM categories WHERE slug = $1`, [slug]);
    return (result.rows[0] as CategoryRecord) || null;
  }

  /**
   * Tìm danh mục theo ID
   */
  async findById(id: string): Promise<CategoryRecord | null> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM categories WHERE id = $1`, [id]);
    return (result.rows[0] as CategoryRecord) || null;
  }

  /**
   * Lấy toàn bộ danh sách danh mục (sắp xếp theo tên)
   */
  async listAll(): Promise<CategoryRecord[]> {
    const db = getDb();
    const result = await db.query(`SELECT * FROM categories ORDER BY name ASC`);
    return result.rows as CategoryRecord[];
  }

  /**
   * Lấy danh mục con của một danh mục cha
   */
  async listChildren(parentId: string): Promise<CategoryRecord[]> {
    const db = getDb();
    const result = await db.query(
      `SELECT * FROM categories WHERE parent_id = $1 ORDER BY name ASC`,
      [parentId],
    );
    return result.rows as CategoryRecord[];
  }

  /**
   * Cập nhật danh mục
   */
  async update(id: string, input: Partial<CreateCategoryInput>): Promise<CategoryRecord | null> {
    const db = getDb();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      values.push(input.name);
      fields.push(`name = $${values.length}`);
    }
    if (input.slug !== undefined) {
      values.push(input.slug);
      fields.push(`slug = $${values.length}`);
    }
    if (input.parent_id !== undefined) {
      values.push(input.parent_id);
      fields.push(`parent_id = $${values.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await db.query(
      `UPDATE categories SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return (result.rows[0] as CategoryRecord) || null;
  }

  /**
   * Xóa danh mục
   */
  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.query(`DELETE FROM categories WHERE id = $1`, [id]);
    return (result.rowCount || 0) > 0;
  }
}

export const categoryRepository = new CategoryRepository();
