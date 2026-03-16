"use client";

import {
    SEARCH_DATE_OPTIONS,
    SEARCH_RESULT_TYPE_OPTIONS,
    SEARCH_SCOPE_OPTIONS,
} from "@/lib/searchFilters";

function FilterChip({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${active
                ? "border-[#ffd08f] bg-[#fff5e8] text-[#9a4d24] shadow-sm"
                : "border-[#f1dfc6] bg-white/90 text-[#7b5b42] hover:border-[#ffcf93] hover:text-[#2d1b12]"
                }`}
        >
            {children}
        </button>
    );
}

export default function SearchFiltersBar({
    resultType,
    siteRestrict,
    dateRestrict,
    activeFilterCount,
    onResultTypeChange,
    onSiteRestrictChange,
    onDateRestrictChange,
    onResetFilters,
}) {
    return (
        <section className="surface-panel rounded-[26px] p-4 sm:p-5">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6a52]">
                            Refine results
                        </p>
                        <p className="mt-1 text-sm text-[#7b5b42]">
                            Filter by file format, source type, or recency.
                        </p>
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="self-start rounded-full border border-[#f1dfc6] bg-white/90 px-4 py-2 text-sm font-medium text-[#7b5b42] transition-all hover:border-[#ffcf93] hover:text-[#2d1b12]"
                        >
                            Clear filters ({activeFilterCount})
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <div className="flex min-w-max gap-2 pb-1">
                        {SEARCH_RESULT_TYPE_OPTIONS.map((option) => (
                            <FilterChip
                                key={option.value}
                                active={resultType === option.value}
                                onClick={() => onResultTypeChange(option.value)}
                            >
                                {option.label}
                            </FilterChip>
                        ))}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.3fr]">
                    <label className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6a52]">
                            Source
                        </span>
                        <select
                            value={siteRestrict}
                            onChange={(event) => onSiteRestrictChange(event.target.value)}
                            className="rounded-2xl border border-[#f1dfc6] bg-white/85 px-3 py-2.5 text-sm text-[#2d1b12] outline-none focus:border-[#ffbe4a]"
                        >
                            {SEARCH_SCOPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6a52]">
                            Time
                        </span>
                        <select
                            value={dateRestrict}
                            onChange={(event) => onDateRestrictChange(event.target.value)}
                            className="rounded-2xl border border-[#f1dfc6] bg-white/85 px-3 py-2.5 text-sm text-[#2d1b12] outline-none focus:border-[#ffbe4a]"
                        >
                            {SEARCH_DATE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="rounded-2xl border border-[#f1dfc6] bg-white/80 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f6a52]">
                            Search flow
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#7b5b42]">
                            AI summary appears first, followed by ranked links from different sources.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
