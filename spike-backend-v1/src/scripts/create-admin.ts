import { db } from "../db";

const email = String(process.env.ADMIN_EMAIL || "admin@spike.com").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "Spike2026!");
const name = String(process.env.ADMIN_NAME || "Spike Admin");

const passwordHash = await Bun.password.hash(password);
await db.query(
  `insert into users (email,password_hash,role,name,status)
   values ($1,$2,'admin',$3,'active')
   on conflict (email) do update set password_hash=excluded.password_hash, role='admin', name=excluded.name, status='active', updated_at=now()`,
  [email, passwordHash, name],
);
console.log(`Admin ready: ${email}`);
await db.end();
