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
    BING_HTML_IMAGE_CONFIG,
    BING_HTML_TEXT_CONFIG,
    BING_HTML_VIDEO_CONFIG,
    BRAVE_SEARCH_CONFIG
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
    return html.includes("Bot Activity Detected") || html.includes("challenge") || html.includes("blocked");
}

function parseBingHtmlTextResults(html, num) {
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
                    } else {
                       const startBody = block.indexOf('>', snipDivStart) + 1;
                       const endBody = block.indexOf('</div>', startBody);
                       if (endBody !== -1) {
                           snippet = block.substring(startBody, endBody).replace(/<[^>]+>/g, '').substring(0, 150).trim() + "...";
                       }
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

async function searchWithBingHtmlText({ query, num }) {
    const { baseUrl, userAgent } = BING_HTML_TEXT_CONFIG;
    const url = new URL(baseUrl);
    
    url.searchParams.set("q", query);
    url.searchParams.set("first", "1");
    url.searchParams.set("adlt", "moderate");

    const startTime = Date.now();

    const response = await fetch(url.toString(), {
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`Bing HTML Text Search failed: ${response.status}`);
    }

    const html = await response.text();
    const items = parseBingHtmlTextResults(html, num || 10);

    if (items.length === 0) {
        throw new Error("Bing HTML Text Search returned no parsable items.");
    }

    return {
        items,
        meta: {
            provider: "bing_html",
            totalResults: items.length,
            formattedTotalResults: String(items.length),
            searchTime: (Date.now() - startTime) / 1000,
        },
    };
}

function parseBingHtmlImages(html, num) {
    const results = [];
    // Bing images stores JSON data in the `m` attribute of `<a class="iusc">` tags
    const blockRegex = /class="iusc"[^>]*m="(.*?)"/g;

    let match;
    while ((match = blockRegex.exec(html)) !== null && results.length < num) {
        try {
            // Bing escapes quotes in the HTML attribute
            const jsonData = match[1].replace(/&quot;/g, '"');
            const data = JSON.parse(jsonData);

            if (data.murl) {
                results.push({
                    title: data.t || data.desc || "Image",
                    link: data.purl || data.murl, // Source page URL
                    formattedUrl: data.purl || data.murl,
                    snippet: data.desc || data.t || "",
                    image: {
                        thumbnailLink: data.turl || data.murl,
                        url: data.murl, 
                    }
                });
            }
        } catch (e) {
            // Ignore parse errors for individual blocks
        }
    }

    return results;
}

async function searchImagesWithBingHtml({ query, num }) {
    const { baseUrl, userAgent } = BING_HTML_IMAGE_CONFIG;
    const url = new URL(baseUrl);
    
    url.searchParams.set("q", query);
    url.searchParams.set("form", "HDRSC2");
    url.searchParams.set("first", "1");
    url.searchParams.set("adlt", "moderate");

    const startTime = Date.now();

    const response = await fetch(url.toString(), {
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
        },
        next: { revalidate: 3600 }
    });

    if (!response.ok) {
        throw new Error(`Bing HTML Image Search failed: ${response.status}`);
    }

    const html = await response.text();
    const items = parseBingHtmlImages(html, num || 20);

    if (items.length === 0) {
        throw new Error("Bing HTML Image Search returned no parsable images.");
    }

    return {
        items,
        meta: {
            provider: "bing_images",
            totalResults: items.length,
            formattedTotalResults: String(items.length),
            searchTime: (Date.now() - startTime) / 1000,
        },
    };
}

function parseBingHtmlVideos(html, num) {
    const results = [];
    
    // Bing videos - look for video result containers
    const videoBlocks = html.match(/class="mc[^"]*"[^>]*>(.*?)class="meta"/g) || [];
    
    // Alternative parsing - look for video items in the results
    const vidTileRegex = /class="[^"]*vid[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    const titleRegex = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i;
    const linkRegex = /href="([^"]*\/watch\?[^"]*)"/i;
    const thumbRegex = /<img[^>]*src="([^"]*)"[^>]*>/i;
    const durationRegex = /<span[^>]*class="[^"]*dur[^"]*"[^>]*>([^<]+)<\/span>/i;
    
    // Try parsing with different approach - look for video result items
    const resultItems = html.split(/<li[^>]*class="[^"]*b[^_"]*_video[^"]*"[^>]*>/gi);
    
    for (let i = 1; i < resultItems.length && results.length < num; i++) {
        const block = resultItems[i];
        
        // Extract title
        const titleMatch = block.match(/<a[^>]*class="[^"]*mv_title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                          block.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                          block.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        
        // Extract video link
        const linkMatch = block.match(/href="(\/watch\?[^"]+)"/i) ||
                         block.match(/href="(https?:\/\/[^"]+\/watch\?[^"]+)"/i);
        
        // Extract thumbnail
        const thumbMatch = block.match(/<img[^>]*src="([^"]+)"/i);
        
        // Extract duration
        const durationMatch = block.match(/<span[^>]*>([\d:]+\s*min)/i);
        
        // Extract source/channel
        const sourceMatch = block.match(/class="[^"]*cl[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           block.match(/class="[^"]*cite[^"]*"[^>]*>([^<]+)<\/span>/i);
        
        if (titleMatch && linkMatch) {
            const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
            let link = linkMatch[1];
            if (!link.startsWith('http')) {
                link = 'https://www.bing.com' + link;
            }
            
            results.push({
                title: title,
                link: link,
                formattedUrl: new URL(link).hostname.replace('www.', ''),
                snippet: sourceMatch ? sourceMatch[1].replace(/<[^>]*>/g, '').trim() : '',
                duration: durationMatch ? durationMatch[1].trim() : '',
                thumbnail: thumbMatch ? thumbMatch[1] : '',
                video: true
            });
        }
    }
    
    // Fallback: Parse YouTube links from the HTML
    if (results.length < num) {
        const youtubeRegex = /href="(https?:\/\/(?:www\.)?youtube\.com\/watch\?[^"]+)"/gi;
        let match;
        while ((match = youtubeRegex.exec(html)) !== null && results.length < num * 2) {
            const videoUrl = match[1];
            const urlObj = new URL(videoUrl);
            const vId = urlObj.searchParams.get('v');
            
            if (vId && !results.find(r => r.link.includes(vId))) {
                results.push({
                    title: `YouTube Video`,
                    link: videoUrl,
                    formattedUrl: "youtube.com",
                    snippet: `Video content`,
                    thumbnail: `https://img.youtube.com/vi/${vId}/mqdefault.jpg`,
                    video: true
                });
            }
        }
    }
    
    // Parse YouTube Shorts
    if (results.length < num) {
        const shortsRegex = /href="(https?:\/\/(?:www\.)?youtube\.com\/shorts\/[^"?]+)"/gi;
        let match;
        while ((match = shortsRegex.exec(html)) !== null && results.length < num * 2) {
            const videoUrl = match[1];
            const videoId = videoUrl.split('/shorts/')[1]?.split('?')[0];
            
            if (videoId && !results.find(r => r.link.includes(videoId))) {
                results.push({
                    title: `YouTube Shorts`,
                    link: videoUrl,
                    formattedUrl: "youtube.com",
                    snippet: `Short video content`,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                    video: true
                });
            }
        }
    }
    
    // Parse Dailymotion
    if (results.length < num) {
        const dailymotionRegex = /href="(https?:\/\/(?:www\.)?dailymotion\.com\/video\/[^"?_]+)"/gi;
        let match;
        while ((match = dailymotionRegex.exec(html)) !== null && results.length < num * 2) {
            const videoUrl = match[1];
            if (!results.find(r => r.link === videoUrl)) {
                results.push({
                    title: `Dailymotion Video`,
                    link: videoUrl,
                    formattedUrl: "dailymotion.com",
                    snippet: `Video content on Dailymotion`,
                    video: true
                });
            }
        }
    }
    
    // Parse Vimeo
    if (results.length < num) {
        const vimeoRegex = /href="(https?:\/\/(?:www\.)?vimeo\.com\/\d+)"/gi;
        let match;
        while ((match = vimeoRegex.exec(html)) !== null && results.length < num * 2) {
            const videoUrl = match[1];
            if (!results.find(r => r.link === videoUrl)) {
                results.push({
                    title: `Vimeo Video`,
                    link: videoUrl,
                    formattedUrl: "vimeo.com",
                    snippet: `Video content on Vimeo`,
                    video: true
                });
            }
        }
    }
    
    return results;
    
    // Also add Dailymotion and Vimeo
    if (results.length < num) {
        const dailymotionRegex = /href="(https?:\/\/(?:www\.)?dailymotion\.com\/video\/[^"]+)"/gi;
        let match;
        while ((match = dailymotionRegex.exec(html)) !== null && results.length < num * 2) {
            if (!results.find(r => r.link === match[1])) {
                results.push({
                    title: `${query} - Dailymotion`,
                    link: match[1],
                    formattedUrl: "dailymotion.com",
                    snippet: `Video content on Dailymotion related to ${query}`,
                    video: true
                });
            }
        }
    }
    
    return results;
}

async function searchVideosWithBingHtml({ query, num }) {
    const { baseUrl, userAgent } = BING_HTML_VIDEO_CONFIG;
    const url = new URL(baseUrl);
    
    url.searchParams.set("q", query);
    url.searchParams.set("first", "1");
    url.searchParams.set("adlt", "moderate");
    url.searchParams.set("form", "HDRSC1");

    const startTime = Date.now();

    const response = await fetch(url.toString(), {
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,video/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
        },
        next: { revalidate: 3600 }
    });

    if (!response.ok) {
        throw new Error(`Bing HTML Video Search failed: ${response.status}`);
    }

    const html = await response.text();
    const items = parseBingHtmlVideos(html, num || 15);

    if (items.length === 0) {
        throw new Error("Bing HTML Video Search returned no parsable videos.");
    }

    return {
        items,
        meta: {
            provider: "bing_videos",
            totalResults: items.length,
            formattedTotalResults: String(items.length),
            searchTime: (Date.now() - startTime) / 1000,
        },
    };
}

async function searchWithBrave({ query, num }) {
    const { apiKey, baseUrl } = BRAVE_SEARCH_CONFIG;
    
    if (!apiKey) {
        throw new Error("Brave Search API key not configured");
    }
    
    const url = new URL(baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(num || 20));
    url.searchParams.set("country", "IN");
    url.searchParams.set("search_lang", "en");

    const startTime = Date.now();
    
    const response = await fetch(url.toString(), {
        headers: {
            "X-Subscription-Token": apiKey,
            "Accept": "application/json",
        },
        next: { revalidate: 60 }
    });

    if (!response.ok) {
        throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    const items = (data.web?.results || []).map((item) => ({
        title: item.title,
        link: item.url,
        snippet: item.description,
        formattedUrl: item.domain,
    }));

    if (items.length === 0) {
        throw new Error("Brave Search returned no results");
    }

    return {
        items,
        meta: {
            provider: "brave",
            totalResults: data.web?.totalResults || items.length,
            formattedTotalResults: String(data.web?.totalResults || items.length),
            searchTime: (Date.now() - startTime) / 1000,
        },
    };
}

function buildMockResults(query, resultType = "all") {
    const q = query.toLowerCase();
    const isLegal = q.includes('law') || q.includes('court') || q.includes('section') || q.includes('ipc') || 
                    q.includes('crpc') || q.includes('cpc') || q.includes('constitution') || q.includes('article') ||
                    q.includes('judgment') || q.includes('act') || q.includes('legal') || q.includes('criminal') ||
                    q.includes('civil') || q.includes('property') || q.includes('divorce') || q.includes('tenant') ||
                    q.includes('land') || q.includes('rental') || q.includes('cheque') || q.includes('bail') ||
                    q.includes(' FIR') || q.includes('police') || q.includes('complaint');
    
    if (resultType === "videos") {
        return [
            {
                title: `${query} - Supreme Court of India Official Channel`,
                link: "https://www.youtube.com/@supremecourtofindia",
                snippet: `Official video content, explainers, and hearings related to ${query}.`,
                formattedUrl: "youtube.com",
            },
            {
                title: `${query} - LiveLaw Legal Coverage`,
                link: "https://www.youtube.com/@LiveLawIndia",
                snippet: `Legal explainers and court coverage relevant to ${query}.`,
                formattedUrl: "youtube.com",
            },
            {
                title: `${query} - LegalEagle (India)`,
                link: "https://www.youtube.com/results?search_query=" + encodeURIComponent(query + " India legal"),
                snippet: `Indian legal explanations and case analysis on ${query}.`,
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

    // Enhanced legal-specific results
    if (isLegal) {
        return [
            {
                title: `Supreme Court of India - ${query}`,
                link: "https://main.sci.gov.in/",
                snippet: `Official Supreme Court of India portal. Search rulings, case status, and judgments related to: ${query}.`,
                formattedUrl: "main.sci.gov.in",
            },
            {
                title: `Indian Kanoon - ${query}`,
                link: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
                snippet: `Search legal documents, judgments, Bare Acts, and legal articles related to: ${query}.`,
                formattedUrl: "indiankanoon.org",
            },
            {
                title: `Ministry of Law & Justice`,
                link: "https://lawmin.gov.in/",
                snippet: `Official government portal for legislative acts, legal affairs, and justice department.`,
                formattedUrl: "lawmin.gov.in",
            },
            {
                title: `India Code - Bare Acts`,
                link: "https://indiacode.nic.in/",
                snippet: `Browse and search Indian statutes, bare acts, and codified laws.`,
                formattedUrl: "indiacode.nic.in",
            },
            {
                title: `LiveLaw - Legal News`,
                link: "https://www.livelaw.in/",
                snippet: `Latest legal news, Supreme Court & High Court judgments, case analysis.`,
                formattedUrl: "www.livelaw.in",
            },
            {
                title: `Bar & Bench - Legal Updates`,
                link: "https://www.barandbench.com/",
                snippet: `Breaking legal news, court judgments, and legal analysis in India.`,
                formattedUrl: "barandbench.com",
            },
            {
                title: `India Judicial Data`,
                link: "https://njdg.ecourts.gov.in/",
                snippet: `National Judicial Data Grid - Search case status across Indian courts.`,
                formattedUrl: "njdg.ecourts.gov.in",
            },
        ];
    }

    // Non-legal default results
    return [
        {
            title: `${query} - Google Search`,
            link: "https://www.google.com/search?q=" + encodeURIComponent(query),
            snippet: `Search the web for: ${query}`,
            formattedUrl: "google.com",
        },
        {
            title: `${query} - Wikipedia`,
            link: "https://en.wikipedia.org/wiki/Special:Search?search=" + encodeURIComponent(query),
            snippet: `Search Wikipedia for: ${query}`,
            formattedUrl: "en.wikipedia.org",
        },
        {
            title: `${query} - YouTube`,
            link: "https://www.youtube.com/results?search_query=" + encodeURIComponent(query),
            snippet: `Watch videos about: ${query}`,
            formattedUrl: "youtube.com",
        },
        {
            title: `${query} - Indian Legal Resources`,
            link: "https://indiankanoon.org/search/?formInput=" + encodeURIComponent(query),
            snippet: `Search Indian legal documents for: ${query}`,
            formattedUrl: "indiankanoon.org",
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
    const res  = await fetch(url, { headers, next: { revalidate: 30 } });
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
            formattedTotalResults: String(dedupedItems.length),
            searchTime: null,
        },
    };
}

// Enhanced video search - try multiple sources
async function searchVideosLive({ query, num }) {
    const results = [];
    const seenUrls = new Set();
    
    // Try Bing Videos first
    try {
        const bingResults = await searchVideosWithBingHtml({ query, num: num * 2 });
        for (const item of bingResults.items) {
            if (!seenUrls.has(item.link)) {
                seenUrls.add(item.link);
                results.push(item);
            }
        }
    } catch (e) {
        console.log("Bing videos failed:", e.message);
    }
    
    // If not enough results, try Google Videos
    if (results.length < num) {
        try {
            const googleResults = await searchWithGoogleHtml({ 
                query, 
                num: (num - results.length) * 2,
                resultType: 'videos'
            });
            for (const item of googleResults.items) {
                if (!seenUrls.has(item.link) && results.length < num * 3) {
                    // Check if it's a video URL
                    if (item.link.includes('youtube') || item.link.includes('youtu.be') || 
                        item.link.includes('vimeo') || item.link.includes('dailymotion')) {
                        seenUrls.add(item.link);
                        results.push({ ...item, video: true });
                    }
                }
            }
        } catch (e) {
            console.log("Google videos failed:", e.message);
        }
    }
    
    if (results.length === 0) {
        throw new Error("No video results from any source");
    }
    
    return {
        items: results.slice(0, num),
        meta: {
            provider: "live_videos",
            totalResults: results.length,
            formattedTotalResults: String(results.length),
            searchTime: null,
        },
    };
}

// Enhanced image search - try multiple sources
async function searchImagesLive({ query, num }) {
    const results = [];
    const seenUrls = new Set();
    
    // Try Bing Images first
    try {
        const bingResults = await searchImagesWithBingHtml({ query, num: num * 2 });
        for (const item of bingResults.items) {
            if (!seenUrls.has(item.link)) {
                seenUrls.add(item.link);
                results.push(item);
            }
        }
    } catch (e) {
        console.log("Bing images failed:", e.message);
    }
    
    // If not enough results, try Google Images
    if (results.length < num) {
        try {
            const googleResults = await searchWithGoogleHtml({ 
                query, 
                num: (num - results.length) * 2,
                resultType: 'images'
            });
            for (const item of googleResults.items) {
                if (!seenUrls.has(item.link) && results.length < num * 3) {
                    seenUrls.add(item.link);
                    results.push(item);
                }
            }
        } catch (e) {
            console.log("Google images failed:", e.message);
        }
    }
    
    if (results.length === 0) {
        throw new Error("No image results from any source");
    }
    
    return {
        items: results.slice(0, num),
        meta: {
            provider: "live_images",
            totalResults: results.length,
            formattedTotalResults: String(results.length),
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
 *   num          - number of results (default 20, max 50)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const query        = searchParams.get("q");
    const resultType   = searchParams.get("type") || searchParams.get("resultType") || "all";
    const fileType     = searchParams.get("fileType") || null;
    const siteRestrict = searchParams.get("siteRestrict") || null;
    const dateRestrict = searchParams.get("dateRestrict") || null;
    // Allow more results - default 20, max 50
    const num          = Math.min(50, Math.max(1, parseInt(searchParams.get("num") || "20", 10)));

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    const normalizedResultType = normalizeSearchResultType(resultType);

    // Completely bypass normal text search waterfall for pure Image queries - use live search
    if (normalizedResultType === "images") {
        try {
            console.log(`[Search API] Executing Live Image Search for: "${query}"`);
            const results = await searchImagesLive({ query, num: num * 2 });
            return NextResponse.json(results);
        } catch (e) {
            console.error("[Search API] Image Live Search failed:", e.message);
            // Try fallback to Bing HTML
            try {
                const fallbackResults = await searchImagesWithBingHtml({ query, num });
                return NextResponse.json(fallbackResults);
            } catch (fallbackError) {
                console.error("[Search API] Image Fallback also failed:", fallbackError.message);
                return NextResponse.json({
                    items: [],
                    meta: {
                        provider: "no_images",
                        isMock: false,
                        totalResults: 0,
                        formattedTotalResults: "0",
                        searchTime: null,
                        error: "No image results available"
                    }
                });
            }
        }
    }

    // Completely bypass normal text search waterfall for pure Video queries - use live search
    if (normalizedResultType === "videos") {
        try {
            console.log(`[Search API] Executing Live Video Search for: "${query}"`);
            const results = await searchVideosLive({ query, num: num * 2 });
            return NextResponse.json(results);
        } catch (e) {
            console.error("[Search API] Video Live Search failed:", e.message);
            // Try fallback to Bing HTML
            try {
                const fallbackResults = await searchVideosWithBingHtml({ query, num });
                return NextResponse.json(fallbackResults);
            } catch (fallbackError) {
                console.error("[Search API] Video Fallback also failed:", fallbackError.message);
                return NextResponse.json({
                    items: [],
                    meta: {
                        provider: "no_videos",
                        isMock: false,
                        totalResults: 0,
                        formattedTotalResults: "0",
                        searchTime: null,
                        error: "No video results available"
                    }
                });
            }
        }
    }

    // Use live search providers (no API key required)
    const providerOrder = ["brave", "bing_html", "google_html", "duckduckgo"];
    const attemptedProviders = [];
    const failures = [];

    for (const provider of providerOrder) {
        attemptedProviders.push(provider);

        try {
            let payload;
            if (provider === "google_html") {
                payload = await searchWithGoogleHtml({ query, fileType, siteRestrict, num, resultType });
            } else if (provider === "bing_html") {
                payload = await searchWithBingHtmlText({ query, num });
            } else if (provider === "brave") {
                payload = await searchWithBrave({ query, num });
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
            console.warn(`[search] ${provider} failed:`, error.message);
            failures.push({
                provider,
                message: error.message,
            });
        }
    }

    // If all live providers fail, try API-based search as last resort
    const apiProviderOrder = getSearchProviderOrder()
        .filter((p) => p === "google" || p === "bing");

    for (const provider of apiProviderOrder) {
        if (provider === "mock") continue;
        
        attemptedProviders.push(provider);

        try {
            let payload;
            if (provider === "google") {
                payload = await searchWithGoogle({ query, fileType, siteRestrict, dateRestrict, num, resultType });
            } else if (provider === "bing") {
                payload = await searchWithBing({ query, fileType, siteRestrict, dateRestrict, num, resultType });
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
            console.warn(`[search] ${provider} API failed:`, error.message);
            failures.push({
                provider,
                message: error.message,
            });
        }
    }

    console.warn(`[search] All providers failed. Order was:`, providerOrder);
    console.warn(`[search] Failures:`, failures);

    // Return enhanced mock results as fallback
    const mockItems = buildMockResults(query, resultType);
    
    return NextResponse.json({
        items: mockItems,
        meta: {
            query,
            resultType,
            fileType,
            siteRestrict,
            dateRestrict,
            provider: "fallback",
            requestedProvider: CUSTOM_SEARCH_PRIORITY,
            attemptedProviders,
            failures,
            isMock: true,
            totalResults: mockItems.length,
            formattedTotalResults: String(mockItems.length),
            note: "Showing curated legal resources. Live search unavailable."
        },
    });
}
