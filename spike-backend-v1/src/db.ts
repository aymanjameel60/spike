import pg from "pg";

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/spike_v1",
});

export async function checkDatabase() {
  const result = await db.query("select now() as now");
  return result.rows[0];
}
