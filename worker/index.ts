import { Hono } from "hono";
import type { Env } from "./types/api";
import { health } from "./routes/health";
import { pages } from "./routes/pages";
import { suggestions } from "./routes/suggestions";
import { recents } from "./routes/recents";

const app = new Hono<{ Bindings: Env }>();

// Health check route
app.route("/api", health);

// Page management routes
app.route("/api/pages", pages);
app.route("/api/recents", recents);
app.route("/api/suggestions", suggestions);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
