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

app.get("/api/pages/:name", async (c) => {
  const name = c.req.param("name");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM Pages WHERE name = ?"
  )
    .bind(name)
    .all();

  if (results.length === 0) {
    return c.json({ error: "Page not found" }, 404);
  }

  return c.json(results[0]);
});

app.post("/api/pages/:name", async (c) => {
  const name = c.req.param("name");
  const body = await c.req.json();
  const { content } = body;

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  try {
    const { results } = await c.env.DB.prepare(
      "INSERT INTO Pages (name, content) VALUES (?, ?) RETURNING *"
    )
      .bind(name, content)
      .all();

    return c.json(results[0], 201);
  } catch (error) {
    return c.json({ error: "Failed to create page" }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
