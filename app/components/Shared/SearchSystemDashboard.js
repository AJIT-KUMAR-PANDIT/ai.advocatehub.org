const CARD_CLASS = "surface-panel-strong rounded-[30px] p-5 sm:p-6";

export default function SearchSystemDashboard({ snapshot, title = "Search Intelligence" }) {
    if (!snapshot) {
        return null;
    }

    return (
        <section className="mx-auto mt-8 w-full max-w-7xl">
            <div className="section-kicker">
                <span className="accent-dot" />
                {title}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className={CARD_CLASS}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                                Search Appearance
                            </p>
                            <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-[#2d1b12]">
                                The engine now shows its ranking and AI layers instead of hiding them.
                            </h2>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-[#7b5b42]">
                            Brand palette, trust labels, AI handoff, and RAG visibility are surfaced as part of the experience.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {snapshot.appearanceGraph.map((item) => (
                            <div key={item.label} className="flex flex-col">
                                <div className="relative h-40 overflow-hidden rounded-[24px] border border-[#f4ddbf] bg-[rgba(255,255,255,0.72)]">
                                    <div
                                        className="absolute inset-x-3 bottom-3 rounded-[18px] bg-gradient-to-t from-[#ff6e41] via-[#ff8b39] to-[#ffbe4a]"
                                        style={{ height: `${item.value}%` }}
                                    />
                                    <span className="absolute left-3 top-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8f4c26]">
                                        {item.value}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm font-semibold text-[#2d1b12]">{item.label}</p>
                                <p className="mt-1 text-xs leading-5 text-[#7b5b42]">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className={CARD_CLASS}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                        Ranking Config
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-semibold text-[#2d1b12]">
                        Env-driven provider order and legal-domain weighting.
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#ffd8b3] bg-[#fff2de] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3471d]">
                            Priority: {snapshot.providerPriority}
                        </span>
                        {snapshot.providerOrder.map((provider) => (
                            <span
                                key={provider}
                                className="rounded-full border border-[#ffd8b3] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6c3b22]"
                            >
                                {provider}
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">File Types</p>
                            <p className="mt-2 font-display text-4xl font-semibold text-[#2d1b12]">
                                {snapshot.filterCounts.fileTypes}
                            </p>
                        </div>
                        <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">Site Scopes</p>
                            <p className="mt-2 font-display text-4xl font-semibold text-[#2d1b12]">
                                {snapshot.filterCounts.siteScopes}
                            </p>
                        </div>
                        <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">Date Windows</p>
                            <p className="mt-2 font-display text-4xl font-semibold text-[#2d1b12]">
                                {snapshot.filterCounts.dateWindows}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-[#f4ddbf] bg-[linear-gradient(135deg,rgba(255,190,74,0.16),rgba(255,110,65,0.1))] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f4c26]">
                            Embeddings / RAG
                        </p>
                        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="font-display text-2xl font-semibold text-[#2d1b12]">
                                    {snapshot.embedding.model}
                                </p>
                                <p className="mt-1 text-sm text-[#7b5b42]">
                                    {snapshot.embedding.dimensions}-dimensional retrieval vectors
                                </p>
                            </div>
                            <span className="rounded-full border border-[#ffd8b3] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3471d]">
                                {snapshot.embedding.enabled ? "Enabled" : "Needs API key"}
                            </span>
                        </div>
                    </div>
                </article>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <article className={CARD_CLASS}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                        Ranking Mechanism
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-semibold text-[#2d1b12]">
                        Retrieval, reranking, RAG grounding, then answer generation.
                    </h2>

                    <div className="mt-6 space-y-4">
                        {snapshot.rankingStages.map((stage) => (
                            <div key={stage.label} className="rounded-[24px] border border-[#f4ddbf] bg-white/75 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2d1b12]">{stage.label}</p>
                                        <p className="mt-1 text-sm leading-6 text-[#7b5b42]">{stage.detail}</p>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f4c26]">
                                        {stage.emphasis} emphasis
                                    </span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ffe6c5]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#ffbe4a] via-[#ff9340] to-[#ff6e41]"
                                        style={{ width: `${stage.emphasis}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {snapshot.ragFlow.map((node) => (
                            <div key={node.step} className="rounded-[24px] border border-[#f4ddbf] bg-[rgba(255,255,255,0.72)] p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d75127]">
                                    Step {node.step}
                                </p>
                                <p className="mt-2 font-semibold text-[#2d1b12]">{node.label}</p>
                                <p className="mt-2 text-xs leading-5 text-[#7b5b42]">{node.note}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className={CARD_CLASS}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                        Priority Domains
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-semibold text-[#2d1b12]">
                        Trusted sources shape the final ranking.
                    </h2>

                    <div className="mt-5 space-y-3">
                        {snapshot.topPrioritySites.map((site) => (
                            <div key={site.domain} className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#2d1b12]">{site.label}</p>
                                        <p className="truncate text-xs uppercase tracking-[0.16em] text-[#8f6a52]">{site.domain}</p>
                                    </div>
                                    <span className="rounded-full border border-[#ffd8b3] bg-[#fff2de] px-3 py-1 text-xs font-semibold text-[#a3471d]">
                                        {site.weight}
                                    </span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ffe6c5]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#ffbe4a] to-[#ff6e41]"
                                        style={{ width: `${site.weight}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {snapshot.tierDistribution.map((tier) => (
                            <div key={tier.label} className="rounded-[22px] border border-[#f4ddbf] bg-[rgba(255,255,255,0.72)] p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">{tier.label}</p>
                                <div className="mt-3 flex items-end justify-between gap-3">
                                    <p className="font-display text-4xl font-semibold text-[#2d1b12]">
                                        {tier.count}
                                    </p>
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a3471d]">
                                        Avg {tier.score}
                                    </span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ffe6c5]">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${tier.accent}`}
                                        style={{ width: `${tier.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </section>
    );
}
