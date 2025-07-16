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
  try {
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    while (attempts < maxAttempts) {
      // Get and increment counter
      const { results }: { results: { counter_value: number }[] } =
        await c.env.DB.prepare(
          `UPDATE appdata SET integer_value = integer_value + 1 
           WHERE key = 'page_name_counter' 
           RETURNING integer_value - 1 as counter_value`
        ).all();

      const counterValue = results[0]["counter_value"];
      const suggestedName = encodeBase26(counterValue);

      // Check if page with this name already exists and is not expired
      const { results: existingPages } = await c.env.DB.prepare(
        `SELECT id FROM pages WHERE name = ? AND (deleted_at IS NULL OR deleted_at > unixepoch())`
      )
        .bind(suggestedName)
        .all();

      // If no conflict, return this suggestion
      if (existingPages.length === 0) {
        return c.json({ value: suggestedName });
      }

      attempts++;
    }

    // Fallback if we somehow hit max attempts
    return c.json({ error: "Unable to generate unique page name" }, 500);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Failed to get next page name",
        error: {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
        context: {
          endpoint: "/api/pages/next-name",
          method: "GET",
          requestId: c.req.header("cf-ray"),
          userAgent: c.req.header("user-agent"),
          timestamp: new Date().toISOString(),
        },
      })
    );
    return c.json({ error: "Failed to get next page name" }, 500);
  }
});

app.get("/api/query/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at,
      datetime(deleted_at, 'unixepoch') as deleted_at
      FROM pages
      WHERE deleted_at IS NULL OR deleted_at > unixepoch()`
  ).all();

  return c.json(results);
});

app.get("/api/recents/", async (c) => {
  const fetchCount = c.req.query("count") ?? 10;

  const { results } = await c.env.DB.prepare(
    `SELECT *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at,
      datetime(deleted_at, 'unixepoch') as deleted_at
      FROM pages
      WHERE deleted_at IS NULL OR deleted_at > unixepoch()
      ORDER BY updated_at DESC
      LIMIT ?`
  )
    .bind(fetchCount)
    .all();

  return c.json(results);
});

app.get("/api/pages/:name", async (c) => {
  const name = c.req.param("name");

  const { results } = await c.env.DB.prepare(
    `SELECT *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at,
      datetime(deleted_at, 'unixepoch') as deleted_at
      FROM pages
      WHERE name = ? AND (deleted_at IS NULL OR deleted_at > unixepoch())`
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
  const body: {
    content: string;
    encrypted?: boolean;
    expires_in_hours?: number;
  } = await c.req.json();
  const { content, encrypted = false, expires_in_hours } = body;

  if (!content) {
    return c.json({ error: "Content is required" }, 400);
  }

  try {
    // 1 Check if page exists and is not expired
    const { results: existingPages } = await c.env.DB.prepare(
      `SELECT id FROM pages WHERE name = ? AND (deleted_at IS NULL OR deleted_at > unixepoch())`
    )
      .bind(name)
      .all();

    if (existingPages.length > 0) {
      // Page exists and is not expired, return conflict
      return c.json({ error: `Page "${name}" already exists` }, 409);
    }

    // 2 Check if there's an expired page we can overwrite
    const { results: expiredPages } = await c.env.DB.prepare(
      `SELECT id FROM pages WHERE name = ? AND deleted_at IS NOT NULL AND deleted_at <= unixepoch()`
    )
      .bind(name)
      .all();

    if (expiredPages.length > 0) {
      // Delete the expired page first
      await c.env.DB.prepare(`DELETE FROM pages WHERE id = ?`)
        .bind((expiredPages[0] as { id: number }).id)
        .run();
    }

    // 3 Create the new page

    // Calculate expiry timestamp if provided
    let deleted_at = null;
    if (expires_in_hours && expires_in_hours > 0) {
      const expiryTime = Date.now() + expires_in_hours * 60 * 60 * 1000;
      deleted_at = Math.floor(expiryTime / 1000); // Convert to Unix timestamp
    }

    const { results } = await c.env.DB.prepare(
      `INSERT INTO pages (name, content, encrypted, deleted_at) VALUES (?, ?, ?, ?) RETURNING *,
      datetime(created_at, 'unixepoch') as created_at,
      datetime(updated_at, 'unixepoch') as updated_at,
      datetime(deleted_at, 'unixepoch') as deleted_at`
    )
      .bind(name, content, encrypted, deleted_at)
      .all();

    return c.json(results[0], 201);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Failed to create page",
        error: {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
        context: {
          pageName: name,
          encrypted: encrypted,
          contentLength: content.length,
          expiresInHours: expires_in_hours,
          requestId: c.req.header("cf-ray"),
          userAgent: c.req.header("user-agent"),
          timestamp: new Date().toISOString(),
        },
      })
    );

    return c.json({ error: "Failed to create page" }, 500);
  }
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
