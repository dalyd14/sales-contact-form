import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const salesRepId = searchParams.get("salesRepId")

  console.log("salesRepId", salesRepId)

  try {
    // Get total meetings
    const db = getDb();
    let totalMeetingsResult = null;
    if (salesRepId) {
      totalMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings WHERE sales_rep_id = $1
      `, [salesRepId])
    } else {
      totalMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings
      `,)
    }
    const totalMeetings = Number(totalMeetingsResult.rows[0].count)

    // Get upcoming meetings
    let upcomingMeetingsResult = null;
    if (salesRepId) {
      upcomingMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings WHERE sales_rep_id = $1 AND meeting_date >= NOW() AND status = 'scheduled'
      `, [salesRepId])
    } else {
      upcomingMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings WHERE meeting_date >= NOW() AND status = 'scheduled'
      `,)
    }
    const upcomingMeetings = Number(upcomingMeetingsResult.rows[0].count)

    // Get completed meetings
    let completedMeetingsResult = null;
    if (salesRepId) {
      completedMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings WHERE sales_rep_id = $1 AND status = 'completed'
      `, [salesRepId])
    } else {
      completedMeetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meetings WHERE status = 'completed'
      `,)
    }
    const completedMeetings = Number(completedMeetingsResult.rows[0].count)

    // Get total prospects
    let totalProspectsResult = null;
    if (salesRepId) {
      totalProspectsResult = await db.query(`
        SELECT COUNT(distinct(prospect_id)) as count FROM meetings WHERE sales_rep_id = $1
      `, [salesRepId])
    } else {
      totalProspectsResult = await db.query(`
        SELECT COUNT(*) as count FROM prospects
      `,)
    }
    const totalProspects = Number(totalProspectsResult.rows[0].count)

    const stats = {
      totalMeetings,
      upcomingMeetings,
      completedMeetings,
      totalProspects,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
