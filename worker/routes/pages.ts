import { Hono } from "hono";
import type { Env, CreatePageRequest } from "../types/api";
import { DatabaseService } from "../services/database";
import { PageService } from "../services/pageService";
import { logger } from "../utils/logger";

const pages = new Hono<{ Bindings: Env }>();

pages.get("/:name", async (c) => {
  try {
    const name = c.req.param("name");

    const db = new DatabaseService(c.env);
    const pageService = new PageService(db);

    const page = await pageService.getPageByName(name);

    if (!page) {
      return c.json({ error: "Page not found" }, 404);
    }

    return c.json(page);
  } catch (err) {
    logger.error("Failed to get page", err, { pageName: c.req.param("name") });
    return c.json({ error: "Failed to get page" }, 500);
  }
});

pages.post("/:name", async (c) => {
  const name = c.req.param("name");
  let body: CreatePageRequest | undefined;

  try {
    body = await c.req.json();

    if (!body || !body.content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const db = new DatabaseService(c.env);
    const pageService = new PageService(db);

    const createdPage = await pageService.createPage(name, body);
    return c.json(createdPage, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      return c.json({ error: err.message }, 409);
    }

    logger.error("Failed to create page", err, {
      pageName: name,
      encrypted: body?.encrypted,
      contentLength: body?.content?.length,
      expiresInHours: body?.expires_in_hours,
      requestId: c.req.header("cf-ray"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({ error: "Failed to create page" }, 500);
  }
});

export { pages };
