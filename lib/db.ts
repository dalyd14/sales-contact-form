// db.ts
import type { QueryResult } from "pg";

// Narrow app-level interface
export type Queryable = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
};

let db: Queryable | null = null;

function isProd() {
  return process.env.ENVIRONMENT === "production";
}

export function getDb(): Queryable {
  if (db) return db;

  if (isProd()) {
    // ---- Neon serverless path ----
    // Works in serverless/edge, no Node TCP sockets required
    const { neon, neonConfig } = require("@neondatabase/serverless");
    // Cache connections across invocations (Vercel/Cloudflare friendly)
    neonConfig.fetchConnectionCache = true;

    const sql = neon(process.env.NEON_DATABASE_URL!);

    // Simple adapter so the rest of your app uses db.query(text, params)
    db = {
      async query(text: string, params?: any[]) {
        // neon client supports $1, $2 params as an array or template-tag style
        // Use the array form for parity with `pg`
        const result = await sql(text, params ?? []);
        // result already in row objects
        return { rows: result as any[] };
      },
    };
  } else {
    // ---- Local Postgres path (pg + Pool) ----
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,                 // sensible local default
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: false,
    });

    db = {
      async query(text: string, params?: any[]) {
        const res: QueryResult = await pool.query(text, params);
        return { rows: res.rows };
      },
    };
  }

  return db;
}
