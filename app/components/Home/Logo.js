import Image from "next/image";

export default function Logo({ compact = false, caption = "Search first. AI second.", showCaption = true }) {
    return (
        <div className={`w-full flex flex-col items-center ${compact ? "mb-6" : "mb-10"}`}>
            <div className={`surface-card inline-flex items-center justify-center transition-all duration-500 hover:scale-[1.02] ${compact ? "rounded-[24px] px-6 py-5" : "rounded-[32px] px-8 py-7"}`}>
                <Image
                    src="/advocatehub.webp"
                    alt="AdvocateHub Search Logo"
                    width={compact ? 220 : 290}
                    height={compact ? 76 : 98}
                    className={`object-contain ${compact ? "max-h-[76px]" : "max-h-[98px]"} w-auto`}
                    priority
                />
            </div>
            {showCaption && (
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#8f6a52]">
                    {caption}
                </p>
            )}
        </div>
    );
}
