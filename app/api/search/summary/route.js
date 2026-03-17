import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
    buildAnthropicMessagesUrl,
    buildOpenAICompatibleChatUrl,
    buildOpenRouterHeaders,
    GEMINI_CONFIG,
    resolveCustomLlmConfig,
} from "@/lib/searchConfig";

const MAX_RESULTS_FOR_SUMMARY = 6;
const SUMMARY_SYSTEM_PROMPT = `You are AdvocateHub Search Summary, an AI layer for web search.
You summarize search results into a compact, useful answer.

Rules:
- Use only the provided search results.
- Do not invent facts that are not present in the sources.
- Write in markdown.
- Start with "## Quick Summary" and give a concise direct answer in 2 short paragraphs.
- Then add "## Across Sources" with 3 to 5 bullets that synthesize what different sources emphasize.
- If sources disagree or focus on different angles, say that clearly.
- End every factual sentence or bullet with citations like [1] or [2][3].
- Do not add a separate "Sources" section because the UI renders the sources separately.
- Keep the full answer under 220 words.`;

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

function getErrorMessage(errorText, status) {
    try {
        const parsed = JSON.parse(errorText);
        return parsed?.error?.message || parsed?.message || `Custom LLM request failed (${status})`;
    } catch {
        return errorText?.trim() || `Custom LLM request failed (${status})`;
    }
}

function normalizeSummaryResult(result, index) {
    const title = typeof result?.title === "string" ? result.title.trim() : "";
    const link = typeof result?.targetUrl === "string" && result.targetUrl.trim()
        ? result.targetUrl.trim()
        : (typeof result?.link === "string" ? result.link.trim() : "");
    const snippet = typeof result?.snippet === "string" ? result.snippet.trim() : "";
    const formattedUrl = typeof result?.formattedUrl === "string" ? result.formattedUrl.trim() : "";

    if (!title || !link) {
        return null;
    }

    let displayHost = formattedUrl;

    try {
        displayHost = new URL(link).hostname.replace(/^www\./, "");
    } catch {
        displayHost = formattedUrl || link;
    }

    return {
        index: index + 1,
        title,
        link,
        snippet: snippet.slice(0, 420),
        formattedUrl: formattedUrl || displayHost,
        displayHost,
    };
}

function pickDiverseResults(results, maxCount = MAX_RESULTS_FOR_SUMMARY) {
    const normalized = results
        .map(normalizeSummaryResult)
        .filter(Boolean);
    const chosen = [];
    const seenHosts = new Set();

    for (const result of normalized) {
        if (!seenHosts.has(result.displayHost)) {
            chosen.push(result);
            seenHosts.add(result.displayHost);
        }

        if (chosen.length >= maxCount) {
            return chosen;
        }
    }

    for (const result of normalized) {
        if (chosen.length >= maxCount) {
            break;
        }

        if (!chosen.some((candidate) => candidate.link === result.link)) {
            chosen.push(result);
        }
    }

    return chosen.slice(0, maxCount);
}

function buildPrompt(query, results) {
    const digest = results
        .map((result, index) => [
            `[${index + 1}] ${result.title}`,
            `Host: ${result.displayHost}`,
            `URL: ${result.link}`,
            `Snippet: ${result.snippet || "No snippet available."}`,
        ].join("\n"))
        .join("\n\n");

    return [
        `User query: ${query}`,
        "",
        "Search results to synthesize:",
        digest,
    ].join("\n");
}

function clipSentence(text = "", maxLength = 170) {
    const cleaned = text.replace(/\s+/g, " ").trim();

    if (!cleaned) {
        return "";
    }

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function buildFallbackSummary(query, results) {
    const lead = results.slice(0, 2).map((result, index) => `${result.displayHost} [${index + 1}]`).join(" and ");
    const bullets = results.slice(0, 4).map((result, index) => (
        `- **${result.title}** from ${result.displayHost} focuses on ${clipSentence(result.snippet || "the main issue raised by the query")} [${index + 1}]`
    ));

    const summary = [
        "## Quick Summary",
        `Search results for **${query}** primarily point to material from ${lead || "multiple sources"}, giving a quick cross-site view instead of a single-source answer. [1]`,
        `The strongest links appear to cluster around official portals, legal databases, or explainers that address the query from different angles, so the best next step is to compare the top sources below. [1][2]`,
        "",
        "## Across Sources",
        ...bullets,
    ].join("\n");

    return {
        summary,
        mode: "heuristic",
    };
}

async function generateGeminiSummary(query, results) {
    const { apiKey, model } = GEMINI_CONFIG;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model,
        contents: buildPrompt(query, results),
        config: {
            systemInstruction: SUMMARY_SYSTEM_PROMPT,
            temperature: 0.25,
            topK: 24,
            topP: 0.85,
            maxOutputTokens: 700,
        },
    });

    return {
        summary: response.text?.trim() || "",
        mode: "gemini",
        model,
    };
}

async function generateOpenAICompatibleSummary(query, results, llmConfig) {
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
                { role: "system", content: SUMMARY_SYSTEM_PROMPT },
                { role: "user", content: buildPrompt(query, results) },
            ],
            temperature: 0.25,
            max_tokens: Math.min(llmConfig.maxTokens || 700, 700),
            stream: false,
        }),
    });

    if (!upstream.ok) {
        const errorText = await upstream.text();
        throw new Error(getErrorMessage(errorText, upstream.status));
    }

    const payload = await upstream.json();
    const summary = extractTextContent(
        payload?.choices?.[0]?.message?.content || payload?.output_text || payload?.response
    ).trim();

    return {
        summary,
        mode: "custom_llm",
        model: llmConfig.model,
    };
}

async function generateAnthropicSummary(query, results, llmConfig) {
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
            system: SUMMARY_SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: buildPrompt(query, results),
                        },
                    ],
                },
            ],
            temperature: 0.25,
            max_tokens: Math.min(llmConfig.maxTokens || 700, 700),
            stream: false,
        }),
    });

    if (!upstream.ok) {
        const errorText = await upstream.text();
        throw new Error(getErrorMessage(errorText, upstream.status));
    }

    const payload = await upstream.json();
    const summary = extractTextContent(payload?.content || payload?.response || payload?.completion).trim();

    return {
        summary,
        mode: "custom_llm",
        model: llmConfig.model,
    };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const query = body?.query?.trim();
        const rawResults = Array.isArray(body?.results) ? body.results : [];

        if (!query) {
            return NextResponse.json({ error: "query is required" }, { status: 400 });
        }

        const results = pickDiverseResults(rawResults);

        if (results.length === 0) {
            return NextResponse.json({ error: "results are required" }, { status: 400 });
        }

        const llmConfig = resolveCustomLlmConfig();
        let payload = null;

        try {
            if (llmConfig.shouldUse) {
                payload = llmConfig.provider === "anthropic"
                    ? await generateAnthropicSummary(query, results, llmConfig)
                    : await generateOpenAICompatibleSummary(query, results, llmConfig);
            } else {
                payload = await generateGeminiSummary(query, results);
            }
        } catch (error) {
            console.warn("[search-summary] Model generation failed, falling back:", error.message);
            payload = null;
        }

        if (!payload?.summary) {
            payload = buildFallbackSummary(query, results);
        }

        return NextResponse.json({
            query,
            summary: payload.summary,
            mode: payload.mode,
            model: payload.model || null,
            sources: results.map((result, index) => ({
                ...result,
                index: index + 1,
            })),
            sourceCount: results.length,
        });
    } catch (error) {
        console.error("[search-summary] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate search summary" },
            { status: 500 }
        );
    }
}
