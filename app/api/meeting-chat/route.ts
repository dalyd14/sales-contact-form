import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"  

export async function POST(request: NextRequest) {
    const db = getDb();
    const { meetingId, messages } = await request.json();

    const result = await db.query(`
        INSERT INTO meeting_ai_chat (meeting_id, messages)
        VALUES ($1, $2)
        ON CONFLICT (meeting_id) DO UPDATE SET messages = $2
        RETURNING id
    `, [meetingId, JSON.stringify(messages, null, 2)]); 
    
    return NextResponse.json(result.rows[0]);
}