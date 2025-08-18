import { getDb } from "@/lib/db";
import { groq } from "@ai-sdk/groq";
import { UIMessage, convertToModelMessages, generateText } from 'ai';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const meetingId = id

    const db = getDb()

    const result = await db.query(`
        SELECT * FROM meeting_ai_chat WHERE meeting_id = $1
    `, [meetingId])

    let gamePlan = result.rows[0].game_plan

    if (gamePlan.length === 0) {
        // get the form submission from the prospect. it is joined on the meetings table by meetingId to the prospectId, then to the prospects table by prospectId
        const formSubmission = await db.query(`
            SELECT * FROM prospects WHERE id = (
                SELECT prospect_id FROM meetings WHERE id = $1
            )
        `, [meetingId])

        gamePlan = await generateGamePlan(result.rows[0].messages, formSubmission.rows[0])

        await db.query(`
            UPDATE meeting_ai_chat 
            SET game_plan = $1 
            WHERE meeting_id = $2
        `, [JSON.stringify(gamePlan, null, 2), meetingId])
    }

    return NextResponse.json(gamePlan)
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { meetingId } = body

    const db = getDb()

    const result = await db.query(`
        SELECT * FROM meeting_ai_chat WHERE meeting_id = $1
    `, [meetingId])

    const formSubmission = await db.query(`
        SELECT * FROM prospects WHERE id = (
            SELECT prospect_id FROM meetings WHERE id = $1
        )
    `, [meetingId])

    const gamePlan = await generateGamePlan(result.rows[0].messages, formSubmission.rows[0])

    await db.query(`
        UPDATE meeting_ai_chat 
        SET game_plan = $1 
        WHERE meeting_id = $2
    `, [JSON.stringify(gamePlan, null, 2), meetingId])

    return NextResponse.json(gamePlan)
}

export async function generateGamePlan(chatHistory: UIMessage[], formSubmission: any) {

    const { text } = await generateText({
        model: groq("moonshotai/kimi-k2-instruct"),
        system: `

        You are a fact based sales rep assitant that is responsible for summarizing all prospect interactions that are provided to you in the prompt.

        DO NOT make up any information, only use the information that is provided to you in the prompt.

        You will be given the chat history between the prospect and the Vercel AI Chatbot. The Vercel AI chatbot was trained to answer questions about Vercel and also make a point to make 
        a note of any topics or questions that the sales rep needs to address during the meeting with the prospect.

        You will also be given the form submission from the prospect when the booked the meeting. This information will have the prospects email,
        the country in which they are located, the product they are interested in, and any free text response that they provided in the form.

        Please note that these sales reps are experts in their fields and know how to run these meetings at an expert industry standard. 
        You should trust that they know how to run a meeting. DO NOT give them a play-by-play of the meeting, but rather, 
        highlight the most important things that they need to know about the prospect and their needs.

        What they need help with is understanding the underlying context and background for the prospect that they are meeting with. They have several meetings with prospects every
        week, and they need to be able to quickly understand the prospect and their needs. That is where you come in.

        DO NOT give them a play-by-play of the meeting, but rather, highlight the most important things that they need to know about the prospect and their needs.
        And most importantly, you MUST read through the chat history and highlight important take-a-ways that the sales rep should know about the prospect.

        You must respond in Markdown formatting!
        `,
        prompt: `
            Given the following information, come up with a short and concise game plan for the sales rep so that they can master the intro sales call and make 
            sure the prospect is truly impressed by the Vercel Sales Rep level of preparation.

            DO NOT respond with a meeting agenda, but rather, highlight the most important things that the sales rep should know about the prospect and their needs,
            specifically around the additional context that was given in the Chat History.

            Here is the history of the chat between the prospect and the Vercel AI Chatbot. YOU MUST READ THIS THOROUGHLY AND UNDERSTAND THE CONTEXT OF THE PROSPECT:
            Chat History: ${JSON.stringify(chatHistory, null, 2)}

            And then here is the form submission from the prospect when the booked the meeting:
            Form Submission: ${JSON.stringify(formSubmission, null, 2)}
        `
    })

    return text
}