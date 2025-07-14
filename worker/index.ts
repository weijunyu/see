import { Hono } from "hono";

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

function encodeBase26(num: number): string {
  if (num === 0) return "a";

  let result = "";
  let n = num;
  while (n >= 0) {
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return result;
}

app.get("/api/", (c) => {
  return c.json({ name: "Hello!" });
});

app.get("/api/pages/next-name", async (c) => {
  const { results }: { results: { counter_value: number }[] } =
    await c.env.DB.prepare(
      `UPDATE appdata SET integer_value = integer_value + 1 
     WHERE key = 'page_name_counter' 
     RETURNING integer_value - 1 as counter_value`
    ).all();

  if (results.length === 0) {
    return c.json({ error: "No data found for page name counter" }, 500);
  }

  const counterValue = results[0]["counter_value"];

  return c.json({
    value: encodeBase26(counterValue),
  });
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
    const { results } = await c.env.DB.prepare(
      `insert into pages (name, content, encrypted) values (?, ?, ?) returning *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at`
    )
      .bind(name, content, encrypted)
      .all();

    return c.json(results[0], 201);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Failed to create page",
          error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
          },
          context: {
            pageName: name,
            encrypted: encrypted,
            contentLength: content.length,
            requestId: c.req.header("cf-ray"), // Cloudflare request ID
            userAgent: c.req.header("user-agent"),
            timestamp: new Date().toISOString(),
          },
        })
      );
    }

    // Check if it's a unique constraint violation
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      return c.json({ error: `Page "${name}" already exists` }, 409);
    }

    return c.json({ error: "Failed to create page" }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
