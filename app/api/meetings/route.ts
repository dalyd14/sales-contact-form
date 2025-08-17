import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"  

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId, salesRepId, meetingDate } = body

    // Validate required fields
    if (!prospectId || !salesRepId || !meetingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert meeting into database
    const db = getDb();
    const result = await db.query(`
      INSERT INTO meetings (prospect_id, sales_rep_id, meeting_date, status)
      VALUES ($1, $2, $3, 'scheduled')
      RETURNING id
    `, [prospectId, salesRepId, meetingDate])

    const meetingId = result.rows[0].id

    return NextResponse.json({ meetingId })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salesRepId = searchParams.get("salesRepId")
    const prospectId = searchParams.get("prospectId")

    let query
    if (salesRepId) {
      // Get meetings for specific sales rep
      const db = getDb();
      query = await db.query(`
        SELECT 
          m.*,
          p.email as prospect_email,
          p.country as prospect_country,
          p.product_interest,
          p.message as prospect_message,
          sr.name as sales_rep_name,
          sr.email as sales_rep_email
        FROM meetings m
        JOIN prospects p ON m.prospect_id = p.id
        JOIN sales_reps sr ON m.sales_rep_id = sr.id
        WHERE m.sales_rep_id = $1
        AND m.meeting_date >= NOW()
        ORDER BY m.meeting_date ASC
      `, [Number.parseInt(salesRepId)])
    } else if (prospectId) {
        // Get most recent meeting for a given prospect id
        const db = getDb();
        query = await db.query(`
          SELECT 
            m.*,
            p.email as prospect_email,
            p.country as prospect_country,
            p.product_interest,
            p.message as prospect_message,
            sr.name as sales_rep_name,
            sr.email as sales_rep_email
          FROM meetings m
          JOIN prospects p ON m.prospect_id = p.id
          JOIN sales_reps sr ON m.sales_rep_id = sr.id
          WHERE m.prospect_id = $1
          AND m.meeting_date >= NOW()
          ORDER BY m.meeting_date DESC
          LIMIT 1
        `, [Number.parseInt(prospectId)])
    } else {
      // Get all upcoming meetings
      const db = getDb();
      query = await db.query(`
        SELECT 
          m.*,
          p.email as prospect_email,
          p.country as prospect_country,
          p.product_interest,
          p.message as prospect_message,
          sr.name as sales_rep_name,
          sr.email as sales_rep_email
        FROM meetings m
        JOIN prospects p ON m.prospect_id = p.id
        JOIN sales_reps sr ON m.sales_rep_id = sr.id
        WHERE m.meeting_date >= NOW()
        ORDER BY m.meeting_date ASC
      `,)
    }

    const meetings = await query

    return NextResponse.json(meetings.rows)
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
