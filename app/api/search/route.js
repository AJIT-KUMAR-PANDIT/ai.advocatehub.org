import { NextResponse } from "next/server";
import { normalizeSearchResultType } from "@/lib/searchFilters";
import {
    boostPriorityResults,
    buildBingSearchRequest,
    buildDuckDuckGoSearchRequest,
    buildGoogleHtmlSearchRequest,
    buildGoogleSearchUrl,
    CUSTOM_SEARCH_PRIORITY,
    getSearchProviderOrder,
} from "@/lib/searchConfig";
import {
    buildSearchRedirectDisplayUrl,
    buildSearchRedirectPath,
} from "@/lib/searchRedirect";

function resolveGoogleTargetUrl(href = "") {
    if (!href) return "";
    
    // Sometimes Google uses /url?q=... format
    if (href.startsWith("/url?")) {
        try {
            const url = new URL(href, "https://www.google.com");
            const q = url.searchParams.get("q");
            if (q) return q;
        } catch {
            return href;
        }
    }
    
    return href.startsWith("/") ? `https://www.google.com${href}` : href;
}

function parseGoogleHtmlResults(html, num) {
    const results = [];
    const blockRegex = /<div class="g(?: [^>]+)?">(.*?)<\/div><\/div><\/div>/gs;
    const titleRegex = /<h3[^>]*>(.*?)<\/h3>/i;
    const linkRegex  = /<a[^>]+href="([^"]+)"[^>]*>/i;
    // Common snippet classes: VwiC3b, s, st
    const snippetRegex = /<div class="VwiC3b[^>]*>(.*?)<\/div>|<span class="aCOpRe"[^>]*>(.*?)<\/span>|<div class="s"[^>]*>(.*?)<\/div>/i;
    const citeRegex  = /<cite[^>]*>(.*?)<\/cite>/i;

    let match;
    while ((match = blockRegex.exec(html)) !== null && results.length < num) {
        const block = match[1];

        const titleMatch = titleRegex.exec(block);
        const linkMatch  = linkRegex.exec(block);
        
        if (!titleMatch || !linkMatch) continue;

        let title = titleMatch[1].replace(/<[^>]*>?/gm, '').trim();
        let rawHref = linkMatch[1];
        if (rawHref === "#" || !rawHref) continue;

        const targetUrl = resolveGoogleTargetUrl(rawHref);

        const snippetMatch = snippetRegex.exec(block);
        let snippet = "";
        if (snippetMatch) {
            snippet = (snippetMatch[1] || snippetMatch[2] || snippetMatch[3] || "").replace(/<[^>]*>?/gm, '').trim();
        }

        if (!snippet || snippet.length < 10) {
            // fallback snippet removal of tags
            snippet = block.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 150).trim() + "...";
        }

        const citeMatch = citeRegex.exec(block);
        const visibleUrl = citeMatch ? citeMatch[1].replace(/<[^>]*>?/gm, '').split(" › ")[0].trim() : targetUrl;

        results.push({
            title,
            link: targetUrl,
            snippet,
            formattedUrl: visibleUrl,
        });
    }

    return results;
}

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
    const results = [];
    let idx = html.indexOf('class="result__url" href="');

    while (idx !== -1 && results.length < num) {
        const startHref = idx + 26;
        const endHref = html.indexOf('"', startHref);
        if (endHref === -1) break;
        
        const rawHref = html.substring(startHref, endHref);
        const targetUrl = resolveDuckDuckGoTargetUrl(rawHref);

        const snippetIdx = html.indexOf('class="result__snippet', endHref);
        if (snippetIdx === -1) break;

        const snippetStart = html.indexOf('>', snippetIdx) + 1;
        const snippetEnd = html.indexOf('</a>', snippetStart);
        if (snippetEnd === -1) break;

        let snippet = html.substring(snippetStart, snippetEnd).replace(/<[^>]+>/g, '').trim();

        // Title is usually above the snippet, but let's just make it the URL if we can't find it easily
        // Usually targetUrl is good enough for lite parsing if title is obfuscated
        let title = targetUrl;
        
        // Try to reverse-find title
        const titleEnd = html.lastIndexOf('</a>', idx);
        if (titleEnd !== -1) {
            const titleStart = html.lastIndexOf('>', titleEnd - 1) + 1;
            if (titleStart !== -1 && titleEnd - titleStart < 200) {
                 const extractedTitle = html.substring(titleStart, titleEnd).replace(/<[^>]+>/g, '').trim();
                 if (extractedTitle) title = extractedTitle;
            }
        }

        if (targetUrl) {
            results.push({
                title,
                link: targetUrl,
                snippet: snippet || targetUrl,
                formattedUrl: targetUrl,
            });
        }

        idx = html.indexOf('class="result__url" href="', snippetEnd);
    }

    return results;
}

function isDuckDuckGoChallengePage(html = "") {
    return html.includes("anomaly-modal") || html.includes("Unfortunately, bots use DuckDuckGo too.");
}

function buildMockResults(query, resultType = "all") {
    if (resultType === "videos") {
        return [
            {
                title: `${query} - Supreme Court of India videos`,
                link: "https://www.youtube.com/@supremecourtofindia",
                snippet: `Video content, explainers, and hearings related to ${query}.`,
                formattedUrl: "youtube.com",
            },
            {
                title: `${query} - LiveLaw video coverage`,
                link: "https://www.youtube.com/@LiveLawIndia",
                snippet: `Legal explainers and court coverage relevant to ${query}.`,
                formattedUrl: "youtube.com",
            },
        ];
    }

    if (resultType === "audio") {
        return [
            {
                title: `${query} - Legal audio references`,
                link: "https://archive.org/",
                snippet: `Audio-first references, oral explainers, or archived recordings related to ${query}.`,
                formattedUrl: "archive.org",
            },
            {
                title: `${query} - Indian legal podcast search`,
                link: "https://open.spotify.com/search/" + encodeURIComponent(query),
                snippet: `Podcast and spoken analysis relevant to ${query}.`,
                formattedUrl: "spotify.com",
            },
        ];
    }

    if (resultType === "images") {
        return [
            {
                title: `${query} - Image references`,
                link: "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query),
                snippet: `Image-focused references and visuals relevant to ${query}.`,
                formattedUrl: "images.google.com",
            },
            {
                title: `${query} - Wikimedia Commons`,
                link: "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=" + encodeURIComponent(query),
                snippet: `Image collections and visual records relevant to ${query}.`,
                formattedUrl: "commons.wikimedia.org",
            },
        ];
    }

    if (resultType === "archives") {
        return [
            {
                title: `${query} - Document archive search`,
                link: "https://archive.org/search?query=" + encodeURIComponent(query),
                snippet: `Archived downloadable bundles and preserved material relevant to ${query}.`,
                formattedUrl: "archive.org",
            },
            {
                title: `${query} - Public records repository`,
                link: "https://www.data.gov.in/",
                snippet: `Downloadable public records and datasets that may relate to ${query}.`,
                formattedUrl: "data.gov.in",
            },
        ];
    }

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

async function searchWithGoogle({ query, fileType, siteRestrict, dateRestrict, num, resultType }) {
    const searchUrl = buildGoogleSearchUrl({ query, fileType, siteRestrict, dateRestrict, num, resultType });
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

async function searchWithGoogleHtml({ query, fileType, siteRestrict, num, resultType }) {
    const { url, headers } = buildGoogleHtmlSearchRequest({ query, fileType, siteRestrict, num, resultType });
    const res  = await fetch(url, { headers });
    const html = await res.text();

    if (!res.ok) {
        throw new Error(`Google HTML search error ${res.status}`);
    }

    if (html.includes("Our systems have detected unusual traffic") || html.includes("recaptcha")) {
        throw new Error("Google blocked the automated request with a bot challenge (Captcha).");
    }

    const dedupedItems = parseGoogleHtmlResults(html, num)
        .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index);

    if (dedupedItems.length === 0) {
        throw new Error("Google HTML returned no parsable search results (Possible layout change or block).");
    }

    const boostedItems = boostPriorityResults(dedupedItems);

    return {
        items: wrapProviderResults(boostedItems, "google_html"),
        meta: {
            provider: "google_html",
            totalResults: dedupedItems.length,
            formattedTotalResults: dedupedItems.length,
            searchTime: null,
        },
    };
}

async function searchWithBing({ query, fileType, siteRestrict, dateRestrict, num, resultType }) {
    const { url, headers } = buildBingSearchRequest({ query, fileType, siteRestrict, dateRestrict, num, resultType });
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

async function searchWithDuckDuckGo({ query, fileType, siteRestrict, num, resultType }) {
    const { url, headers } = buildDuckDuckGoSearchRequest({ query, fileType, siteRestrict, resultType });
    const startTime = Date.now();

    const response = await fetch(url, {
        headers: {
            ...headers,
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const html = await response.text();

    if (isDuckDuckGoChallengePage(html)) {
        throw new Error("DuckDuckGo blocked the automated request with a bot challenge.");
    }

    const items = parseDuckDuckGoHtmlResults(html, num);

    if (items.length === 0) {
        throw new Error("DuckDuckGo returned no parsable search results (Possible layout change or block).");
    }

    return {
        items,
        meta: {
            provider: "duckduckgo",
            totalResults: items.length,
            formattedTotalResults: String(items.length),
            searchTime: (Date.now() - startTime) / 1000,
        },
    };
}

/**
 * GET /api/search
 *
 * Query Params:
 *   q            - search query (required)
 *   type         - all | web | pdf | docx | docs | images | videos | audio | slides | sheets | text | archives | news
 *   fileType     - pdf | doc | docx | ppt | xls | txt | rtf
 *   siteRestrict - official | govonly | courts
 *   dateRestrict - d1 | w1 | m1 | m3 | m6 | y1 | y2 | y5
 *   num          - 1-10 (default 10)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const query        = searchParams.get("q");
    const resultType   = normalizeSearchResultType(searchParams.get("type") || searchParams.get("resultType") || "all");
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
            let payload;
            if (provider === "google") {
                payload = await searchWithGoogle({ query, fileType, siteRestrict, dateRestrict, num, resultType });
            } else if (provider === "google_html") {
                payload = await searchWithGoogleHtml({ query, fileType, siteRestrict, num, resultType });
            } else if (provider === "bing") {
                payload = await searchWithBing({ query, fileType, siteRestrict, dateRestrict, num, resultType });
            } else {
                payload = await searchWithDuckDuckGo({ query, fileType, siteRestrict, num, resultType });
            }

            return NextResponse.json({
                items: payload.items,
                meta: {
                    query,
                    resultType,
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
                stack: error.stack,
            });

            // If Google API failed because it's disabled or quota exceeded, proactively inject google_html
            // if it's not already in the queue, to gracefully degrade to scraping.
            if (provider === "google" && !providerOrder.includes("google_html")) {
                const currentIndex = providerOrder.indexOf("google");
                providerOrder.splice(currentIndex + 1, 0, "google_html");
            }
        }
    }

    console.warn(`[search] All providers failed. Order was:`, providerOrder);
    console.warn(`[search] Failures:`, failures);

    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json({
        items: buildMockResults(query, resultType),
        meta: {
            query,
            resultType,
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
