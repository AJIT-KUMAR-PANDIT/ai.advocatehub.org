"use client";

import Link from "next/link";

function renderSummaryMarkdown(text) {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith("## ")) {
            elements.push(
                <h2 key={i} className="font-display mt-4 text-2xl font-semibold text-[#2d1b12]">
                    {line.slice(3)}
                </h2>
            );
        } else if (line.startsWith("# ")) {
            elements.push(
                <h1 key={i} className="font-display mt-4 text-3xl font-semibold text-[#2d1b12]">
                    {line.slice(2)}
                </h1>
            );
        } else if (line.startsWith("- ")) {
            elements.push(
                <li key={i} className="ml-4 list-disc text-sm leading-7 text-[#7b5b42]">
                    {inlineFormat(line.slice(2))}
                </li>
            );
        } else if (line.trim() === "") {
            elements.push(<div key={i} className="h-2" />);
        } else {
            elements.push(
                <p key={i} className="text-sm leading-7 text-[#7b5b42]">
                    {inlineFormat(line)}
                </p>
            );
        }

        i++;
    }

    return elements;
}

function inlineFormat(text) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-semibold text-[#2d1b12]">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={index} className="rounded bg-[#fff1dd] px-1.5 py-0.5 text-xs font-mono text-[#a3471d]">
                    {part.slice(1, -1)}
                </code>
            );
        }

        return part;
    });
}

function SummarySkeleton() {
    return (
        <div className="surface-panel-strong rounded-[30px] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#f7debc] animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-36 rounded-full bg-[#f7debc] animate-pulse" />
                        <div className="h-3 w-48 rounded-full bg-[#f7debc] animate-pulse" />
                    </div>
                </div>
                <div className="h-8 w-24 rounded-full bg-[#f7debc] animate-pulse" />
            </div>

            <div className="space-y-3">
                <div className="h-8 w-48 rounded-full bg-[#f7debc] animate-pulse" />
                <div className="h-4 w-full rounded-full bg-[#f7debc] animate-pulse" />
                <div className="h-4 w-11/12 rounded-full bg-[#f7debc] animate-pulse" />
                <div className="h-4 w-10/12 rounded-full bg-[#f7debc] animate-pulse" />
            </div>
        </div>
    );
}

export default function SearchSummaryCard({ query, summary, loading, error, providerLabel }) {
    if (!query) {
        return null;
    }

    if (loading) {
        return <SummarySkeleton />;
    }

    if (error) {
        return (
            <div className="surface-panel-strong rounded-[30px] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c74724]">
                    AI Summary Unavailable
                </p>
                <p className="mt-3 text-sm leading-7 text-[#7b5b42]">
                    Search results still loaded, but the AI summary could not be generated right now.
                </p>
            </div>
        );
    }

    if (!summary?.summary) {
        return null;
    }

    return (
        <article className="surface-panel-strong rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] text-white shadow-sm">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                            AI Summary
                        </p>
                        <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-[#2d1b12]">
                            A quick answer before the link list.
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#7b5b42]">
                            Synthesized from {summary.sourceCount} search results across different sources
                            {providerLabel ? ` using ${providerLabel}` : ""}.
                        </p>
                    </div>
                </div>

                <span className="rounded-full border border-[#ffd8b3] bg-[#fff2de] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3471d]">
                    {summary.mode === "heuristic" ? "Snippet synthesis" : "Grounded answer"}
                </span>
            </div>

            <div className="mt-6 space-y-2">
                {renderSummaryMarkdown(summary.summary)}
            </div>

            <div className="brand-rule mt-6 w-full" />

            <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                    Sources Used
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {summary.sources.map((source) => (
                        <Link
                            key={`${source.index}-${source.link}`}
                            href={source.link}
                            className="rounded-[24px] border border-[#f4ddbf] bg-white/75 p-4 transition-all hover:-translate-y-0.5 hover:border-[#ffbe4a] hover:shadow-md"
                        >
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] text-[10px] font-bold text-white">
                                    {source.index}
                                </span>
                                <span className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a52]">
                                    {source.displayHost}
                                </span>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#2d1b12]">
                                {source.title}
                            </p>
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#7b5b42]">
                                {source.snippet}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
}
