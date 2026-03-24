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
    buildAnthropicMessagesUrl,
    buildOpenAICompatibleChatUrl,
    buildOpenRouterHeaders,
    GEMINI_CONFIG,
    resolveCustomLlmConfig,
    BING_HTML_TEXT_CONFIG,
} from "@/lib/searchConfig";

// We'll make the search call directly via fetch to avoid import issues

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

function historyToAnthropicMessages(history = []) {
    return history
        .map((item) => {
            const content = extractTextContent(item?.parts || []);

            if (!content.trim()) {
                return null;
            }

            return {
                role: item.role === "model" ? "assistant" : "user",
                content: [
                    {
                        type: "text",
                        text: content,
                    },
                ],
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

async function buildAnthropicUserContent(message, attachments = []) {
    const content = [
        {
            type: "text",
            text: `User question:\n${message}`,
        },
    ];

    for (const attachment of attachments) {
        if (attachment.kind === "image") {
            content.push({
                type: "text",
                text: `Attached image: ${attachment.name}`,
            });
            content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: attachment.mimeType,
                    data: attachment.base64,
                },
            });
            continue;
        }

        const extractedText = await getExtractedAttachmentText(attachment);

        if (!extractedText) {
            throw new Error(`Could not extract readable text from ${attachment.name}.`);
        }

        content.push({
            type: "text",
            text: `Attachment "${attachment.name}" (${attachment.mimeType}) extracted text:\n${extractedText}`,
        });
    }

    return content;
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

async function streamOpenAICompatibleResponse({ message, history, attachments, llmConfig, send }) {
    let endpoint;

    try {
        endpoint = buildOpenAICompatibleChatUrl(llmConfig.url);
    } catch {
        throw new Error("Custom LLM URL is invalid.");
    }

    const headers = {
        "Content-Type": "application/json",
        ...buildOpenRouterHeaders(llmConfig),
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

async function streamAnthropicResponse({ message, history, attachments, llmConfig, send }) {
    let endpoint;

    try {
        endpoint = buildAnthropicMessagesUrl(llmConfig.url);
    } catch {
        throw new Error("Claude / Anthropic URL is invalid.");
    }

    const headers = {
        "Content-Type": "application/json",
        "anthropic-version": llmConfig.anthropicVersion,
    };

    if (llmConfig.apiKey) {
        headers["x-api-key"] = llmConfig.apiKey;
    }

    const upstream = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: llmConfig.model,
            system: llmConfig.systemPrompt,
            messages: [
                ...historyToAnthropicMessages(history),
                {
                    role: "user",
                    content: await buildAnthropicUserContent(message, attachments),
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
        throw new Error("Claude / Anthropic returned an empty response.");
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const payload = await upstream.json();
        const text = extractTextContent(payload?.content || payload?.response || payload?.completion).trim();

        if (text) {
            send({ type: "chunk", text });
        }

        return;
    }

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = "";

    function processAnthropicEvent(eventText) {
        const lines = eventText.split("\n");
        const data = lines
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.replace(/^data:\s?/, ""))
            .join("");

        if (!data) {
            return;
        }

        try {
            const payload = JSON.parse(data);

            if (payload?.type === "error") {
                throw new Error(payload?.error?.message || payload?.message || "Claude / Anthropic request failed");
            }

            const text = payload?.delta?.text
                || payload?.content_block?.text
                || extractTextContent(payload?.content);

            if (text) {
                send({ type: "chunk", text });
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
        }
    }

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
            processAnthropicEvent(event);
        }
    }

    if (buffer.trim()) {
        processAnthropicEvent(buffer);
    }
}

async function streamCustomLlmResponse({ message, history, attachments, llmConfig, send }) {
    if (llmConfig.provider === "anthropic") {
        return streamAnthropicResponse({ message, history, attachments, llmConfig, send });
    }

    return streamOpenAICompatibleResponse({ message, history, attachments, llmConfig, send });
}

// Fallback AI response using live search (no API key required)
async function parseBingHtmlTextResults(html, num) {
    const results = [];
    let idx = html.indexOf('<li class="b_algo"');

    while (idx !== -1 && results.length < num) {
        const endBlock = html.indexOf('</li>', idx);
        if (endBlock === -1) break;
        
        const block = html.substring(idx, endBlock);
        
        const h2Start = block.indexOf('<h2>');
        if (h2Start !== -1) {
            const h2End = block.indexOf('</h2>', h2Start);
            const h2Html = block.substring(h2Start, h2End);
            
            const hrefStart = h2Html.indexOf('href="');
            if (hrefStart !== -1) {
                const hrefStartPos = hrefStart + 6;
                const hrefEnd = h2Html.indexOf('"', hrefStartPos);
                const targetUrl = h2Html.substring(hrefStartPos, hrefEnd);
                
                const titleText = h2Html.replace(/<[^>]+>/g, '').trim();
                
                let snippet = "";
                const snipDivStart = block.indexOf('class="b_caption"');
                if (snipDivStart !== -1) {
                    const pStart = block.indexOf('<p', snipDivStart);
                    if (pStart !== -1) {
                        let pEnd = block.indexOf('</p>', pStart);
                        if (pEnd === -1) pEnd = block.indexOf('</div>', pStart);
                        snippet = block.substring(pStart, pEnd !== -1 ? pEnd : block.length).replace(/<[^>]+>/g, '').trim();
                    }
                }
                
                if (!snippet) {
                    const fallbackP = block.indexOf('<p');
                    if (fallbackP !== -1) {
                        const fallbackPEnd = block.indexOf('</p>', fallbackP);
                        snippet = block.substring(fallbackP, fallbackPEnd !== -1 ? fallbackPEnd : block.length).replace(/<[^>]+>/g, '').trim();
                    }
                }
                
                if (targetUrl.startsWith('http')) {
                    results.push({
                        title: titleText,
                        link: targetUrl,
                        snippet: snippet || titleText,
                        formattedUrl: targetUrl
                    });
                }
            }
        }
        idx = html.indexOf('<li class="b_algo"', endBlock);
    }

    return results;
}

async function streamSearchBasedResponse({ message, send }) {
    const { baseUrl, userAgent } = BING_HTML_TEXT_CONFIG;
    const url = new URL(baseUrl);
    
    url.searchParams.set("q", message);
    url.searchParams.set("first", "1");
    url.searchParams.set("adlt", "moderate");

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "User-Agent": userAgent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
            },
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const html = await response.text();
        const searchResults = parseBingHtmlTextResults(html, 10);

        if (searchResults.length === 0) {
            throw new Error("No search results found");
        }

        // Format results as an AI response
        const intro = `I found the following information for your query "${message}":\n\n`;
        
        // Stream the intro
        for (const char of intro) {
            send({ type: "chunk", text: char });
            await new Promise(r => setTimeout(r, 10));
        }

        // Add each result
        for (let i = 0; i < searchResults.length; i++) {
            const result = searchResults[i];
            const formattedResult = `\n${i + 1}. ${result.title}\n${result.snippet || ''}\nSource: ${result.formattedUrl}\n\n`;
            
            for (const char of formattedResult) {
                send({ type: "chunk", text: char });
                await new Promise(r => setTimeout(r, 5));
            }
        }

        const conclusion = "\nWould you like me to elaborate on any of these results or search for something more specific?";
        
        for (const char of conclusion) {
            send({ type: "chunk", text: char });
            await new Promise(r => setTimeout(r, 10));
        }

        // Send sources
        const sources = searchResults.slice(0, 5).map((r) => ({
            title: r.title,
            uri: r.link
        }));
        
        send({ type: "sources", sources });

    } catch (error) {
        // If search fails, provide a helpful message
        const fallbackMsg = `I couldn't search the web right now due to: ${error.message}. However, please try rephrasing your question or try again in a moment. You can also try using the regular search feature to find information.`;
        
        for (const char of fallbackMsg) {
            send({ type: "chunk", text: char });
            await new Promise(r => setTimeout(r, 15));
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
                    // Check if we should use custom LLM
                    if (llmConfig.shouldUse) {
                        await streamCustomLlmResponse({ message, history, attachments, llmConfig, send });
                    } 
                    // Check if Gemini API key is available
                    else if (GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey !== "your_gemini_api_key_here") {
                        await streamGeminiResponse({ message, history, attachments, send });
                    } 
                    // Fallback to search-based AI response (no API key required)
                    else {
                        // Send a message explaining we're using search-based AI
                        const welcomeMsg = "🔍 I'm using search-powered AI (no API key needed). Let me search for information about your query...\n\n";
                        for (const char of welcomeMsg) {
                            send({ type: "chunk", text: char });
                            await new Promise(r => setTimeout(r, 10));
                        }
                        
                        await streamSearchBasedResponse({ message, send });
                    }

                    send({ type: "done" });
                } catch (err) {
                    console.error("[ai] Stream error:", err);
                    
                    // If AI fails, try search-based fallback
                    if (!llmConfig.shouldUse && (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey === "your_gemini_api_key_here")) {
                        try {
                            const fallbackMsg = "\n\n⚠️ The AI service encountered an error. Let me try a direct search instead...\n\n";
                            for (const char of fallbackMsg) {
                                send({ type: "chunk", text: char });
                            }
                            await streamSearchBasedResponse({ message, send });
                            send({ type: "done" });
                            controller.close();
                            return;
                        } catch (searchErr) {
                            console.error("[ai] Search fallback also failed:", searchErr);
                        }
                    }
                    
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
