import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospectId, resourceId } = body

    const db = getDb()
    const prospectResources = await db.query(`
        SELECT resources_completed FROM prospects WHERE id = $1
    `, [prospectId])

    const resourcesCompleted = prospectResources.rows[0].resources_completed || []

    if (resourcesCompleted.includes(resourceId)) {
        return NextResponse.json({ message: "Resource already completed" }, { status: 200 })
    }

    resourcesCompleted.push(resourceId)

    await db.query(`
        UPDATE prospects
        SET resources_completed = $1
        WHERE id = $2
    `, [JSON.stringify(resourcesCompleted, null, 2), prospectId])

    return NextResponse.json({ message: "Resource completed" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}