export default function ResultSkeleton() {
    return (
        <div className="surface-panel-strong animate-pulse rounded-[28px] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#f7debc]"></div>
                <div className="space-y-2">
                    <div className="h-4 w-48 rounded-full bg-[#f7debc]"></div>
                    <div className="h-3 w-28 rounded-full bg-[#f7debc]"></div>
                </div>
            </div>
            <div className="mb-4 h-8 w-3/4 rounded-full bg-[#f7debc]"></div>
            <div className="mb-2 h-4 w-full rounded-full bg-[#f7debc]"></div>
            <div className="mb-2 h-4 w-5/6 rounded-full bg-[#f7debc]"></div>
            <div className="h-4 w-2/3 rounded-full bg-[#f7debc]"></div>
        </div>
    );
}
