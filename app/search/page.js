"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchHeader from "../components/Search/SearchHeader";
import ResultItem from "../components/Search/ResultItem";
import ResultSkeleton from "../components/Search/ResultSkeleton";
import Footer from "../components/Home/Footer";
import axios from "axios";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);
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
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
                setResults(res.data.items || []);
                setMeta(res.data.meta || null);
            } catch (err) {
                setError(err.response?.data?.error || err.message || "Failed to fetch results");
                setMeta(null);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <SearchHeader query={query} />

            <main className="flex-grow w-full px-4 sm:px-6 lg:px-[150px] pt-6 pb-24">
                {/* Stats */}
                {!loading && !error && results.length > 0 && (
                    <div className="text-[#70757a] text-sm mb-6">
                        About {meta?.formattedTotalResults || results.length} results
                        {meta?.searchTime ? ` (${meta.searchTime} seconds)` : ""}
                        {providerLabel ? ` · ${providerLabel}` : ""}
                    </div>
                )}

                {!loading && !error && meta?.isMock && meta?.attemptedProviders?.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Live search is currently unavailable, so AdvocateHub is showing fallback results.
                        {meta.failures?.length ? ` Tried: ${meta.failures.map((failure) => failure.provider).join(", ")}.` : ""}
                    </div>
                )}

                {/* Content */}
                <div className="w-full">
                    {loading ? (
                        <>
                            <ResultSkeleton />
                            <ResultSkeleton />
                            <ResultSkeleton />
                            <ResultSkeleton />
                        </>
                    ) : error ? (
                        <div className="text-red-500">
                            <p>Error: {error}</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((item, index) => (
                            <ResultItem key={index} result={item} />
                        ))
                    ) : query ? (
                        <div className="text-[#202124]">
                            <p className="mt-4">Your search - <strong>{query}</strong> - did not match any documents.</p>
                            <p className="mt-4">Suggestions:</p>
                            <ul className="list-disc ml-8 mt-2 space-y-1">
                                <li>Make sure that all words are spelled correctly.</li>
                                <li>Try different keywords.</li>
                                <li>Try more general keywords.</li>
                            </ul>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
            <SearchResults />
        </Suspense>
    );
}
