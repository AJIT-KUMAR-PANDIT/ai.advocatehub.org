import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";
import {
    DOC_MIME_TYPE,
    DOCX_MIME_TYPE,
    getAttachmentKind,
    getAttachmentMimeType,
    MAX_ATTACHMENT_COUNT,
    MAX_ATTACHMENT_TEXT_CHARS,
    MAX_TOTAL_ATTACHMENT_BYTES,
    TEXT_MIME_TYPE,
} from "@/lib/attachmentUtils";
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
 *   attachments?: Array<{
 *     id?: string,
 *     name: string,
 *     mimeType: string,
 *     size?: number,
 *     dataUrl: string
 *   }>,
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

function normalizeExtractedText(text = "") {
    const cleaned = text
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!cleaned) {
        return "";
    }

    if (cleaned.length <= MAX_ATTACHMENT_TEXT_CHARS) {
        return cleaned;
    }

    return `${cleaned.slice(0, MAX_ATTACHMENT_TEXT_CHARS)}\n\n[Truncated for length]`;
}

function prepareAttachments(rawAttachments = []) {
    if (!Array.isArray(rawAttachments)) {
        return [];
    }

    const attachments = rawAttachments.map((attachment, index) => {
        const name     = attachment?.name?.trim();
        const mimeType = getAttachmentMimeType({ mimeType: attachment?.mimeType, name });
        const dataUrl  = attachment?.dataUrl;

        if (!name || !mimeType || typeof dataUrl !== "string") {
            throw new Error(`Attachment ${index + 1} is invalid or unsupported.`);
        }

        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

        if (!match) {
            throw new Error(`Attachment ${name} is missing file data.`);
        }

        const [, dataUrlMimeType, base64] = match;
        const resolvedDataUrlMimeType = getAttachmentMimeType({ mimeType: dataUrlMimeType, name });

        if (resolvedDataUrlMimeType !== mimeType) {
            throw new Error(`Attachment ${name} has an unexpected MIME type.`);
        }

        const buffer = Buffer.from(base64, "base64");

        return {
            id:       attachment.id || `${name}-${index}`,
            name,
            mimeType,
            size:     Number.isFinite(Number(attachment.size)) ? Number(attachment.size) : buffer.length,
            dataUrl,
            base64,
            buffer,
            kind:     getAttachmentKind({ mimeType, name }),
        };
    });

    if (attachments.length > MAX_ATTACHMENT_COUNT) {
        throw new Error(`You can upload up to ${MAX_ATTACHMENT_COUNT} files in the active chat.`);
    }

    const totalBytes = attachments.reduce((sum, attachment) => sum + attachment.size, 0);

    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
        throw new Error("The combined upload size is too large for one chat request.");
    }

    return attachments;
}

async function getExtractedAttachmentText(attachment) {
    if (typeof attachment.extractedText === "string") {
        return attachment.extractedText;
    }

    let text = "";

    if (attachment.kind === "pdf") {
        const parser = new PDFParse({ data: attachment.buffer });

        try {
            const result = await parser.getText();
            text = result?.text || "";
        } finally {
            await parser.destroy().catch(() => {});
        }
    } else if (attachment.mimeType === DOCX_MIME_TYPE) {
        const result = await mammoth.extractRawText({ buffer: attachment.buffer });
        text = result?.value || "";
    } else if (attachment.mimeType === DOC_MIME_TYPE) {
        const extractor = new WordExtractor();
        const document  = await extractor.extract(attachment.buffer);
        text = [
            document.getBody?.(),
            document.getFootnotes?.(),
            document.getEndnotes?.(),
        ].filter(Boolean).join("\n\n");
    } else if (attachment.mimeType === TEXT_MIME_TYPE) {
        text = attachment.buffer.toString("utf8");
    }

    attachment.extractedText = normalizeExtractedText(text);
    return attachment.extractedText;
}

async function buildGeminiMessageParts(message, attachments = []) {
    const parts = [{ text: `User question:\n${message}` }];

    for (const attachment of attachments) {
        if (attachment.kind === "image" || attachment.kind === "pdf") {
            parts.push({ text: `Attached file: ${attachment.name}` });
            parts.push({
                inlineData: {
                    data: attachment.base64,
                    mimeType: attachment.mimeType,
                },
            });
            continue;
        }

        const extractedText = await getExtractedAttachmentText(attachment);

        if (!extractedText) {
            throw new Error(`Could not extract readable text from ${attachment.name}.`);
        }

        parts.push({
            text: `Attached file: ${attachment.name}\n\n${extractedText}`,
        });
    }

    return parts;
}

async function buildOpenAIUserContent(message, attachments = []) {
    if (attachments.length === 0) {
        return `User question:\n${message}`;
    }

    const textSections = [`User question:\n${message}`];
    const imageParts   = [];

    for (const attachment of attachments) {
        if (attachment.kind === "image") {
            imageParts.push({
                type: "image_url",
                image_url: {
                    url: attachment.dataUrl,
                    detail: "auto",
                },
            });
            continue;
        }

        const extractedText = await getExtractedAttachmentText(attachment);

        if (!extractedText) {
            throw new Error(`Could not extract readable text from ${attachment.name}.`);
        }

        textSections.push(
            `Attachment "${attachment.name}" (${attachment.mimeType}) extracted text:\n${extractedText}`
        );
    }

    if (imageParts.length === 0) {
        return textSections.join("\n\n");
    }

    return [
        { type: "text", text: textSections.join("\n\n") },
        ...imageParts,
    ];
}

async function streamGeminiResponse({ message, history, attachments, send }) {
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

    const response = await chat.sendMessageStream({
        message: await buildGeminiMessageParts(message, attachments),
    });

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

async function streamCustomLlmResponse({ message, history, attachments, llmConfig, send }) {
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
                {
                    role: "user",
                    content: await buildOpenAIUserContent(message, attachments),
                },
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
        const body        = await request.json();
        const message     = body.message?.trim();
        const history     = Array.isArray(body.history) ? body.history : [];
        const llmConfig   = resolveCustomLlmConfig(body.llmConfig);
        const attachments = prepareAttachments(body.attachments);

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
                        await streamCustomLlmResponse({ message, history, attachments, llmConfig, send });
                    } else {
                        await streamGeminiResponse({ message, history, attachments, send });
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
        return NextResponse.json({ error: err.message || "Bad request" }, { status: 400 });
    }
}
