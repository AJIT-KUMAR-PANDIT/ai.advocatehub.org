import "server-only";

import {
    CUSTOM_SEARCH_PRIORITY,
    DATE_RESTRICT_OPTIONS,
    EMBEDDING_CONFIG,
    FILE_TYPE_FILTERS,
    getSearchProviderOrder,
    PRIORITY_SITES,
    SITE_RESTRICT_MODES,
} from "@/lib/searchConfig";

function getSiteCategory(site) {
    if (site.label.includes("Court") || site.label.includes("Supreme")) {
        return "Courts";
    }

    if (site.domain.endsWith(".gov.in") || site.domain.endsWith(".nic.in")) {
        return "Government";
    }

    if (site.domain.includes("advocatehub")) {
        return "AdvocateHub";
    }

    return "Legal DB";
}

export function getSearchSystemSnapshot() {
    const providerOrder = getSearchProviderOrder();
    const filterCounts = {
        fileTypes: Object.keys(FILE_TYPE_FILTERS).length,
        siteScopes: Object.keys(SITE_RESTRICT_MODES).length,
        dateWindows: Object.keys(DATE_RESTRICT_OPTIONS).length,
    };

    const categoryMap = new Map();

    for (const site of PRIORITY_SITES) {
        const category = getSiteCategory(site);
        const current = categoryMap.get(category) || { count: 0, totalWeight: 0 };

        categoryMap.set(category, {
            count: current.count + 1,
            totalWeight: current.totalWeight + site.weight,
        });
    }

    const tierDistribution = Array.from(categoryMap.entries()).map(([label, value], index) => ({
        label,
        count: value.count,
        score: Math.round(value.totalWeight / value.count),
        accent: [
            "from-[#ffbe4a] to-[#ff8a36]",
            "from-[#ff8a36] to-[#ff6e41]",
            "from-[#ffcd79] to-[#ff9357]",
            "from-[#ffd79a] to-[#ff7346]",
        ][index] || "from-[#ffbe4a] to-[#ff6e41]",
    }));

    const topPrioritySites = [...PRIORITY_SITES]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6)
        .map((site) => ({
            domain: site.domain,
            label: site.label,
            weight: site.weight,
        }));

    const appearanceGraph = [
        {
            label: "Brand shell",
            value: 96,
            description: "Logo-led search chrome and stronger search presence.",
        },
        {
            label: "AI handoff",
            value: 92,
            description: "Classic search routes directly into AI workflow.",
        },
        {
            label: "Provider trust",
            value: providerOrder.includes("mock") ? 58 : 86,
            description: `Priority order: ${providerOrder.join(" -> ")}`,
        },
        {
            label: "Filter reach",
            value: Math.min(98, 58 + filterCounts.fileTypes + filterCounts.siteScopes + filterCounts.dateWindows),
            description: `${filterCounts.fileTypes} file types, ${filterCounts.siteScopes} scopes, ${filterCounts.dateWindows} date windows.`,
        },
        {
            label: "RAG readiness",
            value: EMBEDDING_CONFIG.apiKey ? 91 : 66,
            description: `${EMBEDDING_CONFIG.model} embeddings plus uploaded-document grounding.`,
        },
    ];

    const rankingStages = [
        {
            label: "Provider retrieval",
            emphasis: providerOrder.length === 1 ? 72 : 88,
            detail: `Search order resolves from CUSTOM_SEARCH_PRIORITY: ${CUSTOM_SEARCH_PRIORITY}.`,
        },
        {
            label: "Priority-site boost",
            emphasis: 100,
            detail: `${PRIORITY_SITES.length} trusted domains are weighted before final ordering.`,
        },
        {
            label: "Query filters",
            emphasis: 84,
            detail: `${filterCounts.fileTypes} file-type filters, ${filterCounts.siteScopes} site scopes, and ${filterCounts.dateWindows} recency windows.`,
        },
        {
            label: "Grounded RAG",
            emphasis: 92,
            detail: "Web results, uploaded files, and embeddings are available to ground answers.",
        },
        {
            label: "Answer shaping",
            emphasis: 80,
            detail: "Responses are formatted with source visibility and custom-LLM fallback support.",
        },
    ];

    const ragFlow = [
        {
            step: "1",
            label: "Search query",
            note: "Capture user question, statute, issue, or citation.",
        },
        {
            step: "2",
            label: "Provider fetch",
            note: providerOrder.join(" -> "),
        },
        {
            step: "3",
            label: "Priority rerank",
            note: "Courts, government portals, and trusted legal DBs rise first.",
        },
        {
            step: "4",
            label: "Grounded context",
            note: "Search snippets, uploads, and embeddings enrich the answer.",
        },
        {
            step: "5",
            label: "AI response",
            note: "Gemini or your own OpenAI-compatible endpoint produces the final draft.",
        },
    ];

    return {
        providerPriority: CUSTOM_SEARCH_PRIORITY,
        providerOrder,
        prioritySiteCount: PRIORITY_SITES.length,
        appearanceGraph,
        rankingStages,
        ragFlow,
        filterCounts,
        embedding: {
            model: EMBEDDING_CONFIG.model,
            dimensions: EMBEDDING_CONFIG.outputDimensionality,
            enabled: Boolean(EMBEDDING_CONFIG.apiKey),
        },
        tierDistribution,
        topPrioritySites,
    };
}
