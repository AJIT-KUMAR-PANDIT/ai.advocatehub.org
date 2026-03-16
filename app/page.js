import Header from "./components/Home/Header";
import Logo from "./components/Home/Logo";
import ModeToggle from "./components/Home/ModeToggle";
import SearchBar from "./components/Home/SearchBar";
import ActionButtons from "./components/Home/ActionButtons";
import LanguageLinks from "./components/Home/LanguageLinks";
import Footer from "./components/Home/Footer";
import SearchSystemDashboard from "./components/Shared/SearchSystemDashboard";
import { getSearchSystemSnapshot } from "@/lib/searchSystemSnapshot";

const HIGHLIGHTS = [
  {
    title: "Logo-led search experience",
    description:
      "The entire product now follows the AdvocateHub gold-and-coral palette instead of a generic search clone.",
  },
  {
    title: "RAG from web and files",
    description:
      "Search results, uploaded PDFs, docs, and images can all become grounded context for the AI workspace.",
  },
  {
    title: "Ranking you can inspect",
    description:
      "Provider order, priority-domain boosts, embeddings, and retrieval flow are now exposed visually at the bottom.",
  },
];

const AI_FLOW = [
  "Search the open web or legal portals",
  "Pull results into grounded AI mode",
  "Upload PDFs, DOCX, TXT, and images",
  "Draft with citations or your own LLM",
];

export default function Home() {
  const dashboardSnapshot = getSearchSystemSnapshot();

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Header />

      <main className="flex-grow px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.28fr)_380px]">
          <div className="surface-panel-strong rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="section-kicker">
              <span className="accent-dot" />
              Search + AI Engine
            </div>

            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl font-semibold leading-tight text-[#2d1b12] sm:text-5xl lg:text-[4.25rem]">
                Search the law in brand colors, then flow straight into grounded AI.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#7b5b42] sm:text-lg">
                AdvocateHub now feels like one connected engine: classic legal search up front,
                a distinct AI workspace beside it, and transparent ranking plus RAG mechanics below.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ModeToggle />
              <span className="rounded-full border border-[#ffd9b1] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a4d24]">
                {dashboardSnapshot.providerOrder.join(" -> ")}
              </span>
            </div>

            <div className="mt-6">
              <Logo />
            </div>

            <div className="mx-auto mt-4 max-w-4xl">
              <SearchBar />
            </div>

            <ActionButtons />
            <LanguageLinks />
          </div>

          <aside className="grid gap-4">
            <div className="surface-panel rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d75127]">
                AI Mode Preview
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold leading-tight text-[#2d1b12]">
                A different workspace, not just another tab.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#7b5b42]">
                AI mode keeps its own darker RAG-first atmosphere so research and drafting feel focused, while classic search stays fast and bright.
              </p>

              <div className="mt-5 rounded-[28px] bg-[linear-gradient(145deg,#2a1610,#5a2417_60%,#7b301b)] p-5 text-white shadow-[0_20px_42px_rgba(28,13,9,0.3)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd9a6]">
                      RAG Workspace
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold">
                      Search-grounded + document-grounded answers
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffe3bb]">
                    {dashboardSnapshot.embedding.model}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {AI_FLOW.map((item, index) => (
                    <div key={item} className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/6 px-4 py-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] text-xs font-bold text-[#2a1610]">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-[#ffe3bb]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a52]">
                Live Config
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">Priority</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-[#2d1b12]">
                    {dashboardSnapshot.providerPriority}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">Embedding Dim</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-[#2d1b12]">
                    {dashboardSnapshot.embedding.dimensions}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#f4ddbf] bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8f6a52]">Priority Sites</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-[#2d1b12]">
                    {dashboardSnapshot.prioritySiteCount}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mx-auto mt-6 grid w-full max-w-7xl gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="surface-panel rounded-[28px] p-6">
              <div className="flex items-center gap-3">
                <span className="accent-dot" />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6a52]">
                  Workflow
                </p>
              </div>
              <h2 className="font-display mt-4 text-[1.8rem] font-semibold leading-tight text-[#2d1b12]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#7b5b42]">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <SearchSystemDashboard snapshot={dashboardSnapshot} />
      </main>

      <Footer />
    </div>
  );
}
