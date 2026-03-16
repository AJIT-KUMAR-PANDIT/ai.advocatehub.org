import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { EMBEDDING_CONFIG } from "@/lib/searchConfig";

/**
 * POST /api/embed
 *
 * Generates vector embeddings using Gemini Embedding 1 (text-embedding-004).
 *
 * Body (single text):
 *   { text: string, taskType?: string }
 *
 * Body (batch):
 *   { texts: string[], taskType?: string }
 *
 * taskType options: query | document | similarity | classify | cluster
 * Defaults to "document" if not provided.
 *
 * Response:
 *   { embedding: number[] }            — single mode
 *   { embeddings: number[][] }         — batch mode
 *   { model, dimensions, taskType }    — always included
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { apiKey, model, TASK_TYPES, outputDimensionality } = EMBEDDING_CONFIG;

        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not configured in .env.local" },
                { status: 503 }
            );
        }

        // Resolve task type
        const taskTypeKey  = body.taskType || "document";
        const taskType     = TASK_TYPES[taskTypeKey] || TASK_TYPES.document;

        // Determine single vs batch mode
        const isBatch      = Array.isArray(body.texts);
        const texts        = isBatch ? body.texts : [body.text];

        if (!texts || texts.length === 0 || texts.some((t) => !t?.trim())) {
            return NextResponse.json(
                { error: "Provide 'text' (string) or 'texts' (array of strings)" },
                { status: 400 }
            );
        }

        // text-embedding-004 is only available on v1 (not v1beta default)
        const ai = new GoogleGenAI({ apiKey, apiVersion: "v1" });

        // Embed all texts (batch or single)
        const embeddingPromises = texts.map((content) =>
            ai.models.embedContent({
                model,
                contents: [{ parts: [{ text: content }] }],
                config: {
                    taskType,
                    outputDimensionality,
                },
            })
        );

        const results = await Promise.all(embeddingPromises);
        const vectors = results.map((r) => r.embedding?.values || []);

        const meta = {
            model,
            dimensions: vectors[0]?.length || outputDimensionality,
            taskType,
        };

        if (isBatch) {
            return NextResponse.json({ embeddings: vectors, ...meta });
        }

        return NextResponse.json({ embedding: vectors[0], ...meta });

    } catch (err) {
        console.error("[embed] Error:", err);
        return NextResponse.json(
            { error: err.message || "Embedding generation failed" },
            { status: 500 }
        );
    }
}
