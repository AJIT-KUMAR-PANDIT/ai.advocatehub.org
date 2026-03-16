import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto px-4 pb-4 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-7xl flex-col gap-5 rounded-[28px] px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-display text-2xl font-semibold text-[#2d1b12]">
                            AdvocateHub
                        </p>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#7b5b42]">
                            Built for Indian legal research, faster issue spotting, and evidence-backed AI drafting.
                        </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8f6a52]">
                        India-first research workflows
                    </p>
                </div>

                <div className="brand-rule w-full" />

                <div className="flex flex-col gap-4 text-sm text-[#7b5b42] md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-4">
                        <Link href="/" className="hover:text-[#2d1b12]">Search</Link>
                        <Link href="/AImode" className="hover:text-[#2d1b12]">AI Workspace</Link>
                        <Link href="/search?q=Supreme+Court+India" className="hover:text-[#2d1b12]">
                            Explore judgments
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-4 md:justify-end">
                        <span>Custom search providers</span>
                        <span>Bring your own LLM</span>
                        <span>PDF, DOC, and image analysis</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
