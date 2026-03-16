import Link from "next/link";
import Header from "./components/Home/Header";
import Logo from "./components/Home/Logo";
import ModeToggle from "./components/Home/ModeToggle";
import SearchBar from "./components/Home/SearchBar";
import Footer from "./components/Home/Footer";

const QUICK_FILTERS = [
  { label: "PDF", href: "/search?q=Supreme+Court+India&type=pdf" },
  { label: "DOCX", href: "/search?q=constitutional+law&type=docx" },
  { label: "Docs", href: "/search?q=memorandum+of+understanding&type=docs" },
  { label: "Images", href: "/search?q=court+building&type=images" },
  { label: "Videos", href: "/search?q=consumer+rights+india&type=videos" },
  { label: "Audio", href: "/search?q=legal+podcast+india&type=audio" },
  { label: "News", href: "/search?q=Supreme+Court+judgment&type=news" },
  { label: "Official", href: "/search?q=Indian+Penal+Code&siteRestrict=official" },
];

const MINIMAL_POINTS = [
  "AI summary above the results",
  "One-tap filters for web, docs, PDFs, images, videos, and audio",
  "Minimal classic search with a separate AI workspace",
];

export default function Home() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-5xl text-center">
          <div className="section-kicker">
            <span className="accent-dot" />
            Minimal Search Engine
          </div>

          <div className="mt-8">
            <Logo />
          </div>

          <h1 className="font-display mt-6 text-4xl font-semibold leading-tight text-[#2d1b12] sm:text-5xl lg:text-[4.35rem]">
            Search the web, read an AI summary, then open the right source.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#7b5b42] sm:text-lg">
            Built as a minimalist engine for webpages, PDFs, DOCX, images, videos, audio,
            slides, sheets, news, and official sources, with AI mode kept separate for deeper work.
          </p>

          <div className="mt-7 flex justify-center">
            <ModeToggle />
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <SearchBar />
          </div>

          <div className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#8f6a52]">
            Start with classic search, then use the filters to narrow results by format, source, and time.
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {QUICK_FILTERS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-[#f1dfc6] bg-white/90 px-4 py-2 text-sm font-medium text-[#7b5b42] shadow-[0_8px_18px_rgba(77,45,20,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#ffcf93] hover:text-[#2d1b12]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {MINIMAL_POINTS.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[#f1dfc6] bg-white/80 px-5 py-4 text-sm leading-6 text-[#7b5b42] shadow-[0_10px_24px_rgba(77,45,20,0.04)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
