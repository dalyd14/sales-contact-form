import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
    const { user_id } = await params
    // get all searchParams of the request
    // see if there is an event_type and event_name query param
    const searchParams = request.nextUrl.searchParams
    const event_type = searchParams.get("event_type")
    const event_name = searchParams.get("event_name")

    const db = getDb()

    let whereClause = `WHERE user_id = $1`

    // if there is an event_type and event_name, create an event
    if (event_type || event_name) {
        // build where clause
        if (event_type && !event_name) {
            whereClause += ` AND event_type = ${event_type}`
        } else if (!event_type && event_name) {
            whereClause += ` AND event_name = ${event_name}`
        } else if (event_type && event_name) {
            whereClause += ` AND event_type = ${event_type} AND event_name = ${event_name}`
        }
    }

    const result = await db.query(`
        SELECT * FROM events
        ${whereClause}
    `, [user_id])

    return NextResponse.json({ events: result.rows }, { status: 200 })
}