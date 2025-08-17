import { groq } from "@ai-sdk/groq";
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export async function POST(request: Request) {

    const { messages, meetingId }: { messages: UIMessage[]; meetingId: string } = await request.json()

    const result = streamText({
        model: groq("moonshotai/kimi-k2-instruct"),
        system: `
        You are a helpful assistant that can answer questions about Vercel for prospects that are waiting for their meeting with a Vercel Sales Rep.

        Your role is to be available to answer questions, ask clarifying questions, and for anything you do not know, or may not be a positive light for Vercel, you should tell the prospect
        that you will make a note of it so that the Sales Rep can address it during the meeting.

        The highest priority is to gather enough context and additional information so that the Sales Rep can have a better understanding of the prospect and their needs, and
        so that the Sales Rep knows what specific topics to address during the meeting.

        As mentioned before, your fallback should be to tell the prospect that you will make a note of it so that the Sales Rep can address it during the meeting.
        You must never talk negatively about Vercel, or anything that is not a positive light, but you also must never lie or hallucinate, 
        if you are unsure, you should mention that you will make a note of it for the Sales Rep to cover during the meeting.
        `,
        messages: convertToModelMessages(messages),
        onFinish: ({ response }) => {
            // Send the message histroy to the meeting-chat endpoint
            const messageHistory = [
                ...messages,
                ...response.messages
            ]

            fetch(`${process.env.API_BASE_URL}/api/meeting-chat`, {
                method: "POST",
                body: JSON.stringify({
                    meetingId: meetingId,
                    messages: messageHistory
                })
            })
            
        },
        onError: (error) => {
            console.log("Error:", error)
        }
    })

    return result.toUIMessageStreamResponse()
}