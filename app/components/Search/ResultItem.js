import Link from "next/link";

function inferResultType(result) {
    const haystack = `${result?.targetUrl || ""} ${result?.link || ""} ${result?.title || ""} ${result?.snippet || ""}`.toLowerCase();

    if (haystack.includes(".pdf")) return "PDF";
    if (haystack.includes(".docx")) return "DOCX";
    if (haystack.includes(".doc")) return "DOC";
    if (haystack.includes("youtube.com") || haystack.includes("vimeo.com") || haystack.includes(".mp4")) return "Video";
    if (haystack.includes(".jpg") || haystack.includes(".jpeg") || haystack.includes(".png") || haystack.includes(".webp")) return "Image";
    if (haystack.includes(".mp3") || haystack.includes(".wav") || haystack.includes("soundcloud")) return "Audio";
    if (haystack.includes(".ppt") || haystack.includes(".pptx")) return "Slides";
    if (haystack.includes(".xls") || haystack.includes(".xlsx") || haystack.includes(".csv")) return "Sheets";
    if (haystack.includes(".txt") || haystack.includes(".rtf")) return "Text";
    return "Web";
}

export default function ResultItem({ result }) {
    if (!result) return null;

    let resolvedHostname = "";
    try {
        resolvedHostname = new URL(result.link, "https://advocatehub.org").hostname.replace(/^www\./, "");
    } catch {
        resolvedHostname = result.displayLink || result.formattedUrl || "advocatehub.org";
    }

    const displayUrl = result.formattedUrl || result.displayLink || resolvedHostname;
    const badgeText = inferResultType(result);

    return (
        <article className="surface-panel group rounded-[24px] px-5 py-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 min-w-[56px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,190,74,0.12)] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d75127]">
                            {badgeText}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#2d1b12]">
                                {displayUrl}
                            </p>
                            <p className="truncate text-xs uppercase tracking-[0.2em] text-[#8f6a52]">
                                {resolvedHostname}
                            </p>
                        </div>
                    </div>
                    <span className="hidden rounded-full border border-[#f4ddbf] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6a52] sm:inline-flex">
                        Open source
                    </span>
                </div>

                <Link href={result.link} className="block">
                    <h3 className="font-display text-[1.55rem] font-semibold leading-tight text-[#2d1b12] group-hover:text-[#d75127]">
                        {result.title}
                    </h3>
                </Link>

                <p className="text-sm leading-7 text-[#7b5b42]">
                    {result.snippet}
                </p>
            </div>
        </article>
    );
}
