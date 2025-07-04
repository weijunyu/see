import { Hono } from "hono";

const app = new Hono();

app.get("/api/", (c) => {
  return c.json({ name: "Hello!" });
});

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
