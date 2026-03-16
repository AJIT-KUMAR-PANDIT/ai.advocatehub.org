"use client";

export default function SourceCard({ source, index }) {
    let hostname = "";
    try {
        hostname = new URL(source.uri).hostname.replace(/^www\./, "");
    } catch {
        hostname = source.uri;
    }

    // Colour-code by known trusted domain types
    const isGov     = hostname.endsWith(".gov.in") || hostname.endsWith(".nic.in");
    const isCourt   = hostname.includes("court") || hostname.includes("sci.gov");
    const isLegal   = ["indiankanoon.org", "manupatra.com", "scconline.com"].some((d) => hostname.includes(d));

    const tagColor = isCourt  ? "bg-[rgba(255,190,74,0.12)] text-[#ffbe4a] border-[#ffbe4a]/20"
                   : isGov    ? "bg-[rgba(255,110,65,0.12)] text-[#ff9d7a] border-[#ff6e41]/20"
                   : isLegal  ? "bg-[rgba(255,245,228,0.08)] text-[#ffd697] border-white/10"
                   :            "bg-white/6 text-[#ffd697] border-white/10";

    const tagLabel = isCourt ? "Court" : isGov ? "Government" : isLegal ? "Legal DB" : "Source";

    return (
        <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-[24px] border border-[#ffbe4a]/12 bg-[#321710]/72 p-4 shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#ffbe4a]/30 hover:shadow-md"
        >
            {/* Number badge */}
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,190,74,0.14)] text-[10px] font-bold text-[#ffbe4a]">
                {index + 1}
            </span>

            <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {tagLabel}
                    </span>
                    <span className="truncate text-[10px] text-[#d6a88a]">{hostname}</span>
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-snug text-[#fff4de] transition-colors group-hover:text-[#ffbe4a]">
                    {source.title}
                </p>
            </div>

            {/* External link icon */}
            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#d6a88a] transition-colors group-hover:text-[#ffbe4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}
