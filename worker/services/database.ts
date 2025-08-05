import type { Env, Page, CounterResult } from "../types/api";

export class DatabaseService {
  constructor(private env: Env) {}

  async getRecentPages(limit: number): Promise<Page[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT *,
        datetime(created_at, 'unixepoch') as created_at,
        datetime(updated_at, 'unixepoch') as updated_at,
        datetime(deleted_at, 'unixepoch') as deleted_at
        FROM pages
        WHERE deleted_at IS NULL OR deleted_at > unixepoch()
        ORDER BY updated_at DESC
        LIMIT ?`
    )
      .bind(limit)
      .all();

    return results as unknown as Page[];
  }

  async getAllPages(): Promise<Page[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT *,
        datetime(created_at, 'unixepoch') as created_at,
        datetime(updated_at, 'unixepoch') as updated_at,
        datetime(deleted_at, 'unixepoch') as deleted_at
        FROM pages
        WHERE deleted_at IS NULL OR deleted_at > unixepoch()`
    ).all();

    return results as unknown as Page[];
  }

  async getPageByName(name: string): Promise<Page | null> {
    const readStatement = this.env.DB.prepare(`SELECT *,
        datetime(created_at, 'unixepoch') as created_at,
        datetime(updated_at, 'unixepoch') as updated_at,
        datetime(deleted_at, 'unixepoch') as deleted_at
        FROM pages
        WHERE name = ? AND (deleted_at IS NULL OR deleted_at > unixepoch())`);
    const deleteStatement = this.env.DB.prepare(
      `delete from pages where name = ? and view_once_only = 1`
    );

    const batchResult = await this.env.DB.batch([
      readStatement.bind(name),
      deleteStatement.bind(name),
    ]);

    const readResults = batchResult[0].results as Page[];

    return readResults[0] ? readResults[0] : null;
  }

  async checkPageExists(name: string): Promise<boolean> {
    const { results } = await this.env.DB.prepare(
      `SELECT id FROM pages WHERE name = ? AND (deleted_at IS NULL OR deleted_at > unixepoch())`
    )
      .bind(name)
      .all();

    return results.length > 0;
  }

  async getExpiredPageByName(name: string): Promise<{ id: number } | null> {
    const { results } = await this.env.DB.prepare(
      `SELECT id FROM pages WHERE name = ? AND deleted_at IS NOT NULL AND deleted_at <= unixepoch()`
    )
      .bind(name)
      .all();

    return results.length > 0 ? (results[0] as { id: number }) : null;
  }

  async deletePageById(id: number): Promise<void> {
    await this.env.DB.prepare(`DELETE FROM pages WHERE id = ?`).bind(id).run();
  }

  async createPage(
    name: string,
    content: string,
    encrypted: boolean,
    deletedAt: number | null,
    viewOnceOnly: boolean | null
  ): Promise<Page> {
    const { results } = await this.env.DB.prepare(
      `INSERT INTO pages (name, content, encrypted, deleted_at, view_once_only) VALUES (?, ?, ?, ?, ?) RETURNING *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at,
      datetime(deleted_at, 'unixepoch') as deleted_at`
    )
      .bind(name, content, encrypted, deletedAt, viewOnceOnly)
      .all();

    return results[0] as unknown as Page;
  }

  async incrementCounter(): Promise<number> {
    const { results } = await this.env.DB.prepare(
      `UPDATE appdata SET integer_value = integer_value + 1 
       WHERE key = 'page_name_counter' 
       RETURNING integer_value - 1 as counter_value`
    ).all();

    return (results[0] as unknown as CounterResult).counter_value;
  }
}
