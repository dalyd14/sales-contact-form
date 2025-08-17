import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId } = body

    // Simple round-robin assignment - get the rep with the fewest meetings
    const db = getDb();
    const result = await db.query(`
      SELECT sr.*, COUNT(m.id) as meeting_count
      FROM sales_reps sr
      LEFT JOIN meetings m ON sr.id = m.sales_rep_id
      GROUP BY sr.id, sr.name, sr.email, sr.created_at
      ORDER BY meeting_count ASC, sr.id ASC
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "No sales reps available" }, { status: 404 })
    }

    const assignedRep = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email
    }

    return NextResponse.json(assignedRep)
  } catch (error) {
    console.error("Error assigning rep:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
