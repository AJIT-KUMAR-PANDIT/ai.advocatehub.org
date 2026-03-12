export default function ResultSkeleton() {
    return (
        <div className="mb-8 w-full max-w-[650px] animate-pulse">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    );
}
