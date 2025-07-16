import { Hono } from "hono";
import type { Env } from "../types/api";

const health = new Hono<{ Bindings: Env }>();

health.get("/", (c) => {
  return c.json({ name: "Hello!" });
});

export { health };
