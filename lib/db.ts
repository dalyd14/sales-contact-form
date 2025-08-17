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


// Database types
export interface Prospect {
  id: number
  email: string
  country: string
  product_interest: "vercel" | "v0" | "vercel_and_v0"
  message?: string
  created_at: string
  updated_at: string
}

export interface SalesRep {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Meeting {
  id: number
  prospect_id: number
  sales_rep_id: number
  meeting_date: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  created_at: string
  updated_at: string
}

// Extended types for joins
export interface MeetingWithDetails extends Meeting {
  prospect_email: string
  prospect_country: string
  product_interest: "vercel" | "v0" | "vercel_and_v0"
  prospect_message?: string
  sales_rep_name: string
  sales_rep_email: string
}
