import Link from "next/link";

const LANGUAGES = [
    "हिन्दी",
    "বাংলা",
    "తెలుగు",
    "मराठी",
    "தமிழ்",
    "ગુજરાતી",
    "ಕನ್ನಡ",
    "മലയാളം",
    "ਪੰਜਾਬੀ",
];

export default function LanguageLinks() {
    return (
        <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-[#8f6a52]">
                Research across Indian languages
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                {LANGUAGES.map((language) => (
                    <Link
                        key={language}
                        href="#"
                        className="rounded-full border border-[#f4ddbf] bg-white/60 px-3 py-1.5 text-sm text-[#7b5b42] hover:bg-white hover:text-[#2d1b12]"
                    >
                        {language}
                    </Link>
                ))}
            </div>
        </div>
    );
}
