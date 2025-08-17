import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, country, product_interest, message } = body

    // Validate required fields
    if (!email || !country || !product_interest) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getDb();

    // Insert prospect into database
    const result = await db.query(`
      INSERT INTO prospects (email, country, product_interest, message)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        country = EXCLUDED.country,
        product_interest = EXCLUDED.product_interest,
        message = EXCLUDED.message,
        updated_at = NOW()
      RETURNING id
    `, [email, country, product_interest, message])

    const prospectId = result.rows[0].id

    return NextResponse.json({ prospectId })
  } catch (error) {
    console.error("Error creating prospect:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
