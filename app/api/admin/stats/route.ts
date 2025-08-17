import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    // Get total meetings
    const db = getDb();
    const totalMeetingsResult = await db.query(`
      SELECT COUNT(*) as count FROM meetings
    `)
    const totalMeetings = Number(totalMeetingsResult.rows[0].count)

    // Get upcoming meetings
    const upcomingMeetingsResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM meetings 
      WHERE meeting_date >= NOW() AND status = 'scheduled'
    `)
    const upcomingMeetings = Number(upcomingMeetingsResult.rows[0].count)

    // Get completed meetings
    const completedMeetingsResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM meetings 
      WHERE status = 'completed'
    `)
    const completedMeetings = Number(completedMeetingsResult.rows[0].count)

    // Get total prospects
    const totalProspectsResult = await db.query(`
      SELECT COUNT(*) as count FROM prospects
    `)
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
