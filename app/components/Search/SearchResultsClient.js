"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import SearchHeader from "./SearchHeader";
import ResultItem from "./ResultItem";
import ResultSkeleton from "./ResultSkeleton";
import SearchSummaryCard from "./SearchSummaryCard";
import SearchFiltersBar from "./SearchFiltersBar";
import Footer from "../Home/Footer";
import {
    normalizeSearchDate,
    normalizeSearchResultType,
    normalizeSearchScope,
    SEARCH_RESULT_TYPE_OPTIONS,
} from "@/lib/searchFilters";

function getResultTypeLabel(value) {
    return SEARCH_RESULT_TYPE_OPTIONS.find((option) => option.value === value)?.label || "All";
}

export default function SearchResultsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const query = searchParams.get("q") || "";
    const resultType = normalizeSearchResultType(searchParams.get("type") || "all");
    const siteRestrict = normalizeSearchScope(searchParams.get("siteRestrict") || "");
    const dateRestrict = normalizeSearchDate(searchParams.get("dateRestrict") || "");

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(null);

    const providerLabel = meta?.provider === "bing"
        ? "Bing Custom Search"
        : meta?.provider === "google"
            ? "Google Custom Search"
            : meta?.provider === "duckduckgo"
                ? "DuckDuckGo Search"
                : meta?.provider === "mock"
                    ? "Mock results"
                    : "";
    const activeFilterCount = [resultType !== "all", Boolean(siteRestrict), Boolean(dateRestrict)]
        .filter(Boolean)
        .length;

    function updateUrlParam(key, value) {
        const params = new URLSearchParams(searchParams.toString());

        if (!value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        router.replace(`${pathname}?${params.toString()}`);
    }

    function resetFilters() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        params.delete("siteRestrict");
        params.delete("dateRestrict");
        router.replace(`${pathname}?${params.toString()}`);
    }

    useEffect(() => {
        if (!query) {
            setLoading(false);
            setError(null);
            setMeta(null);
            setResults([]);
            setSummary(null);
            setSummaryLoading(false);
            setSummaryError(null);
            return;
        }

        const controller = new AbortController();

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            setMeta(null);
            setResults([]);
            setSummary(null);
            setSummaryLoading(true);
            setSummaryError(null);

            try {
                const res = await axios.get("/api/search", {
                    params: {
                        q: query,
                        type: resultType,
                        siteRestrict: siteRestrict || undefined,
                        dateRestrict: dateRestrict || undefined,
                    },
                    signal: controller.signal,
                });

                const items = res.data.items || [];
                setResults(items);
                setMeta(res.data.meta || null);

                if (items.length > 0) {
                    try {
                        const summaryRes = await axios.post(
                            "/api/search/summary",
                            {
                                query,
                                results: items,
                            },
                            { signal: controller.signal }
                        );

                        setSummary(summaryRes.data);
                    } catch (summaryErr) {
                        if (!axios.isCancel(summaryErr)) {
                            setSummaryError(
                                summaryErr.response?.data?.error || summaryErr.message || "Failed to generate AI summary"
                            );
                        }
                    }
                }
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setError(err.response?.data?.error || err.message || "Failed to fetch results");
                    setMeta(null);
                    setResults([]);
                }
            } finally {
                setLoading(false);
                setSummaryLoading(false);
            }
        };

        fetchResults();

        return () => controller.abort();
    }, [query, resultType, siteRestrict, dateRestrict]);

    return (
        <div className="app-shell flex min-h-screen flex-col">
            <SearchHeader
                query={query}
                providerLabel={providerLabel}
                isMock={meta?.isMock}
                searchParams={{
                    type: resultType !== "all" ? resultType : "",
                    siteRestrict,
                    dateRestrict,
                }}
            />

            <main className="flex-grow px-4 pb-12 pt-5 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="space-y-4">
                        {query && (
                            <section className="surface-panel-strong rounded-[30px] px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                                            Search
                                        </p>
                                        <h1 className="font-display mt-2 text-3xl font-semibold leading-tight text-[#2d1b12] sm:text-[2.6rem]">
                                            {query}
                                        </h1>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b5b42]">
                                            Minimal search results with an AI overview first, then ranked sources you can open and verify.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-[#f1dfc6] bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a52]">
                                            {getResultTypeLabel(resultType)}
                                        </span>
                                        {siteRestrict && (
                                            <span className="rounded-full border border-[#f1dfc6] bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a52]">
                                                {siteRestrict}
                                            </span>
                                        )}
                                        {dateRestrict && (
                                            <span className="rounded-full border border-[#f1dfc6] bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a52]">
                                                {dateRestrict}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        <SearchFiltersBar
                            resultType={resultType}
                            siteRestrict={siteRestrict}
                            dateRestrict={dateRestrict}
                            activeFilterCount={activeFilterCount}
                            onResultTypeChange={(value) => updateUrlParam("type", value === "all" ? "" : value)}
                            onSiteRestrictChange={(value) => updateUrlParam("siteRestrict", value)}
                            onDateRestrictChange={(value) => updateUrlParam("dateRestrict", value)}
                            onResetFilters={resetFilters}
                        />

                        {(query || meta) && (
                            <div className="flex flex-col gap-3 rounded-[24px] border border-[#f1dfc6] bg-white/80 px-4 py-3 text-sm text-[#7b5b42] sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-medium text-[#2d1b12]">
                                        {loading ? "Searching..." : `${meta?.formattedTotalResults || results.length || 0} results`}
                                    </span>
                                    <span className="hidden h-1 w-1 rounded-full bg-[#d4b08a] sm:inline-block" />
                                    <span>{getResultTypeLabel(resultType)}</span>
                                    {providerLabel && (
                                        <>
                                            <span className="hidden h-1 w-1 rounded-full bg-[#d4b08a] sm:inline-block" />
                                            <span>{providerLabel}</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#8f6a52]">
                                    AI summary above, source list below
                                </p>
                            </div>
                        )}

                        {!loading && !error && meta?.isMock && meta?.attemptedProviders?.length > 0 && (
                            <div className="rounded-[24px] border border-[#ffd49a] bg-[#fff1d5]/90 px-5 py-4 text-sm text-[#8f4c26] shadow-sm">
                                Live search is currently unavailable, so AdvocateHub is showing fallback results.
                                {meta.failures?.length ? ` Tried: ${meta.failures.map((failure) => failure.provider).join(", ")}.` : ""}
                            </div>
                        )}

                        {!error && (
                            <SearchSummaryCard
                                query={query}
                                summary={summary}
                                loading={summaryLoading}
                                error={summaryError}
                                providerLabel={providerLabel}
                            />
                        )}

                        {loading ? (
                            <div className="space-y-4">
                                <ResultSkeleton />
                                <ResultSkeleton />
                                <ResultSkeleton />
                                <ResultSkeleton />
                            </div>
                        ) : error ? (
                            <div className="surface-panel-strong rounded-[28px] p-6 text-[#c74724]">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Search error</p>
                                <p className="mt-3 text-base leading-7">{error}</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map((item, index) => (
                                    <ResultItem key={index} result={item} />
                                ))}
                            </div>
                        ) : query ? (
                            <div className="surface-panel-strong rounded-[28px] p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                                    No matches found
                                </p>
                                <h2 className="font-display mt-4 text-3xl font-semibold text-[#2d1b12]">
                                    No results for “{query}”
                                </h2>
                                <ul className="mt-4 space-y-2 text-sm leading-7 text-[#7b5b42]">
                                    <li>Try another result type like PDF, DOCX, Images, Videos, or Audio.</li>
                                    <li>Broaden the wording if your current filter is too narrow.</li>
                                    <li>Switch to AI mode if you want help reformulating the query.</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="surface-panel-strong rounded-[28px] p-6">
                                <p className="font-display text-2xl font-semibold text-[#2d1b12]">
                                    Enter a query to begin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
