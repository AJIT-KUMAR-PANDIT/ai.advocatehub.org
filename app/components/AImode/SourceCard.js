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

    const tagColor = isCourt  ? "bg-[rgba(255,190,74,0.14)] text-[#a3471d] border-[#ffbe4a]/24"
                   : isGov    ? "bg-[rgba(255,110,65,0.12)] text-[#b05328] border-[#ff6e41]/20"
                   : isLegal  ? "bg-[#fff4e2] text-[#8f6a52] border-[#f1dfc6]"
                   :            "bg-white/80 text-[#8f6a52] border-[#f1dfc6]";

    const tagLabel = isCourt ? "Court" : isGov ? "Government" : isLegal ? "Legal DB" : "Source";

    return (
        <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-[22px] border border-[#f1dfc6] bg-white/88 p-4 shadow-[0_12px_22px_rgba(77,45,20,0.05)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#ffbe4a]/28"
        >
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,190,74,0.14)] text-[10px] font-bold text-[#d75127]">
                {index + 1}
            </span>

            <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {tagLabel}
                    </span>
                    <span className="truncate text-[10px] text-[#8f6a52]">{hostname}</span>
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-snug text-[#2d1b12] transition-colors group-hover:text-[#d75127]">
                    {source.title}
                </p>
            </div>

            <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#8f6a52] transition-colors group-hover:text-[#d75127]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}
