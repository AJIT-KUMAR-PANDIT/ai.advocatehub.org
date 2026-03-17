import { useState, useRef, useEffect } from "react";
import Link from "next/link";

function getVideoEmbedUrl(url) {
    if (!url) return null;
    
    try {
        let urlObj;
        try {
            urlObj = new URL(url);
        } catch {
            urlObj = new URL(url, 'https://www.youtube.com');
        }
        
        const hostname = urlObj.hostname.toLowerCase();
        
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoId = null;
            
            if (hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.substring(1).split('?')[0];
            } else {
                if (urlObj.pathname === '/watch') {
                    videoId = urlObj.searchParams.get('v');
                } else if (urlObj.pathname.includes('/shorts/')) {
                    videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0];
                } else if (urlObj.pathname.includes('/embed/')) {
                    videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
                }
            }
            
            if (videoId && videoId.length > 0 && videoId.length < 50) {
                return {
                    type: 'youtube',
                    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    videoId
                };
            }
        }
        
        if (hostname.includes('dailymotion.com')) {
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            let videoId = null;
            
            if (urlObj.pathname.includes('/video/')) {
                const videoPart = pathParts.find(p => p.startsWith('video'));
                if (videoPart) {
                    videoId = videoPart.replace('video_', '').replace('video/', '');
                } else {
                    const idx = pathParts.indexOf('video');
                    if (idx !== -1 && pathParts[idx + 1]) {
                        videoId = pathParts[idx + 1].split('_')[0];
                    }
                }
            }
            
            if (videoId) {
                return {
                    type: 'dailymotion',
                    embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        if (hostname.includes('vimeo.com')) {
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            const videoId = pathParts.find(p => /^\d+$/.test(p));
            
            if (videoId) {
                return {
                    type: 'vimeo',
                    embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
                    videoId
                };
            }
        }
        
        return null;
    } catch (e) {
        console.error('Error parsing video URL:', e);
        return null;
    }
}

function VideoPlayerModal({ video, onClose }) {
    const embedInfo = getVideoEmbedUrl(video.link);
    
    if (!embedInfo) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                <div className="surface-panel-strong rounded-[24px] overflow-hidden max-w-4xl w-full">
                    <div className="aspect-video bg-[#1a1a1a] flex flex-col items-center justify-center text-white p-8">
                        <svg className="h-16 w-16 mb-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <p className="text-lg mb-4">Unable to play this video</p>
                        <Link href={video.link} target="_blank" className="action-primary">
                            Open in New Tab
                        </Link>
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="surface-panel-strong rounded-[24px] overflow-hidden max-w-5xl w-full">
                <div className="relative aspect-video bg-black rounded-t-[24px]">
                    <iframe
                        src={embedInfo.embedUrl}
                        title={video.title}
                        className="absolute inset-0 w-full h-full rounded-t-[24px]"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
                <div className="p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="font-display text-xl font-semibold text-[#2d1b12]">
                                {video.title}
                            </h2>
                            {video.snippet && (
                                <p className="mt-2 text-sm text-[#7b5b42]">
                                    {video.snippet}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Link 
                                href={video.link} 
                                target="_blank"
                                className="action-primary px-4 py-2 text-sm font-medium whitespace-nowrap"
                            >
                                <svg className="h-4 w-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Site
                            </Link>
                            <button 
                                onClick={onClose}
                                className="action-secondary px-4 py-2 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 p-2">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

function VideoTile({ video, onPlay }) {
    const embedInfo = getVideoEmbedUrl(video.link);
    const thumbnail = embedInfo?.thumbnail || video.thumbnail;
    const hostname = (() => {
        try {
            return new URL(video.link).hostname.replace('www.', '');
        } catch {
            return video.formattedUrl || 'Video';
        }
    })();
    
    return (
        <button
            onClick={onPlay}
            className="group w-full text-left bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all hover:ring-2 hover:ring-[#ff6e41]/20"
        >
            <div className="relative aspect-video bg-[#2a2a2a] overflow-hidden">
                {thumbnail ? (
                    <img 
                        src={thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="h-12 w-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                )}
                
                {/* Duration badge */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-xs text-white rounded">
                        {video.duration}
                    </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-14 w-14 rounded-full bg-[#ff6e41] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="p-3">
                <h3 className="text-sm font-semibold text-[#2d1b12] line-clamp-2 leading-tight">
                    {video.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[#8f6a52] truncate">
                        {hostname}
                    </span>
                    <span className="text-xs text-[#8f6a52]">
                        Play
                    </span>
                </div>
            </div>
        </button>
    );
}

export default function VideoPlaylist({ videos, visibleCount, onLoadMore, loadingMore, hasMore, query }) {
    const [currentVideo, setCurrentVideo] = useState(null);
    const containerRef = useRef(null);
    const sentinelRef = useRef(null);
    
    const visibleVideos = videos.slice(0, visibleCount);
    
    // Lock body scroll when modal is open
    useEffect(() => {
        if (currentVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [currentVideo]);
    
    // Auto-load more when scrolling to bottom
    useEffect(() => {
        if (!hasMore || loadingMore) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0 }
        );
        
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }
        
        return () => observer.disconnect();
    }, [hasMore, loadingMore, onLoadMore]);
    
    const handlePlayVideo = (video) => {
        setCurrentVideo(video);
    };
    
    const handleCloseVideo = () => {
        setCurrentVideo(null);
    };
    
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && currentVideo) {
                handleCloseVideo();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [currentVideo]);
    
    return (
        <div ref={containerRef} className="space-y-6">
            {/* Video count header */}
            <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#2d1b12]">
                    Videos for &quot;{query}&quot;
                </h2>
                <span className="text-sm text-[#8f6a52]">
                    {videos.length} videos found
                </span>
            </div>
            
            {/* Video Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {visibleVideos.map((video, index) => (
                    <VideoTile
                        key={`${video.link}-${index}`}
                        video={video}
                        onPlay={() => handlePlayVideo(video)}
                    />
                ))}
            </div>
            
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
            
            {/* Loading indicator */}
            {loadingMore && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-[#8f6a52]">
                        <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm font-medium">Loading more videos...</span>
                    </div>
                </div>
            )}
            
            {/* All loaded message */}
            {!hasMore && visibleVideos.length > 0 && (
                <p className="text-center text-sm text-[#8f6a52] py-4">
                    All videos loaded
                </p>
            )}
            
            {/* Video Player Modal */}
            {currentVideo && (
                <VideoPlayerModal 
                    video={currentVideo} 
                    onClose={handleCloseVideo} 
                />
            )}
        </div>
    );
}