import Link from "next/link";
import Image from "next/image";

export default function ResultImageItem({ result }) {
    if (!result || !result.image) return null;

    let resolvedHostname = "";
    try {
         resolvedHostname = new URL(result.link, "https://advocatehub.org").hostname.replace(/^www\./, "");
    } catch {
         resolvedHostname = result.formattedUrl || "Website";
    }

    return (
        <article className="group relative overflow-hidden rounded-[20px] bg-[#f8f6f3] shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-[#d75127]/20 flex flex-col h-full">
            <Link href={result.link} target="_blank" className="block relative w-full aspect-square bg-[#ece8e3] overflow-hidden">
                <img
                    src={result.image.thumbnailLink || result.image.url}
                    alt={result.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </Link>
            
            <div className="flex flex-col p-4 flex-grow justify-between">
                <Link href={result.link} target="_blank" className="block">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#2d1b12] group-hover:text-[#d75127]">
                        {result.title}
                    </h3>
                </Link>
                
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d75127]/10 text-[10px] font-bold text-[#d75127]">
                        {resolvedHostname.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-xs font-medium tracking-wide text-[#8f6a52]">
                        {resolvedHostname}
                    </span>
                </div>
            </div>
        </article>
    );
}
