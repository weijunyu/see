import { Hono } from "hono";
import type { Env } from "../types/api";
import { DatabaseService } from "../services/database";
import { PageService } from "../services/pageService";
import { logger } from "../utils/logger";

const recents = new Hono<{ Bindings: Env }>();

recents.get("/", async (c) => {
  try {
    const fetchCount = Number(c.req.query("count")) || 10;

    const db = new DatabaseService(c.env);
    const pageService = new PageService(db);

    const recentPages = await pageService.getRecentPages(fetchCount);
    return c.json(recentPages);
  } catch (err) {
    logger.error("Failed to get recent pages", err);
    return c.json({ error: "Failed to get recent pages" }, 500);
  }
});

export { recents };
