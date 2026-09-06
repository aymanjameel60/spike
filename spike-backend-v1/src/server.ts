import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { db, checkDatabase } from "./db";
import { allowRoles, authRequired, signToken } from "./auth";
import { catalog } from "./routes/catalog";

const app = new Hono();
app.use("*", cors());
app.route("/api/v1", catalog);

app.get("/", (c) => c.json({ name: "Spike API", version: "v1", medusa: false }));
app.get("/health", async (c) => {
  try { const database = await checkDatabase(); return c.json({ status: "ok", database: "connected", time: database.now }); }
  catch { return c.json({ status: "error", database: "disconnected" }, 503); }
});

app.post("/api/v1/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return c.json({ message: "Email and password are required" }, 400);
  const result = await db.query("select id,email,name,role,status,password_hash from users where lower(email)=lower($1) limit 1", [email]);
  const user = result.rows[0];
  if (!user || user.status !== "active" || !(await Bun.password.verify(password, user.password_hash))) return c.json({ message: "Invalid credentials" }, 401);
  return c.json({ token: await signToken(user), user: { id:user.id,email:user.email,name:user.name,role:user.role } });
});

app.use("/api/v1/me", authRequired);
app.get("/api/v1/me", async (c) => {
  const auth = c.get("auth") as { id:string };
  const result = await db.query("select id,email,name,phone,role,status,created_at from users where id=$1", [auth.id]);
  return c.json({ user: result.rows[0] || null });
});

app.use("/api/v1/admin/*", authRequired, allowRoles("admin"));
app.get("/api/v1/admin/ping", (c) => c.json({ ok:true,scope:"admin" }));
app.use("/api/v1/vendor/*", authRequired, allowRoles("vendor","admin"));
app.get("/api/v1/vendor/ping", (c) => c.json({ ok:true,scope:"vendor" }));

const port = Number(process.env.PORT || 9100);
serve({ fetch: app.fetch, port });
console.log(`Spike API running on http://localhost:${port}`);
