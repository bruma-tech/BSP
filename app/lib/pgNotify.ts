import { Pool } from "pg";

const pgNotifyPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
});

export async function notifyUser(userId: string, payload: object): Promise<void> {
  const channel = `notif:user:${userId}`;
  const json = JSON.stringify(payload);
  await pgNotifyPool.query(`NOTIFY "${channel}", $1`, [json]);
}