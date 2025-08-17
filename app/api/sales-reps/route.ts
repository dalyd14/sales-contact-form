import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = getDb();
    const salesReps = await db.query(`
      SELECT id, name, email, created_at
      FROM sales_reps
      ORDER BY name ASC
    `)

    return NextResponse.json(salesReps.rows)
  } catch (error) {
    console.error("Error fetching sales reps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
