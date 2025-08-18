import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meetingId = id

    const db = getDb();
    const result = await db.query(`
      SELECT 
        m.*,
        p.email as prospect_email,
        p.country as prospect_country,
        p.product_interest,
        p.message as prospect_message,
        p.ai_resources,
        p.resources_completed,
        sr.name as sales_rep_name,
        sr.email as sales_rep_email
      FROM meetings m
      JOIN prospects p ON m.prospect_id = p.id
      JOIN sales_reps sr ON m.sales_rep_id = sr.id
      WHERE m.id = $1
    `, [meetingId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const meeting = {
      id: result.rows[0].id,
      prospect_id: result.rows[0].prospect_id,
      sales_rep_id: result.rows[0].sales_rep_id,
      meeting_date: result.rows[0].meeting_date,
      status: result.rows[0].status,
      ai_resources: result.rows[0].ai_resources,
      resources_completed: result.rows[0].resources_completed,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      prospect_email: result.rows[0].prospect_email,
      prospect_country: result.rows[0].prospect_country,
      product_interest: result.rows[0].product_interest,
      prospect_message: result.rows[0].prospect_message,
      sales_rep_name: result.rows[0].sales_rep_name,
      sales_rep_email: result.rows[0].sales_rep_email,
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error("Error fetching meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
