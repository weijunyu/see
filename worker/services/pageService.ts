import type { Page, CreatePageRequest } from "../types/api";
import { DatabaseService } from "./database";

export class PageService {
  constructor(private db: DatabaseService) {}

  async getRecentPages(count: number = 10): Promise<Page[]> {
    return await this.db.getRecentPages(count);
  }

  async getAllPages(): Promise<Page[]> {
    return await this.db.getAllPages();
  }

  async getPageByName(name: string): Promise<Page | null> {
    return await this.db.getPageByName(name);
  }

  async createPage(name: string, request: CreatePageRequest): Promise<Page> {
    const {
      content,
      encrypted = false,
      expires_in_hours,
      view_once_only: viewOnceOnly = null,
    } = request;

    // Check if page exists and is not expired
    const pageExists = await this.db.checkPageExists(name);
    if (pageExists) {
      throw new Error(`Page "${name}" already exists`);
    }

    // Check if there's an expired page we can overwrite
    const expiredPage = await this.db.getExpiredPageByName(name);
    if (expiredPage) {
      await this.db.deletePageById(expiredPage.id);
    }

    // Calculate expiry timestamp if provided
    let deletedAt = null;
    if (expires_in_hours && expires_in_hours > 0) {
      const expiryTime = Date.now() + expires_in_hours * 60 * 60 * 1000;
      deletedAt = Math.floor(expiryTime / 1000);
    }

    return await this.db.createPage(
      name,
      content,
      encrypted,
      deletedAt,
      viewOnceOnly
    );
  }
}
