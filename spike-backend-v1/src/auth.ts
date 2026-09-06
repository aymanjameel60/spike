import { SignJWT, jwtVerify } from "jose";
import type { Context, Next } from "hono";

export type SpikeRole = "admin" | "vendor" | "customer";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "spike-dev-change-me");

export async function signToken(user: { id: string; email: string; role: SpikeRole }) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function authRequired(c: Context, next: Next) {
  const header = c.req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return c.json({ message: "Unauthorized" }, 401);
  try {
    const { payload } = await jwtVerify(token, secret);
    c.set("auth", { id: payload.sub, email: payload.email, role: payload.role });
    await next();
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
}

export function allowRoles(...roles: SpikeRole[]) {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth") as { role?: SpikeRole } | undefined;
    if (!auth?.role || !roles.includes(auth.role)) return c.json({ message: "Forbidden" }, 403);
    await next();
  };
}
