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

app.get("/api/recents/", async (c) => {
  const fetchCount = c.req.query("count") ?? 10;
  const { results } = await c.env.DB.prepare(
    `select *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at
      from pages
      order by updated_at desc
      limit ?`
  )
    .bind(fetchCount)
    .all();

  return c.json(results);
});

app.get("/api/pages/:name", async (c) => {
  const name = c.req.param("name");
  const { results } = await c.env.DB.prepare(
    `select *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at
      from pages
      where name = ?`
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
  const body: { content: string; encrypted?: boolean } = await c.req.json();
  const { content, encrypted = false } = body;

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  try {
    // Check if page already exists
    const { results: existingPages } = await c.env.DB.prepare(
      `select id from pages where name = ?`
    )
      .bind(name)
      .all();

    if (existingPages.length > 0) {
      return c.json({ error: `Page "${name}" already exists` }, 409);
    }

    // Create new page if it doesn't exist
    const { results } = await c.env.DB.prepare(
      `insert into pages (name, content, encrypted) values (?, ?, ?) returning *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at`
    )
      .bind(name, content, encrypted)
      .all();

    return c.json(results[0], 201);
  } catch (err) {
    console.error("Error creating page:", err);
    return c.json({ error: "Failed to create page" }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
