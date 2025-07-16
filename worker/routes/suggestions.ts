import { Hono } from "hono";
import type { Env } from "../types/api";
import { DatabaseService } from "../services/database";
import { SuggestionService } from "../services/suggestionService";
import { logger } from "../utils/logger";

const suggestions = new Hono<{ Bindings: Env }>();

suggestions.get("/next-name", async (c) => {
  try {
    const db = new DatabaseService(c.env);
    const suggestionService = new SuggestionService(db);

    const suggestedName = await suggestionService.getNextPageName();

    return c.json({ value: suggestedName });
  } catch (err) {
    logger.error("Failed to get next page name", err, {
      endpoint: "/api/pages/next-name",
      method: "GET",
      requestId: c.req.header("cf-ray"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({ error: "Failed to get next page name" }, 500);
  }
});

export { suggestions };
