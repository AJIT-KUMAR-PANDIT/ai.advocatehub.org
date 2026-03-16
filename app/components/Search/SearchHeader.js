import Image from "next/image";
import Link from "next/link";
import SearchBar from "../Home/SearchBar";

export default function SearchHeader({ query, providerLabel, isMock, searchParams }) {
    return (
        <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[28px] px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center justify-between gap-4 lg:min-w-[220px]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="surface-card rounded-full px-4 py-2.5">
                                <Image
                                    src="/advocatehub.webp"
                                    alt="AdvocateHub Search Logo"
                                    width={126}
                                    height={34}
                                    className="object-contain"
                                />
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 lg:hidden">
                            {providerLabel && (
                                <span className="rounded-full border border-[#f1dfc6] bg-white/80 px-3 py-1 text-xs font-semibold text-[#8f6a52]">
                                    {providerLabel}
                                </span>
                            )}
                            {isMock && (
                                <span className="rounded-full border border-[#ffd49a] bg-[#fff1d5] px-3 py-1 text-xs font-semibold text-[#8f4c26]">
                                    Fallback
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <SearchBar defaultValue={query} variant="compact" additionalParams={searchParams} />
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        {providerLabel && (
                            <span className="rounded-full border border-[#f1dfc6] bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6a52]">
                                {providerLabel}
                            </span>
                        )}
                        {isMock && (
                            <span className="rounded-full border border-[#ffd49a] bg-[#fff1d5] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4c26]">
                                Fallback
                            </span>
                        )}
                        <Link href="/AImode" className="action-secondary px-4 py-2 text-sm font-semibold">
                            AI mode
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
