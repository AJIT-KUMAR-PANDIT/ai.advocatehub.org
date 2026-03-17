import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto px-4 pb-6 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-[32px] px-7 py-7 sm:px-9 sm:py-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-display text-2xl font-semibold text-[#2d1b12]">AdvocateHub</p>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b5b42]">
                            Minimal search, grounded AI summaries, and a separate workspace for deeper legal analysis.
                        </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#8f6a52]">
                        Search across web, docs, media, and more
                    </p>
                </div>

                <div className="brand-rule w-full" />

                <div className="flex flex-col gap-5 text-sm text-[#7b5b42] md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-5">
                        <Link href="/" className="transition-colors hover:text-[#2d1b12]">Search</Link>
                        <Link href="/AImode" className="transition-colors hover:text-[#2d1b12]">AI Workspace</Link>
                        <Link href="/search?q=Supreme+Court+India&type=pdf" className="transition-colors hover:text-[#2d1b12]">PDF search</Link>
                        <Link href="/search?q=constitutional+law&type=images" className="transition-colors hover:text-[#2d1b12]">Image search</Link>
                    </div>
                    <div className="flex flex-wrap gap-5 md:justify-end">
                        <span className="text-[#a08060]">Custom search providers</span>
                        <span className="text-[#a08060]">Bring your own LLM</span>
                        <span className="text-[#a08060]">PDF, DOCX, video, image, and audio filters</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
