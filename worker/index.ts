import { Hono } from "hono";

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => {
  return c.json({ name: "Hello!" });
});

app.get("/api/query/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM Pages").all();
  return c.json(results);
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
