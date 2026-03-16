import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import {
    boostPriorityResults,
    buildBingSearchRequest,
    buildDuckDuckGoSearchRequest,
    buildGoogleSearchUrl,
    CUSTOM_SEARCH_PRIORITY,
    getSearchProviderOrder,
} from "@/lib/searchConfig";
import {
    buildSearchRedirectDisplayUrl,
    buildSearchRedirectPath,
} from "@/lib/searchRedirect";

function wrapProviderResults(items = [], provider) {
    if (provider !== "bing" && provider !== "duckduckgo") {
        return items;
    }

    return items.map((item) => ({
        ...item,
        targetUrl: item.link,
        link: buildSearchRedirectPath(item.link, item.title || item.formattedUrl || item.link),
        formattedUrl: buildSearchRedirectDisplayUrl(item.link, item.title || item.formattedUrl || item.link),
    }));
}

function resolveDuckDuckGoTargetUrl(href = "") {
    if (!href) {
        return "";
    }

    const absoluteUrl = href.startsWith("http")
        ? href
        : new URL(href, "https://duckduckgo.com").toString();
    const url = new URL(absoluteUrl);
    const target = url.searchParams.get("uddg");

    return target ? decodeURIComponent(target) : absoluteUrl;
}

function parseDuckDuckGoHtmlResults(html, num) {
    const $ = cheerio.load(html);
    const results = [];

    $(".result").each((_, element) => {
        if (results.length >= num) {
            return false;
        }

        const linkElement = $(element).find(".result__title .result__a").first();
        const title       = linkElement.text().trim();
        const rawHref     = linkElement.attr("href") || "";
        const targetUrl   = resolveDuckDuckGoTargetUrl(rawHref);
        const snippet     = $(element).find(".result__snippet").first().text().trim();
        const visibleUrl  = $(element).find(".result__url").first().text().trim();

        if (!title || !targetUrl) {
            return;
        }

        results.push({
            title,
            link: targetUrl,
            snippet: snippet || visibleUrl || targetUrl,
            formattedUrl: visibleUrl || targetUrl,
        });
    });

    return results;
}

function isDuckDuckGoChallengePage(html = "") {
    return html.includes("anomaly-modal") || html.includes("Unfortunately, bots use DuckDuckGo too.");
}

function buildMockResults(query) {
    return [
        {
            title: `${query} - Supreme Court of India`,
            link: "https://main.sci.gov.in/",
            snippet: `Official rulings and case status from the Supreme Court of India related to: ${query}.`,
            formattedUrl: "main.sci.gov.in",
        },
        {
            title: `${query} - Indian Kanoon`,
            link: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
            snippet: `Legal documents, High Court judgments and Acts related to: ${query}.`,
            formattedUrl: "indiankanoon.org",
        },
        {
            title: `Ministry of Law & Justice - ${query}`,
            link: "https://lawmin.gov.in/",
            snippet: `Legislative acts, legal affairs, and justice department references for: ${query}.`,
            formattedUrl: "lawmin.gov.in",
        },
        {
            title: `India Code - ${query}`,
            link: "https://indiacode.nic.in/",
            snippet: `Browse Indian statutes and bare acts. Relevant codified laws for: ${query}.`,
            formattedUrl: "indiacode.nic.in",
        },
        {
            title: `LiveLaw - ${query}`,
            link: "https://www.livelaw.in/",
            snippet: `Latest legal news, court updates and analysis related to: ${query}.`,
            formattedUrl: "www.livelaw.in",
        },
    ];
}

async function searchWithGoogle({ query, fileType, siteRestrict, dateRestrict, num }) {
    const searchUrl = buildGoogleSearchUrl({ query, fileType, siteRestrict, dateRestrict, num });
    const res  = await fetch(searchUrl);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error?.message || `Google CSE error ${res.status}`);
    }

    const rawItems     = data.items || [];
    const boostedItems = boostPriorityResults(rawItems);

    return {
        items: boostedItems,
        meta: {
            provider: "google",
            totalResults: data.searchInformation?.totalResults,
            formattedTotalResults: data.searchInformation?.formattedTotalResults,
            searchTime: data.searchInformation?.formattedSearchTime,
        },
    };
}

async function searchWithBing({ query, fileType, siteRestrict, dateRestrict, num }) {
    const { url, headers } = buildBingSearchRequest({ query, fileType, siteRestrict, dateRestrict, num });
    const res  = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || `Bing Custom Search error ${res.status}`);
    }

    const rawItems = (data.webPages?.value || []).map((item) => ({
        title: item.name,
        link: item.url,
        snippet: item.snippet,
        formattedUrl: item.displayUrl || item.url,
    }));
    const boostedItems = boostPriorityResults(rawItems);
    const totalResults = data.webPages?.totalEstimatedMatches || rawItems.length;

    return {
        items: wrapProviderResults(boostedItems, "bing"),
        meta: {
            provider: "bing",
            totalResults,
            formattedTotalResults: Intl.NumberFormat("en-US").format(totalResults),
            searchTime: null,
        },
    };
}

async function searchWithDuckDuckGo({ query, fileType, siteRestrict, num }) {
    const { url, headers } = buildDuckDuckGoSearchRequest({ query, fileType, siteRestrict });
    const res  = await fetch(url, { headers });
    const html = await res.text();

    if (!res.ok) {
        throw new Error(`DuckDuckGo search error ${res.status}`);
    }

    if (isDuckDuckGoChallengePage(html)) {
        throw new Error("DuckDuckGo blocked the automated request with a bot challenge.");
    }

    const dedupedItems = parseDuckDuckGoHtmlResults(html, num)
        .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index);

    if (dedupedItems.length === 0) {
        throw new Error("DuckDuckGo returned no parsable search results.");
    }

    const boostedItems = boostPriorityResults(dedupedItems);

    return {
        items: wrapProviderResults(boostedItems, "duckduckgo"),
        meta: {
            provider: "duckduckgo",
            totalResults: dedupedItems.length,
            formattedTotalResults: dedupedItems.length,
            searchTime: null,
        },
    };
}

/**
 * GET /api/search
 *
 * Query Params:
 *   q            - search query (required)
 *   fileType     - pdf | doc | docx | ppt | xls | txt | rtf
 *   siteRestrict - official | govonly | courts
 *   dateRestrict - d1 | w1 | m1 | m3 | m6 | y1 | y2 | y5
 *   num          - 1-10 (default 10)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const query        = searchParams.get("q");
    const fileType     = searchParams.get("fileType") || null;
    const siteRestrict = searchParams.get("siteRestrict") || null;
    const dateRestrict = searchParams.get("dateRestrict") || null;
    const num          = Math.min(10, Math.max(1, parseInt(searchParams.get("num") || "10", 10)));

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    const providerOrder = getSearchProviderOrder();
    const attemptedProviders = [];
    const failures = [];

    for (const provider of providerOrder) {
        if (provider === "mock") {
            break;
        }

        attemptedProviders.push(provider);

        try {
            const payload = provider === "google"
                ? await searchWithGoogle({ query, fileType, siteRestrict, dateRestrict, num })
                : provider === "bing"
                    ? await searchWithBing({ query, fileType, siteRestrict, dateRestrict, num })
                    : await searchWithDuckDuckGo({ query, fileType, siteRestrict, num });

            return NextResponse.json({
                items: payload.items,
                meta: {
                    query,
                    fileType,
                    siteRestrict,
                    dateRestrict,
                    provider: payload.meta.provider,
                    requestedProvider: CUSTOM_SEARCH_PRIORITY,
                    attemptedProviders,
                    totalResults: payload.meta.totalResults,
                    formattedTotalResults: payload.meta.formattedTotalResults,
                    searchTime: payload.meta.searchTime,
                    isMock: false,
                },
            });
        } catch (error) {
            console.warn(`[search] ${provider} failed, trying fallback:`, error.message);
            failures.push({
                provider,
                message: error.message,
            });
        }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json({
        items: buildMockResults(query),
        meta: {
            query,
            fileType,
            siteRestrict,
            dateRestrict,
            provider: "mock",
            requestedProvider: CUSTOM_SEARCH_PRIORITY,
            attemptedProviders,
            failures,
            isMock: true,
        },
    });
}
