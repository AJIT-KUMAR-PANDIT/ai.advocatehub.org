export default function ModeToggle() {
    return (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-gray-100 p-1">
            <button className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm transition-all cursor-pointer">
                Search
            </button>
            <button className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-all cursor-pointer flex items-center gap-1.5">
                <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
                AI Mode
            </button>
        </div>
    );
}
