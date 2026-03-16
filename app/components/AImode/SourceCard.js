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

    const tagColor = isCourt  ? "bg-blue-50   text-blue-700   border-blue-200"
                   : isGov    ? "bg-green-50  text-green-700  border-green-200"
                   : isLegal  ? "bg-purple-50 text-purple-700 border-purple-200"
                   :            "bg-gray-50   text-gray-700   border-gray-200";

    const tagLabel = isCourt ? "Court" : isGov ? "Government" : isLegal ? "Legal DB" : "Source";

    return (
        <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-3 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group"
        >
            {/* Number badge */}
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {index + 1}
            </span>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>
                        {tagLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">{hostname}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium group-hover:text-purple-700 transition-colors leading-snug line-clamp-2">
                    {source.title}
                </p>
            </div>

            {/* External link icon */}
            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}
