import Link from "next/link";

export default function ResultItem({ result }) {
    if (!result) return null;

    let resolvedHostname = "";
    try {
        resolvedHostname = new URL(result.link, "https://advocatehub.org").hostname.replace(/^www\./, "");
    } catch {
        resolvedHostname = result.displayLink || result.formattedUrl || "advocatehub.org";
    }

    const displayUrl = result.formattedUrl || result.displayLink || resolvedHostname;
    const badgeText = resolvedHostname.slice(0, 2).toUpperCase() || "AH";

    return (
        <article className="surface-panel-strong group rounded-[28px] p-5 sm:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,190,74,0.16)] text-sm font-bold text-[#d75127]">
                            {badgeText}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#2d1b12]">
                                {displayUrl}
                            </p>
                            <p className="truncate text-xs uppercase tracking-[0.2em] text-[#8f6a52]">
                                {resolvedHostname}
                            </p>
                        </div>
                    </div>
                    <span className="hidden rounded-full border border-[#f4ddbf] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6a52] sm:inline-flex">
                        Open result
                    </span>
                </div>

                <Link href={result.link} className="block">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-[#2d1b12] group-hover:text-[#d75127] sm:text-[1.9rem]">
                        {result.title}
                    </h3>
                </Link>

                <p className="text-sm leading-7 text-[#7b5b42] sm:text-[15px]">
                    {result.snippet}
                </p>
            </div>
        </article>
    );
}
