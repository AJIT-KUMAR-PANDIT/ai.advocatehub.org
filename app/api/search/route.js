import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    // Use mock data if API keys aren't configured so the UI still functions perfectly.
    if (!apiKey || !cx) {
        console.warn("Google API Keys not found in .env. Returning mock India-focused legal data.");

        // Simulating network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock search results tailored to Indian context and legal queries as requested
        const mockResults = [
            {
                title: `Information regarding ${query} - Supreme Court of India`,
                link: "https://main.sci.gov.in/",
                snippet: "Official website of the Supreme Court of India. Providing rulings, case statuses, and judgments related to recent filings addressing: " + query,
                formattedUrl: "main.sci.gov.in"
            },
            {
                title: `Judgments on ${query} - Indian Kanoon`,
                link: "https://indiankanoon.org/search/?formInput=" + encodeURIComponent(query),
                snippet: "Search results on " + query + " from Indian Kanoon. Access millions of Indian legal documents, high court judgments, and acts.",
                formattedUrl: "indiankanoon.org"
            },
            {
                title: `Ministry of Law and Justice - Government of India`,
                link: "https://lawmin.gov.in/",
                snippet: "The Ministry of Law and Justice provides comprehensive details regarding legislative acts, legal affairs, and justice departments related to " + query,
                formattedUrl: "lawmin.gov.in"
            },
            {
                title: `The Constitution of India | Legislative Department`,
                link: "https://legislative.gov.in/constitution-of-india",
                snippet: "National Portal of India provides links to the Constitution of India. Search for amendments, articles, and references pertaining to " + query,
                formattedUrl: "legislative.gov.in"
            },
            {
                title: `${query} definition and application in Indian Law`,
                link: "https://www.livelaw.in/",
                snippet: "Comprehensive legal news and updates from Indian courts. Recent articles and analyses discussing the implications of " + query + " in modern litigation.",
                formattedUrl: "www.livelaw.in"
            }
        ];

        return NextResponse.json({ items: mockResults });
    }

    // If keys exist, query Google's API prioritizing India context
    try {
        // We add 'cr=countryIN' to prioritize Indian content
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&cr=countryIN`;

        const res = await fetch(googleUrl);

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json({ error: errorData.error.message }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ items: data.items || [] });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
    }
}
