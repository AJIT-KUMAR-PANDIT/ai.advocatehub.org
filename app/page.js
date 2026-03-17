import Link from "next/link";
import Header from "./components/Home/Header";
import Logo from "./components/Home/Logo";
import ModeToggle from "./components/Home/ModeToggle";
import SearchBar from "./components/Home/SearchBar";
import Footer from "./components/Home/Footer";

const QUICK_FILTERS = [
  { label: "PDF", href: "/search?q=Supreme+Court+India&type=pdf", icon: "📄" },
  { label: "DOCX", href: "/search?q=constitutional+law&type=docx", icon: "📝" },
  { label: "Docs", href: "/search?q=memorandum+of+understanding&type=docs", icon: "📃" },
  { label: "Images", href: "/search?q=court+building&type=images", icon: "🖼️" },
  { label: "Videos", href: "/search?q=consumer+rights+india&type=videos", icon: "🎬" },
  { label: "Audio", href: "/search?q=legal+podcast+india&type=audio", icon: "🎧" },
  { label: "News", href: "/search?q=Supreme+Court+judgment&type=news", icon: "📰" },
  { label: "Official", href: "/search?q=Indian+Penal+Code&siteRestrict=official", icon: "⚖️" },
];

const MINIMAL_POINTS = [
  { title: "AI Summary", description: "Get instant AI summaries above every result", icon: "✨" },
  { title: "Smart Filters", description: "One-tap filters for PDFs, docs, images & more", icon: "🎯" },
  { title: "AI Workspace", description: "Deep dive with a dedicated AI chat mode", icon: "🚀" },
];

export default function Home() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-5xl text-center">
          <div className="section-kicker animate-fade-in-up">
            <span className="accent-dot" />
            Minimal Search Engine
          </div>

          <div className="mt-10 animate-fade-in-up-delay">
            <Logo />
          </div>

          <h1 className="font-display mt-10 text-4xl font-semibold leading-[1.15] text-[#2d1b12] sm:text-5xl lg:text-[4.5rem] animate-fade-in-up-delay-2">
            Search the web, read an <span className="brand-gradient-text">AI summary</span>, then open the right source.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#7b5b42] sm:text-lg animate-fade-in-up-delay-2">
            Built as a minimalist engine for webpages, PDFs, DOCX, images, videos, audio, 
            slides, sheets, news, and official sources, with AI mode kept separate for deeper work.
          </p>

          <div className="mt-8 flex justify-center animate-fade-in-up-delay-2">
            <ModeToggle />
          </div>

          <div className="mx-auto mt-10 max-w-4xl animate-fade-in-up-delay-3">
            <SearchBar />
          </div>

          <div className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#8f6a52] animate-fade-in-up-delay-3">
            Start with classic search, then use the filters to narrow results by format, source, and time.
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up-delay-3">
            {QUICK_FILTERS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="quick-filter group rounded-full border border-[#f1dfc6] bg-white/90 px-5 py-2.5 text-sm font-medium text-[#7b5b42] shadow-[0_8px_20px_rgba(77,45,20,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffcf93] hover:text-[#2d1b12] hover:shadow-[0_12px_28px_rgba(77,45,20,0.1)]"
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3 animate-fade-in-up-delay-3">
            {MINIMAL_POINTS.map((item, index) => (
              <div
                key={item.title}
                className="feature-card surface-card group rounded-2xl px-6 py-5 text-left transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-3 text-2xl">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold text-[#2d1b12]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#7b5b42]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
