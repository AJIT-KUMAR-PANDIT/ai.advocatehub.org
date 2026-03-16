"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import SearchHeader from "./SearchHeader";
import ResultItem from "./ResultItem";
import ResultSkeleton from "./ResultSkeleton";
import SearchSummaryCard from "./SearchSummaryCard";
import SearchSystemDashboard from "../Shared/SearchSystemDashboard";
import Footer from "../Home/Footer";

export default function SearchResultsClient({ dashboardSnapshot }) {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

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
            setSummary(null);
            setSummaryLoading(false);
            setSummaryError(null);

            try {
                const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                const items = res.data.items || [];

                setResults(items);
                setMeta(res.data.meta || null);
                setLoading(false);

                if (items.length > 0) {
                    setSummaryLoading(true);

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
                    } finally {
                        setSummaryLoading(false);
                    }
                }
            } catch (err) {
                if (!axios.isCancel(err)) {
                    setError(err.response?.data?.error || err.message || "Failed to fetch results");
                    setMeta(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResults();

        return () => controller.abort();
    }, [query]);

    return (
        <div className="app-shell flex min-h-screen flex-col">
            <SearchHeader query={query} providerLabel={providerLabel} isMock={meta?.isMock} />

            <main className="flex-grow px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        <div className="surface-panel-strong rounded-[30px] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                                Search briefing
                            </p>
                            <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-[#2d1b12]">
                                {query || "Start a search"}
                            </h1>
                            <div className="mt-5 space-y-3 text-sm text-[#7b5b42]">
                                <p>
                                    Results:
                                    {" "}
                                    <span className="font-semibold text-[#2d1b12]">
                                        {loading ? "Loading..." : (meta?.formattedTotalResults || results.length || "0")}
                                    </span>
                                </p>
                                <p>
                                    Provider:
                                    {" "}
                                    <span className="font-semibold text-[#2d1b12]">
                                        {providerLabel || "Waiting for query"}
                                    </span>
                                </p>
                                <p>
                                    Search time:
                                    {" "}
                                    <span className="font-semibold text-[#2d1b12]">
                                        {loading ? "--" : (meta?.searchTime ? `${meta.searchTime} sec` : "N/A")}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="surface-panel rounded-[30px] p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                                Research tip
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#7b5b42]">
                                Start broad in search mode, then move the best sources or filings into AI mode when you need synthesis, drafting, or attachment-aware answers.
                            </p>
                        </div>
                    </aside>

                    <section className="min-w-0">
                        {!loading && !error && meta?.isMock && meta?.attemptedProviders?.length > 0 && (
                            <div className="mb-4 rounded-[24px] border border-[#ffd49a] bg-[#fff1d5]/90 px-5 py-4 text-sm text-[#8f4c26] shadow-sm">
                                Live search is currently unavailable, so AdvocateHub is showing fallback results.
                                {meta.failures?.length ? ` Tried: ${meta.failures.map((failure) => failure.provider).join(", ")}.` : ""}
                            </div>
                        )}

                        <div className="space-y-4">
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
                                <>
                                    <ResultSkeleton />
                                    <ResultSkeleton />
                                    <ResultSkeleton />
                                    <ResultSkeleton />
                                </>
                            ) : error ? (
                                <div className="surface-panel-strong rounded-[28px] p-6 text-[#c74724]">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Search error</p>
                                    <p className="mt-3 text-base leading-7">{error}</p>
                                </div>
                            ) : results.length > 0 ? (
                                results.map((item, index) => (
                                    <ResultItem key={index} result={item} />
                                ))
                            ) : query ? (
                                <div className="surface-panel-strong rounded-[28px] p-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                                        No matches found
                                    </p>
                                    <h2 className="font-display mt-4 text-3xl font-semibold text-[#2d1b12]">
                                        No results for “{query}”
                                    </h2>
                                    <ul className="mt-4 space-y-2 text-sm leading-7 text-[#7b5b42]">
                                        <li>Check the spelling of party names, statutes, or citation numbers.</li>
                                        <li>Try a broader issue phrase instead of a full sentence.</li>
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
                    </section>
                </div>

                <SearchSystemDashboard snapshot={dashboardSnapshot} title="Search Intelligence Graphs" />
            </main>

            <Footer />
        </div>
    );
}
