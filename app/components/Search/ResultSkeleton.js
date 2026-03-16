export default function ResultSkeleton() {
    return (
        <div className="surface-panel animate-pulse rounded-[24px] p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-16 rounded-full bg-[#f7debc]"></div>
                <div className="space-y-2">
                    <div className="h-4 w-48 rounded-full bg-[#f7debc]"></div>
                    <div className="h-3 w-28 rounded-full bg-[#f7debc]"></div>
                </div>
            </div>
            <div className="mb-4 h-6 w-3/4 rounded-full bg-[#f7debc]"></div>
            <div className="mb-2 h-4 w-full rounded-full bg-[#f7debc]"></div>
            <div className="mb-2 h-4 w-5/6 rounded-full bg-[#f7debc]"></div>
            <div className="h-4 w-2/3 rounded-full bg-[#f7debc]"></div>
        </div>
    );
}
