import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `Welcome to HeadstarterAI Customer Support. How can I assist you with your AI-powered software engineering interviews today?

I can help with interview scheduling, practicing data structures and algorithms, ensuring user privacy, or resolving any technical issues you might be facing.`;


export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: "system",
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(error) {
                controller.error(error)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}