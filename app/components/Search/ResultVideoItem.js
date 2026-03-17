import { useState } from "react";
import Link from "next/link";

function getVideoEmbedUrl(url) {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        
        // YouTube
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            if (videoId) {
                return {
                    type: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        // YouTube Shorts
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/shorts/')) {
            const videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0];
            if (videoId) {
                return {
                    type: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        // Dailymotion
        if (urlObj.hostname.includes('dailymotion.com')) {
            const videoId = urlObj.pathname.split('/video/')[1]?.split('_')[0] || urlObj.pathname.split('/')[4];
            if (videoId) {
                return {
                    type: 'dailymotion',
                    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        // Vimeo
        if (urlObj.hostname.includes('vimeo.com')) {
            const videoId = urlObj.pathname.split('/')[1];
            if (videoId && /^\d+$/.test(videoId)) {
                return {
                    type: 'vimeo',
                    embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        return null;
    } catch {
        return null;
    }
}

export default function ResultVideoItem({ result }) {
    const [isPlaying, setIsPlaying] = useState(false);
    
    if (!result || !result.video) return null;

    let resolvedHostname = "";
    try {
         resolvedHostname = new URL(result.link, "https://advocatehub.org").hostname.replace(/^www\./, "");
    } catch {
         resolvedHostname = result.formattedUrl || "Video";
    }

    const hasThumbnail = result.thumbnail || (result.image && result.image.url);
    const embedInfo = getVideoEmbedUrl(result.link);
    const canEmbed = embedInfo !== null;

    return (
        <article className="group relative overflow-hidden rounded-[20px] bg-[#f8f6f3] shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-[#d75127]/20 flex flex-col h-full">
            {isPlaying && canEmbed ? (
                <div className="relative w-full aspect-video bg-black">
                    <iframe
                        src={embedInfo.embedUrl}
                        title={result.title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                    >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            ) : (
                <div 
                    className="block relative w-full aspect-video bg-[#ece8e3] overflow-hidden cursor-pointer"
                    onClick={() => canEmbed && setIsPlaying(true)}
                >
                    {hasThumbnail ? (
                        <img
                            src={result.thumbnail || result.image.url}
                            alt={result.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff6e41]/10 to-[#ffbe4a]/10">
                            <svg className="h-16 w-16 text-[#d75127]/40" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    )}
                    {result.duration && (
                        <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
                            {result.duration}
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {canEmbed ? (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d75127] shadow-lg">
                                <svg className="h-6 w-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2d1b12] shadow-lg">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="flex flex-col p-4 flex-grow justify-between">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#2d1b12] flex-1">
                        {result.title}
                    </h3>
                    <Link 
                        href={result.link} 
                        target="_blank"
                        className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[#d75127] hover:text-[#ff6e41] transition-colors"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Visit
                    </Link>
                </div>
                
                {result.snippet && (
                    <p className="mt-2 line-clamp-1 text-xs text-[#8f6a52]">
                        {result.snippet}
                    </p>
                )}
                
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
