/**
 * searchConfig.js
 * ============================================================
 * AdvocateHub AI — Central Search & AI Configuration
 *
 * This file is SERVER-SIDE ONLY. Never import in client components.
 * All tunable values are read from .env.local where possible.
 * ============================================================
 */
import { normalizeSearchResultType } from "@/lib/searchFilters";

// ── Priority Sites ──────────────────────────────────────────
// Domains listed here will be ranked to the TOP of search results.
// Adjust weights (higher = more important) to control priority ordering.
export const PRIORITY_SITES = [
    // Tier 1 — Supreme Court & High Courts
    { domain: "main.sci.gov.in",        weight: 100, label: "Supreme Court of India" },
    { domain: "delhihighcourt.nic.in",  weight: 95,  label: "Delhi High Court" },
    { domain: "bombayhighcourt.nic.in", weight: 95,  label: "Bombay High Court" },
    { domain: "calcuttahighcourt.gov.in",weight: 95, label: "Calcutta High Court" },
    { domain: "madrazhighcourt.tn.gov.in",weight: 95,label: "Madras High Court" },

    // Tier 2 — Government Legal & Legislative Bodies
    { domain: "lawmin.gov.in",          weight: 90,  label: "Ministry of Law & Justice" },
    { domain: "legislative.gov.in",     weight: 90,  label: "Legislative Dept. of India" },
    { domain: "indiacode.nic.in",       weight: 90,  label: "India Code Portal" },
    { domain: "legalaffairs.gov.in",    weight: 88,  label: "Legal Affairs Dept." },
    { domain: "njac.gov.in",            weight: 85,  label: "National Judicial Appt. Commission" },

    // Tier 3 — National Government Portals
    { domain: "india.gov.in",           weight: 82,  label: "National Portal of India" },
    { domain: "mca.gov.in",             weight: 80,  label: "Ministry of Corporate Affairs" },
    { domain: "rbi.org.in",             weight: 80,  label: "Reserve Bank of India" },
    { domain: "sebi.gov.in",            weight: 80,  label: "SEBI" },
    { domain: "irdai.gov.in",           weight: 78,  label: "IRDAI" },
    { domain: "cci.gov.in",             weight: 78,  label: "Competition Commission of India" },

    // Tier 4 — Trusted Legal Research Platforms
    { domain: "indiankanoon.org",       weight: 75,  label: "Indian Kanoon" },
    { domain: "manupatra.com",          weight: 72,  label: "Manupatra" },
    { domain: "scconline.com",          weight: 72,  label: "SCC Online" },
    { domain: "livelaw.in",             weight: 68,  label: "LiveLaw" },
    { domain: "barandbench.com",        weight: 65,  label: "Bar & Bench" },
    { domain: "lawyerservices.in",      weight: 62,  label: "Lawyer Services" },
    { domain: "advocatehub.org",        weight: 60,  label: "AdvocateHub" },
];

// Returns the priority weight for a given URL (0 if not a priority site)
export function getPriorityWeight(url) {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, "");
        const match = PRIORITY_SITES.find((s) => hostname === s.domain || hostname.endsWith("." + s.domain));
        return match ? match.weight : 0;
    } catch {
        return 0;
    }
}

// Sorts a results array so priority domains float to the top
export function boostPriorityResults(items = []) {
    return [...items].sort((a, b) => {
        const wa = getPriorityWeight(a.link || "");
        const wb = getPriorityWeight(b.link || "");
        return wb - wa; // descending — higher weight first
    });
}

// ── File-type & Content Filters ────────────────────────────
// These filter strings are appended to the Google CSE query.
export const FILE_TYPE_FILTERS = {
    pdf:     "filetype:pdf",
    doc:     "filetype:doc",
    docx:    "filetype:docx",
    ppt:     "filetype:ppt",
    pptx:    "filetype:pptx",
    xls:     "filetype:xls",
    xlsx:    "filetype:xlsx",
    txt:     "filetype:txt",
    rtf:     "filetype:rtf",
};

export const SEARCH_RESULT_TYPE_FILTERS = {
    all:    "",
    web:    "",
    pdf:    "filetype:pdf",
    docx:   "filetype:docx",
    docs:   "(filetype:doc OR filetype:docx)",
    images: "(filetype:jpg OR filetype:jpeg OR filetype:png OR filetype:webp OR filetype:svg)",
    videos: "(site:youtube.com OR site:vimeo.com OR site:dailymotion.com OR site:archive.org)",
    audio:  "(filetype:mp3 OR filetype:wav OR filetype:m4a OR site:soundcloud.com OR site:spotify.com OR site:archive.org)",
    slides: "(filetype:ppt OR filetype:pptx)",
    sheets: "(filetype:xls OR filetype:xlsx OR filetype:csv)",
    text:   "(filetype:txt OR filetype:rtf)",
    archives: "(filetype:zip OR filetype:rar OR filetype:7z)",
    news:   "(site:livelaw.in OR site:barandbench.com OR site:thehindu.com OR site:indianexpress.com)",
};

// Date restriction options (Google CSE format)
export const DATE_RESTRICT_OPTIONS = {
    d1:  "d1",   // past 24 hours
    w1:  "w1",   // past week
    m1:  "m1",   // past month
    m3:  "m3",   // past 3 months
    m6:  "m6",   // past 6 months
    y1:  "y1",   // past year
    y2:  "y2",   // past 2 years
    y5:  "y5",   // past 5 years
};

// Bing only supports coarse freshness buckets.
const BING_FRESHNESS_OPTIONS = {
    d1: "Day",
    w1: "Week",
    m1: "Month",
    m3: "Month",
    m6: "Month",
};

export const DUCKDUCKGO_SEARCH_CONFIG = {
    baseUrl: process.env.DUCKDUCKGO_SEARCH_BASE_URL || "https://html.duckduckgo.com/html/",
    userAgent: process.env.DUCKDUCKGO_SEARCH_USER_AGENT || "Mozilla/5.0 (compatible; AdvocateHubBot/1.0; +https://advocatehub.org)",
};

// Site restrict modes
export const SITE_RESTRICT_MODES = {
    // Only official priority domains
    official: PRIORITY_SITES.slice(0, 15).map((s) => "site:" + s.domain).join(" OR "),
    // Only Indian government (.gov.in, .nic.in)
    govonly:  "site:.gov.in OR site:.nic.in",
    // Only courts
    courts:   "site:sci.gov.in OR site:.highcourt.nic.in OR site:.highcourt.gov.in",
};

export function normalizeSearchPriority(value = "google") {
    const priority = value.trim().toLowerCase();
    const compact  = priority.replace(/[\s_-]+/g, "");

    if (compact === "bing") {
        return "bing";
    }

    // Accept the user's likely typo too.
    if (compact === "googole" || compact === "google") {
        return "google";
    }

    if (compact === "duckduckgo" || compact === "ddg" || compact === "duck") {
        return "duckduckgo";
    }

    return "google";
}

// ── Google Custom Search API Defaults ──────────────────────
export const GOOGLE_SEARCH_CONFIG = {
    apiKey:          process.env.GOOGLE_API_KEY,
    cx:              process.env.GOOGLE_SEARCH_CX,
    countryRestrict: process.env.SEARCH_COUNTRY_RESTRICT || "countryIN",
    hl:              process.env.SEARCH_HL              || "en",
    safe:            process.env.SEARCH_SAFE            || "off",
    num:             parseInt(process.env.SEARCH_NUM    || "10", 10),
    baseUrl:         "https://www.googleapis.com/customsearch/v1",
};

// Backwards-compatible alias for the existing Google config.
export const SEARCH_CONFIG = GOOGLE_SEARCH_CONFIG;

export const GOOGLE_HTML_SEARCH_CONFIG = {
    baseUrl: "https://www.google.com/search",
    userAgent: process.env.GOOGLE_HTML_SEARCH_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export const BING_SEARCH_CONFIG = {
    apiKey:         process.env.BING_SEARCH_API_KEY || process.env.BING_API_KEY || "",
    customConfigId: process.env.BING_CUSTOM_CONFIG_ID || process.env.BING_SEARCH_CUSTOM_CONFIG_ID || "",
    market:         process.env.BING_SEARCH_MARKET || "en-IN",
    safeSearch:     process.env.BING_SEARCH_SAFE || "Moderate",
    num:            parseInt(process.env.BING_SEARCH_NUM || process.env.SEARCH_NUM || "10", 10),
    baseUrl:        process.env.BING_SEARCH_BASE_URL || "https://api.bing.microsoft.com/v7.0/custom/search",
};

export const CUSTOM_SEARCH_PRIORITY = normalizeSearchPriority(process.env.CUSTOM_SEARCH_PRIORITY || "google");

export function buildAugmentedSearchQuery({ query, fileType, siteRestrict, resultType } = {}) {
    let q = query.trim();
    const normalizedResultType = normalizeSearchResultType(resultType);

    if (fileType && FILE_TYPE_FILTERS[fileType]) {
        q += " " + FILE_TYPE_FILTERS[fileType];
    }

    if (normalizedResultType !== "all" && SEARCH_RESULT_TYPE_FILTERS[normalizedResultType]) {
        q += " " + SEARCH_RESULT_TYPE_FILTERS[normalizedResultType];
    }

    if (siteRestrict && SITE_RESTRICT_MODES[siteRestrict]) {
        q += " " + SITE_RESTRICT_MODES[siteRestrict];
    }

    return q;
}

// Builds the Google CSE request URL with all active filters
export function buildGoogleSearchUrl({ query, fileType, siteRestrict, dateRestrict, num, resultType } = {}) {
    const { apiKey, cx, countryRestrict, hl, safe, baseUrl, num: defaultNum } = GOOGLE_SEARCH_CONFIG;
    const url = new URL(baseUrl);
    const normalizedResultType = normalizeSearchResultType(resultType);
    const q   = buildAugmentedSearchQuery({ query, fileType, siteRestrict, resultType });

    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx",  cx);
    url.searchParams.set("q",   q);
    url.searchParams.set("cr",  countryRestrict);
    url.searchParams.set("hl",  hl);
    url.searchParams.set("safe",safe);
    url.searchParams.set("num", String(num || defaultNum));

    if (dateRestrict && DATE_RESTRICT_OPTIONS[dateRestrict]) {
        url.searchParams.set("dateRestrict", DATE_RESTRICT_OPTIONS[dateRestrict]);
    }

    if (normalizedResultType === "images") {
        url.searchParams.set("searchType", "image");
    }

    return url.toString();
}

// Backwards-compatible alias for existing imports.
export const buildSearchUrl = buildGoogleSearchUrl;

export function buildGoogleHtmlSearchRequest({ query, fileType, siteRestrict, num, resultType } = {}) {
    const { baseUrl, userAgent } = GOOGLE_HTML_SEARCH_CONFIG;
    const url = new URL(baseUrl);
    const q   = buildAugmentedSearchQuery({ query, fileType, siteRestrict, resultType });

    url.searchParams.set("q", q);
    url.searchParams.set("num", String(num || 10));
    url.searchParams.set("hl", "en");
    url.searchParams.set("gl", "in"); // Geolocation to India

    if (normalizeSearchResultType(resultType) === "images") {
        url.searchParams.set("tbm", "isch");
    }

    return {
        url: url.toString(),
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
        },
    };
}

export function buildBingSearchRequest({ query, fileType, siteRestrict, dateRestrict, num, resultType } = {}) {
    const { apiKey, customConfigId, market, safeSearch, baseUrl, num: defaultNum } = BING_SEARCH_CONFIG;
    const url = new URL(baseUrl);
    const q   = buildAugmentedSearchQuery({ query, fileType, siteRestrict, resultType });

    url.searchParams.set("q", q);
    url.searchParams.set("count", String(num || defaultNum));
    url.searchParams.set("mkt", market);
    url.searchParams.set("safeSearch", safeSearch);

    if (customConfigId) {
        url.searchParams.set("customconfig", customConfigId);
    }

    if (dateRestrict && BING_FRESHNESS_OPTIONS[dateRestrict]) {
        url.searchParams.set("freshness", BING_FRESHNESS_OPTIONS[dateRestrict]);
    }

    return {
        url: url.toString(),
        headers: {
            "Ocp-Apim-Subscription-Key": apiKey,
        },
    };
}

export function buildDuckDuckGoSearchRequest({ query, fileType, siteRestrict, resultType } = {}) {
    const { baseUrl, userAgent } = DUCKDUCKGO_SEARCH_CONFIG;
    const url = new URL(baseUrl);
    const q   = buildAugmentedSearchQuery({ query, fileType, siteRestrict, resultType });

    url.searchParams.set("q", q);
    url.searchParams.set("kl", "in-en");

    return {
        url: url.toString(),
        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml",
        },
    };
}

export function resolveSearchProvider(priority = CUSTOM_SEARCH_PRIORITY) {
    const normalizedPriority = normalizeSearchPriority(priority);
    const hasGoogleKey = Boolean(GOOGLE_SEARCH_CONFIG.apiKey && GOOGLE_SEARCH_CONFIG.cx);
    const hasBing      = Boolean(BING_SEARCH_CONFIG.apiKey && BING_SEARCH_CONFIG.customConfigId);
    const hasDuckDuckGo = Boolean(DUCKDUCKGO_SEARCH_CONFIG.baseUrl);

    if (normalizedPriority === "bing") {
        if (hasBing) return "bing";
        if (hasGoogleKey) return "google";
        if (hasDuckDuckGo) return "duckduckgo";
        return "google_html"; // fallback to html scraper
    }

    if (normalizedPriority === "duckduckgo") {
        if (hasDuckDuckGo) return "duckduckgo";
        if (hasGoogleKey) return "google";
        if (hasBing) return "bing";
        return "google_html";
    }

    if (normalizedPriority === "google_html") {
        return "google_html";
    }

    if (hasGoogleKey) return "google";
    return "google_html"; // Default to headless google if no keys
}

export function getSearchProviderOrder(priority = CUSTOM_SEARCH_PRIORITY) {
    const normalizedPriority = normalizeSearchPriority(priority);
    const hasGoogleKey = Boolean(GOOGLE_SEARCH_CONFIG.apiKey && GOOGLE_SEARCH_CONFIG.cx);
    const hasBing      = Boolean(BING_SEARCH_CONFIG.apiKey && BING_SEARCH_CONFIG.customConfigId);
    const hasDuckDuckGo = Boolean(DUCKDUCKGO_SEARCH_CONFIG.baseUrl);
    const ordered = [];

    function add(provider, enabled) {
        if (enabled && !ordered.includes(provider)) {
            ordered.push(provider);
        }
    }

    // "google_html" is always available since it requires no API key.
    if (normalizedPriority === "bing") {
        add("bing", hasBing);
        if (hasGoogleKey) add("google", true);
        else add("google_html", true);
        add("duckduckgo", hasDuckDuckGo);
    } else if (normalizedPriority === "duckduckgo") {
        add("duckduckgo", hasDuckDuckGo);
        if (hasGoogleKey) add("google", true);
        else add("google_html", true);
        add("bing", hasBing);
    } else if (normalizedPriority === "google_html") {
        add("google_html", true);
        if (hasGoogleKey) add("google", true);
        add("duckduckgo", hasDuckDuckGo);
        add("bing", hasBing);
    } else {
        if (hasGoogleKey) add("google", true);
        else add("google_html", true);
        
        add("bing", hasBing);
        add("duckduckgo", hasDuckDuckGo);
    }

    if (ordered.length === 0) {
        ordered.push("mock");
    }

    return ordered;
}

// ── Gemini AI Configuration ────────────────────────────────
export const DEFAULT_SYSTEM_INSTRUCTION = `You are AdvocateHub AI, an expert Indian legal assistant.
You are powered by Google Gemini and grounded with real-time Google Search results.
Specialise in: Indian laws, IPC, CrPC, CPC, Constitution, High Court & Supreme Court judgments, property law, family law, corporate law, consumer rights, and legal procedures.
Always cite your sources. Format responses clearly using markdown with headings, bullet points, and numbered lists where appropriate.
When referencing legal sections or acts, be precise and cite the full name (e.g., "Section 302 of the Indian Penal Code, 1860").
Respond in a professional yet accessible tone. If a question is outside Indian law, still answer helpfully while noting any jurisdictional limits.`;

export const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model:  process.env.GEMINI_MODEL || "gemini-2.0-flash",

    // System instruction: sets the AI's persona and legal expertise context
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,

    // Google Search grounding settings
    groundingConfig: {
        googleSearch: {},  // enable Google Search grounding tool
    },

    // Generation config
    generationConfig: {
        temperature:     0.7,
        topK:            40,
        topP:            0.95,
        maxOutputTokens: 2048,
    },
};

// ── Custom OpenAI-compatible LLM Configuration ─────────────
// Supports providers like OpenAI, OpenRouter, Groq, Ollama, LM Studio, etc.
export const CUSTOM_LLM_CONFIG = {
    provider:    process.env.CUSTOM_LLM_PROVIDER || "auto",
    url:         process.env.CUSTOM_LLM_URL || process.env.CUSTOM_LLM_BASE_URL || "",
    apiKey:      process.env.CUSTOM_LLM_API_KEY || "",
    model:       process.env.CUSTOM_LLM_MODEL || "",
    systemPrompt: process.env.CUSTOM_LLM_SYSTEM_PROMPT || DEFAULT_SYSTEM_INSTRUCTION,
    temperature: parseFloat(process.env.CUSTOM_LLM_TEMPERATURE || "0.7"),
    maxTokens:   parseInt(process.env.CUSTOM_LLM_MAX_TOKENS || "2048", 10),
    anthropicVersion: process.env.CUSTOM_LLM_ANTHROPIC_VERSION || "2023-06-01",
    siteUrl:     process.env.CUSTOM_LLM_SITE_URL || process.env.OPENROUTER_SITE_URL || "",
    appName:     process.env.CUSTOM_LLM_APP_NAME || process.env.OPENROUTER_APP_NAME || "AdvocateHub",
};

function resolveStringOverride(overrideValue, fallbackValue = "") {
    if (typeof overrideValue === "string") {
        const trimmed = overrideValue.trim();
        return trimmed || fallbackValue;
    }

    return fallbackValue;
}

export function normalizeCustomLlmProvider(value = "auto") {
    const compact = value.trim().toLowerCase().replace(/[\s_-]+/g, "");

    if (!compact || compact === "auto") {
        return "auto";
    }

    if (compact === "anthropic" || compact === "claude") {
        return "anthropic";
    }

    if (compact === "openrouter" || compact === "router") {
        return "openrouter";
    }

    return "openai";
}

function inferCustomLlmProvider(url = "") {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname.toLowerCase().replace(/\/+$/, "");

        if (hostname.includes("openrouter.ai")) {
            return "openrouter";
        }

        if (hostname.includes("anthropic") || pathname.endsWith("/messages") || pathname.includes("/v1/messages")) {
            return "anthropic";
        }
    } catch {
        // Fall back to the default OpenAI-compatible behavior below.
    }

    return "openai";
}

export function resolveCustomLlmConfig(overrides = {}) {
    const hasExplicitChoice = typeof overrides.enabled === "boolean";
    const providerSetting   = normalizeCustomLlmProvider(overrides.provider ?? CUSTOM_LLM_CONFIG.provider);
    const url               = resolveStringOverride(overrides.url ?? overrides.baseUrl, CUSTOM_LLM_CONFIG.url).trim();
    const apiKey            = resolveStringOverride(overrides.apiKey, CUSTOM_LLM_CONFIG.apiKey).trim();
    const model             = resolveStringOverride(overrides.model, CUSTOM_LLM_CONFIG.model).trim();
    const systemPrompt      = resolveStringOverride(overrides.systemPrompt, CUSTOM_LLM_CONFIG.systemPrompt).trim() || DEFAULT_SYSTEM_INSTRUCTION;
    const temperature       = Number.isFinite(Number(overrides.temperature))
        ? Number(overrides.temperature)
        : CUSTOM_LLM_CONFIG.temperature;
    const maxTokens         = Number.isFinite(Number(overrides.maxTokens))
        ? Number(overrides.maxTokens)
        : CUSTOM_LLM_CONFIG.maxTokens;
    const anthropicVersion  = resolveStringOverride(overrides.anthropicVersion, CUSTOM_LLM_CONFIG.anthropicVersion).trim() || "2023-06-01";
    const siteUrl           = (overrides.siteUrl ?? CUSTOM_LLM_CONFIG.siteUrl).trim();
    const appName           = resolveStringOverride(overrides.appName, CUSTOM_LLM_CONFIG.appName).trim() || "AdvocateHub";
    const missingFields     = [];
    const provider          = providerSetting === "auto" ? inferCustomLlmProvider(url) : providerSetting;

    if (!url) {
        missingFields.push("URL");
    }

    if (!model) {
        missingFields.push("model");
    }

    const isConfigured = missingFields.length === 0;
    const shouldUse    = overrides.enabled === true || (!hasExplicitChoice && isConfigured);

    return {
        enabled: overrides.enabled === true,
        shouldUse,
        isConfigured,
        missingFields,
        provider,
        providerSetting,
        url,
        apiKey,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        anthropicVersion,
        siteUrl,
        appName,
    };
}

export function buildOpenAICompatibleChatUrl(inputUrl) {
    const url      = new URL(inputUrl);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (pathname.endsWith("/chat/completions")) {
        return url.toString();
    }

    if (pathname.endsWith("/v1")) {
        url.pathname = `${pathname}/chat/completions`;
        return url.toString();
    }

    url.pathname = pathname ? `${pathname}/v1/chat/completions` : "/v1/chat/completions";
    return url.toString();
}

export function buildAnthropicMessagesUrl(inputUrl) {
    const url      = new URL(inputUrl);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (pathname.endsWith("/messages")) {
        return url.toString();
    }

    if (pathname.endsWith("/v1")) {
        url.pathname = `${pathname}/messages`;
        return url.toString();
    }

    url.pathname = pathname ? `${pathname}/v1/messages` : "/v1/messages";
    return url.toString();
}

export function buildOpenRouterHeaders(llmConfig = {}) {
    if (llmConfig.provider !== "openrouter") {
        return {};
    }

    const headers = {};

    if (llmConfig.siteUrl) {
        headers["HTTP-Referer"] = llmConfig.siteUrl;
    }

    if (llmConfig.appName) {
        headers["X-Title"] = llmConfig.appName;
    }

    return headers;
}

// ── Gemini Embedding 1 Configuration ──────────────────────
// Model: gemini-embedding-001 (768-dimensional vectors)
// Same API key as the chat model — no extra key needed.
export const EMBEDDING_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model:  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",

    // Task type hints — pass these so the model optimises for your use case:
    //   RETRIEVAL_QUERY      → embedding a user search query
    //   RETRIEVAL_DOCUMENT   → embedding a document / page to index
    //   SEMANTIC_SIMILARITY  → comparing two pieces of text
    //   CLASSIFICATION       → text classification
    //   CLUSTERING           → grouping similar texts
    TASK_TYPES: {
        query:      "RETRIEVAL_QUERY",
        document:   "RETRIEVAL_DOCUMENT",
        similarity: "SEMANTIC_SIMILARITY",
        classify:   "CLASSIFICATION",
        cluster:    "CLUSTERING",
    },

    // Output dimensionality — text-embedding-004 native dim is 768.
    // You can request fewer dimensions (e.g. 256) to save storage.
    outputDimensionality: 768,
};
