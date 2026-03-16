"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ defaultValue = "", variant = "hero", additionalParams = {} }) {
    const [query, setQuery] = useState(defaultValue);
    const router = useRouter();
    const isCompact = variant === "compact";

    useEffect(() => {
        setQuery(defaultValue);
    }, [defaultValue]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const params = new URLSearchParams();
            params.set("q", query.trim());

            for (const [key, value] of Object.entries(additionalParams)) {
                if (typeof value === "string" && value.trim()) {
                    params.set(key, value.trim());
                }
            }

            router.push(`/search?${params.toString()}`);
        }
    };

    if (isCompact) {
        return (
            <form
                onSubmit={handleSearch}
                className="group flex w-full items-center gap-3 rounded-[24px] border border-[rgba(118,70,32,0.1)] bg-white/90 px-4 py-3 shadow-[0_10px_28px_rgba(77,45,20,0.05)] transition-all duration-200 hover:border-[rgba(255,110,65,0.18)] focus-within:border-[rgba(255,110,65,0.22)] focus-within:shadow-[0_18px_42px_rgba(77,45,20,0.08)]"
            >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,190,74,0.12)] text-[#d75127]">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#2d1b12] outline-none placeholder:text-[#b18868] sm:text-base"
                    placeholder="Search the web, docs, PDFs, images, videos, and more"
                />

                <button
                    type="submit"
                    className="action-primary flex-shrink-0 px-4 py-2 text-sm font-semibold"
                >
                    Search
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </form>
        );
    }

    return (
        <form
            onSubmit={handleSearch}
            className="group w-full rounded-[30px] border border-[rgba(118,70,32,0.1)] bg-white/90 px-5 py-4 shadow-[0_14px_34px_rgba(77,45,20,0.06)] transition-all duration-200 hover:border-[rgba(255,110,65,0.18)] focus-within:border-[rgba(255,110,65,0.22)] focus-within:shadow-[0_18px_42px_rgba(77,45,20,0.08)] sm:px-6 sm:py-5"
        >
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,190,74,0.12)] text-[#d75127]">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a52]">
                        Search webpages, PDFs, DOCX, images, videos, audio, slides, and more
                    </p>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-base text-[#2d1b12] outline-none placeholder:text-[#b18868] sm:text-lg"
                        placeholder="Search the web, docs, PDFs, images, videos, and more"
                        autoFocus
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 sm:mt-4">
                <p className="hidden text-xs text-[#8f6a52] md:block">
                    AI summary appears above the ranked links after every search.
                </p>

                <button
                    type="submit"
                    className="action-primary ml-auto px-5 py-3 text-sm font-semibold"
                >
                    Search
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </form>
    );
}
