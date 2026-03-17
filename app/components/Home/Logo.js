import Image from "next/image";

export default function Logo({ compact = false, caption = "Search first. AI second.", showCaption = true }) {
    return (
        <div className={`w-full flex flex-col items-center ${compact ? "mb-6" : "mb-8"}`}>
            <div className={`surface-card inline-flex items-center justify-center ${compact ? "rounded-[22px] px-5 py-4" : "rounded-[28px] px-6 py-5"}`}>
                <Image
                    src="/advocatehub.webp"
                    alt="AdvocateHub Search Logo"
                    width={compact ? 210 : 272}
                    height={compact ? 72 : 92}
                    className={`object-contain ${compact ? "max-h-[72px]" : "max-h-[92px]"} w-auto`}
                    priority
                />
            </div>
            {showCaption && (
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8f6a52]">
                    {caption}
                </p>
            )}
        </div>
    );
}
