/**
 * searchConfig.js
 * ============================================================
 * AdvocateHub AI — Central Search & AI Configuration
 *
 * This file is SERVER-SIDE ONLY. Never import in client components.
 * All tunable values are read from .env.local where possible.
 * ============================================================
 */

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

// Site restrict modes
export const SITE_RESTRICT_MODES = {
    // Only official priority domains
    official: PRIORITY_SITES.slice(0, 15).map((s) => "site:" + s.domain).join(" OR "),
    // Only Indian government (.gov.in, .nic.in)
    govonly:  "site:.gov.in OR site:.nic.in",
    // Only courts
    courts:   "site:sci.gov.in OR site:.highcourt.nic.in OR site:.highcourt.gov.in",
};

// ── Google Custom Search API Defaults ──────────────────────
export const SEARCH_CONFIG = {
    apiKey:          process.env.GOOGLE_API_KEY,
    cx:              process.env.GOOGLE_SEARCH_CX,
    countryRestrict: process.env.SEARCH_COUNTRY_RESTRICT || "countryIN",
    hl:              process.env.SEARCH_HL              || "en",
    safe:            process.env.SEARCH_SAFE            || "off",
    num:             parseInt(process.env.SEARCH_NUM    || "10", 10),
    baseUrl:         "https://www.googleapis.com/customsearch/v1",
};

// Builds the Google CSE request URL with all active filters
export function buildSearchUrl({ query, fileType, siteRestrict, dateRestrict, num } = {}) {
    const { apiKey, cx, countryRestrict, hl, safe, baseUrl, num: defaultNum } = SEARCH_CONFIG;
    const url = new URL(baseUrl);

    // Build augmented query
    let q = query.trim();

    if (fileType && FILE_TYPE_FILTERS[fileType]) {
        q += " " + FILE_TYPE_FILTERS[fileType];
    }

    if (siteRestrict && SITE_RESTRICT_MODES[siteRestrict]) {
        q += " " + SITE_RESTRICT_MODES[siteRestrict];
    }

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

    return url.toString();
}

// ── Gemini AI Configuration ────────────────────────────────
export const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model:  process.env.GEMINI_MODEL || "gemini-2.0-flash",

    // System instruction: sets the AI's persona and legal expertise context
    systemInstruction: `You are AdvocateHub AI, an expert Indian legal assistant.
You are powered by Google Gemini and grounded with real-time Google Search results.
Specialise in: Indian laws, IPC, CrPC, CPC, Constitution, High Court & Supreme Court judgments, property law, family law, corporate law, consumer rights, and legal procedures.
Always cite your sources. Format responses clearly using markdown with headings, bullet points, and numbered lists where appropriate.
When referencing legal sections or acts, be precise and cite the full name (e.g., "Section 302 of the Indian Penal Code, 1860").
Respond in a professional yet accessible tone. If a question is outside Indian law, still answer helpfully while noting any jurisdictional limits.`,

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

// ── Gemini Embedding 1 Configuration ──────────────────────
// Model: text-embedding-004 (768-dimensional vectors)
// Same API key as the chat model — no extra key needed.
export const EMBEDDING_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model:  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",

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

