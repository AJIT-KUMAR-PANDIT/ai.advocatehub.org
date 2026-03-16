import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_CONFIG } from "@/lib/searchConfig";

/**
 * POST /api/ai
 *
 * Body: { message: string, history: Array<{role: "user"|"model", parts: [{text: string}]}>}
 *
 * Returns a streaming Server-Sent Events (SSE) response.
 * Each event is: data: <JSON>\n\n
 *   - { type: "chunk", text: "..." }       — partial AI text
 *   - { type: "sources", sources: [...] }  — grounding sources after stream ends
 *   - { type: "done" }                     — end of stream
 *   - { type: "error", message: "..." }    — on failure
 */
export async function POST(request) {
    try {
        const body    = await request.json();
        const message = body.message?.trim();
        const history = Array.isArray(body.history) ? body.history : [];

        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const { apiKey, model, systemInstruction, groundingConfig, generationConfig } = GEMINI_CONFIG;

        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured. Please add it to your .env.local file." },
                { status: 503 }
            );
        }

        const ai   = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
            model,
            systemInstruction,
            history,
            config: {
                ...generationConfig,
                tools: [groundingConfig],
            },
        });

        // Build a streaming ReadableStream for SSE
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                function send(obj) {
                    controller.enqueue(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));
                }

                try {
                    const response = await chat.sendMessageStream({ message });

                    for await (const chunk of response) {
                        const text = chunk.text?.();
                        if (text) {
                            send({ type: "chunk", text });
                        }
                    }

                    // Extract grounding metadata / sources
                    try {
                        const finalResponse = await response.response;
                        const groundingData = finalResponse?.candidates?.[0]?.groundingMetadata;
                        const sources       = (groundingData?.groundingChunks || [])
                            .map((chunk) => ({
                                title: chunk.web?.title || chunk.retrievedContext?.title || "Source",
                                uri:   chunk.web?.uri   || chunk.retrievedContext?.uri   || "#",
                            }))
                            .filter((s) => s.uri !== "#");

                        if (sources.length > 0) {
                            send({ type: "sources", sources });
                        }
                    } catch {
                        // Sources extraction is best-effort; don't fail the stream
                    }

                    send({ type: "done" });

                } catch (err) {
                    console.error("[ai] Gemini stream error:", err);
                    send({ type: "error", message: err.message || "AI response failed" });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type":  "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection":    "keep-alive",
                "X-Accel-Buffering": "no",
            },
        });

    } catch (err) {
        console.error("[ai] Request parse error:", err);
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
}
