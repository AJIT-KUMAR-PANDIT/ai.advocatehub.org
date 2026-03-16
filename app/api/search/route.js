import { NextResponse } from "next/server";
import { buildSearchUrl, boostPriorityResults, SEARCH_CONFIG } from "@/lib/searchConfig";

/**
 * GET /api/search
 *
 * Query Params:
 *   q            — search query (required)
 *   fileType     — pdf | doc | docx | ppt | xls | txt | rtf
 *   siteRestrict — official | govonly | courts
 *   dateRestrict — d1 | w1 | m1 | m3 | m6 | y1 | y2 | y5
 *   num          — 1-10 (default 10)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const query        = searchParams.get("q");
    const fileType     = searchParams.get("fileType")     || null;
    const siteRestrict = searchParams.get("siteRestrict") || null;
    const dateRestrict = searchParams.get("dateRestrict") || null;
    const num          = Math.min(10, Math.max(1, parseInt(searchParams.get("num") || "10", 10)));

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    const { apiKey, cx } = SEARCH_CONFIG;

    // ── Fallback: no API keys configured ─────────────────────────
    if (!apiKey || !cx) {
        console.warn("[search] No API keys found — returning mock data");
        await new Promise((r) => setTimeout(r, 600));

        const mockResults = [
            {
                title:        `${query} — Supreme Court of India`,
                link:         "https://main.sci.gov.in/",
                snippet:      `Official rulings and case status from the Supreme Court of India related to: ${query}.`,
                formattedUrl: "main.sci.gov.in",
            },
            {
                title:        `${query} — Indian Kanoon`,
                link:         `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
                snippet:      `Legal documents, High Court judgments and Acts related to: ${query}.`,
                formattedUrl: "indiankanoon.org",
            },
            {
                title:        `Ministry of Law & Justice — ${query}`,
                link:         "https://lawmin.gov.in/",
                snippet:      `Legislative acts, legal affairs, and justice department references for: ${query}.`,
                formattedUrl: "lawmin.gov.in",
            },
            {
                title:        `India Code — ${query}`,
                link:         "https://indiacode.nic.in/",
                snippet:      `Browse Indian statutes and bare acts. Relevant codified laws for: ${query}.`,
                formattedUrl: "indiacode.nic.in",
            },
            {
                title:        `LiveLaw — ${query}`,
                link:         "https://www.livelaw.in/",
                snippet:      `Latest legal news, court updates and analysis related to: ${query}.`,
                formattedUrl: "www.livelaw.in",
            },
        ];

        return NextResponse.json({
            items: mockResults,
            meta: { query, fileType, siteRestrict, dateRestrict, isMock: true },
        });
    }

    // ── Live Google Custom Search ─────────────────────────────────
    try {
        const searchUrl = buildSearchUrl({ query, fileType, siteRestrict, dateRestrict, num });

        const res  = await fetch(searchUrl);
        const data = await res.json();

        if (!res.ok) {
            const errMsg = data?.error?.message || `Google CSE error ${res.status}`;
            console.error("[search] Google CSE error:", errMsg);
            return NextResponse.json({ error: errMsg }, { status: res.status });
        }

        // Boost results from priority domains to the top
        const rawItems     = data.items || [];
        const boostedItems = boostPriorityResults(rawItems);

        return NextResponse.json({
            items: boostedItems,
            meta: {
                query,
                fileType,
                siteRestrict,
                dateRestrict,
                totalResults: data.searchInformation?.totalResults,
                formattedTotalResults: data.searchInformation?.formattedTotalResults,
                searchTime: data.searchInformation?.formattedSearchTime,
                isMock: false,
            },
        });

    } catch (error) {
        console.error("[search] Unexpected error:", error);
        return NextResponse.json(
            { error: "Failed to fetch search results" },
            { status: 500 }
        );
    }
}
