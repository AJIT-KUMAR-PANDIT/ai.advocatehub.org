import Image from "next/image";
import Link from "next/link";
import SearchBar from "../Home/SearchBar";

export default function SearchHeader({ query, providerLabel, isMock }) {
    return (
        <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[30px] px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center justify-between gap-4 lg:min-w-[240px]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="surface-card rounded-2xl px-4 py-3">
                                <Image
                                    src="/advocatehub.webp"
                                    alt="AdvocateHub Search Logo"
                                    width={132}
                                    height={42}
                                    className="object-contain"
                                />
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 lg:hidden">
                            {providerLabel && (
                                <span className="rounded-full border border-[#ffd8b3] bg-[#fff2de] px-3 py-1 text-xs font-semibold text-[#a3471d]">
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
                        <SearchBar defaultValue={query} variant="compact" />
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        {providerLabel && (
                            <span className="rounded-full border border-[#ffd8b3] bg-[#fff2de] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3471d]">
                                {providerLabel}
                            </span>
                        )}
                        {isMock && (
                            <span className="rounded-full border border-[#ffd49a] bg-[#fff1d5] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4c26]">
                                Fallback
                            </span>
                        )}
                        <Link href="/AImode" className="action-secondary px-4 py-2 text-sm font-semibold">
                            AI workspace
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
