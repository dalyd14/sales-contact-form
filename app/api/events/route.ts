import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {

    try {
        const body = await request.json()
        const { user_id, event_type, event_name } = body

        const db = getDb()

        await db.query(`
            INSERT INTO events (user_id, event_type, event_name)
            VALUES ($1, $2, $3)
        `, [user_id, event_type, event_name])

        return NextResponse.json({ success: true }, { status: 200 })        
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 })
    }
}
