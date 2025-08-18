import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"  

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const meetingId = id || ""

        const db = getDb();

        const result = await db.query(`
            SELECT messages FROM meeting_ai_chat WHERE meeting_id = $1
        `, [meetingId]); 
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Error fetching meeting chat:", error);
        return NextResponse.json({ error: "Failed to fetch meeting chat" }, { status: 500 });
    }
}