import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
    buildOpenAICompatibleChatUrl,
    GEMINI_CONFIG,
    resolveCustomLlmConfig,
} from "@/lib/searchConfig";

/**
 * POST /api/ai
 *
 * Body:
 * {
 *   message: string,
 *   history: Array<{role: "user"|"model", parts: [{text: string}]}>,
 *   llmConfig?: {
 *     enabled?: boolean,
 *     url?: string,
 *     baseUrl?: string,
 *     apiKey?: string,
 *     model?: string
 *   }
 * }
 *
 * Returns a streaming Server-Sent Events (SSE) response.
 * Each event is: data: <JSON>\n\n
 *   - { type: "chunk", text: "..." }       - partial AI text
 *   - { type: "sources", sources: [...] }  - grounding sources after stream ends
 *   - { type: "done" }                     - end of stream
 *   - { type: "error", message: "..." }    - on failure
 */
function extractTextContent(content) {
    if (!content) {
        return "";
    }

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content.map((part) => {
            if (typeof part === "string") {
                return part;
            }

            if (typeof part?.text === "string") {
                return part.text;
            }

            return "";
        }).join("");
    }

    if (typeof content?.text === "string") {
        return content.text;
    }

    return "";
}

function historyToOpenAIMessages(history = []) {
    return history
        .map((item) => {
            const content = extractTextContent(item?.parts || []);

            if (!content.trim()) {
                return null;
            }

            return {
                role: item.role === "model" ? "assistant" : "user",
                content,
            };
        })
        .filter(Boolean);
}

function getErrorMessage(errorText, status) {
    try {
        const parsed = JSON.parse(errorText);
        return parsed?.error?.message || parsed?.message || `Custom LLM request failed (${status})`;
    } catch {
        return errorText?.trim() || `Custom LLM request failed (${status})`;
    }
}

async function streamGeminiResponse({ message, history, send }) {
    const { apiKey, model, systemInstruction, groundingConfig, generationConfig } = GEMINI_CONFIG;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error("GEMINI_API_KEY is not configured. Please add it to your .env file.");
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

    const response = await chat.sendMessageStream({ message });

    for await (const chunk of response) {
        const text = chunk.text?.();

        if (text) {
            send({ type: "chunk", text });
        }
    }

    try {
        const finalResponse = await response.response;
        const groundingData = finalResponse?.candidates?.[0]?.groundingMetadata;
        const sources       = (groundingData?.groundingChunks || [])
            .map((chunk) => ({
                title: chunk.web?.title || chunk.retrievedContext?.title || "Source",
                uri:   chunk.web?.uri   || chunk.retrievedContext?.uri   || "#",
            }))
            .filter((source) => source.uri !== "#");

        if (sources.length > 0) {
            send({ type: "sources", sources });
        }
    } catch {
        // Sources are best-effort for Gemini grounding only.
    }
}

async function streamCustomLlmResponse({ message, history, llmConfig, send }) {
    let endpoint;

    try {
        endpoint = buildOpenAICompatibleChatUrl(llmConfig.url);
    } catch {
        throw new Error("Custom LLM URL is invalid.");
    }

    const headers = {
        "Content-Type": "application/json",
    };

    if (llmConfig.apiKey) {
        headers.Authorization = `Bearer ${llmConfig.apiKey}`;
    }

    const upstream = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: llmConfig.model,
            messages: [
                { role: "system", content: llmConfig.systemPrompt },
                ...historyToOpenAIMessages(history),
                { role: "user", content: message },
            ],
            temperature: llmConfig.temperature,
            max_tokens: llmConfig.maxTokens,
            stream: true,
        }),
    });

    if (!upstream.ok) {
        const errorText = await upstream.text();
        throw new Error(getErrorMessage(errorText, upstream.status));
    }

    if (!upstream.body) {
        throw new Error("Custom LLM returned an empty response.");
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const payload = await upstream.json();
        const text    = extractTextContent(
            payload?.choices?.[0]?.message?.content || payload?.output_text || payload?.response
        );

        if (text) {
            send({ type: "chunk", text });
        }

        return;
    }

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
            const data = event
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.replace(/^data:\s?/, ""))
                .join("");

            if (!data || data === "[DONE]") {
                continue;
            }

            try {
                const payload = JSON.parse(data);
                const delta   = extractTextContent(payload?.choices?.[0]?.delta?.content);
                const text    = delta || extractTextContent(payload?.choices?.[0]?.message?.content);

                if (text) {
                    send({ type: "chunk", text });
                }
            } catch {
                // Skip malformed upstream SSE chunks.
            }
        }
    }

    if (buffer.trim()) {
        const tail = buffer
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.replace(/^data:\s?/, ""))
            .join("");

        if (tail && tail !== "[DONE]") {
            try {
                const payload = JSON.parse(tail);
                const text    = extractTextContent(payload?.choices?.[0]?.delta?.content)
                    || extractTextContent(payload?.choices?.[0]?.message?.content);

                if (text) {
                    send({ type: "chunk", text });
                }
            } catch {
                // Ignore trailing incomplete chunks.
            }
        }
    }
}

export async function POST(request) {
    try {
        const body    = await request.json();
        const message = body.message?.trim();
        const history = Array.isArray(body.history) ? body.history : [];
        const llmConfig = resolveCustomLlmConfig(body.llmConfig);

        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        if (llmConfig.enabled && !llmConfig.isConfigured) {
            return NextResponse.json(
                { error: `Custom LLM is missing: ${llmConfig.missingFields.join(", ")}.` },
                { status: 400 }
            );
        }

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                function send(obj) {
                    controller.enqueue(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));
                }

                try {
                    if (llmConfig.shouldUse) {
                        await streamCustomLlmResponse({ message, history, llmConfig, send });
                    } else {
                        await streamGeminiResponse({ message, history, send });
                    }

                    send({ type: "done" });
                } catch (err) {
                    console.error("[ai] Stream error:", err);
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
