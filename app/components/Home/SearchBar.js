"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ defaultValue = "", variant = "hero" }) {
    const [query, setQuery] = useState(defaultValue);
    const router = useRouter();
    const isCompact = variant === "compact";

    useEffect(() => {
        setQuery(defaultValue);
    }, [defaultValue]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className={`group flex w-full items-center gap-3 border border-[rgba(118,70,32,0.12)] bg-[rgba(255,252,247,0.92)] shadow-[0_16px_38px_rgba(77,45,20,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(77,45,20,0.12)] focus-within:-translate-y-0.5 focus-within:border-[rgba(255,110,65,0.22)] focus-within:shadow-[0_24px_48px_rgba(77,45,20,0.12)] ${isCompact ? "rounded-[24px] px-4 py-3" : "rounded-[32px] px-5 py-4 sm:px-6 sm:py-5"}`}
        >
            <div className={`flex flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,190,74,0.16)] text-[#d75127] ${isCompact ? "h-11 w-11" : "h-12 w-12"}`}>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
            </div>

            <div className="min-w-0 flex-1">
                {!isCompact && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a52]">
                        Search cases, statutes, notices, and legal questions
                    </p>
                )}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`w-full bg-transparent outline-none text-[#2d1b12] placeholder:text-[#b18868] ${isCompact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}
                    placeholder="Try: Supreme Court bail jurisprudence"
                    autoFocus
                />
            </div>

            {!isCompact && (
                <span className="hidden rounded-full border border-[#f4ddbf] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8f6a52] lg:inline-flex">
                    Press Enter
                </span>
            )}

            <div className="flex flex-shrink-0 items-center gap-2">
                <button
                    type="submit"
                    className={`action-primary font-semibold ${isCompact ? "px-4 py-2 text-sm" : "px-5 py-3 text-sm"}`}
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
