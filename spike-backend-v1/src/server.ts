import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { checkDatabase } from "./db";

const app = new Hono();
app.use("*", cors());

app.get("/", (c) => c.json({ name: "Spike API", version: "v1", medusa: false }));
app.get("/health", async (c) => {
  try {
    const database = await checkDatabase();
    return c.json({ status: "ok", database: "connected", time: database.now });
  } catch (error) {
    return c.json({ status: "error", database: "disconnected" }, 503);
  }
});

const port = Number(process.env.PORT || 9100);
serve({ fetch: app.fetch, port });
console.log(`Spike API running on http://localhost:${port}`);
