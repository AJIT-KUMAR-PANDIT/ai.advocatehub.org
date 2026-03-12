import Link from "next/link";

export default function ResultItem({ result }) {
    if (!result) return null;

    return (
        <div className="mb-8 w-full max-w-[650px]">
            <div className="flex flex-col gap-1">
                <Link href={result.link} className="group">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200">
                            <span className="text-xs font-bold text-gray-500">{result.formattedUrl?.[0]?.toUpperCase() || "W"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#202124] truncate max-w-[280px] sm:max-w-none">
                                {result.formattedUrl || result.displayLink || (new URL(result.link)).hostname}
                            </span>
                        </div>
                    </div>
                    <h3 className="text-xl text-[#1a0dab] group-hover:underline font-normal lineHeight-[1.2]">
                        {result.title}
                    </h3>
                </Link>
            </div>
            <p className="text-[#4d5156] mt-1 text-sm leading-[1.58]">
                {result.snippet}
            </p>
        </div>
    );
}
