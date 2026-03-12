"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ModeToggle() {
    const pathname = usePathname();
    const isAiMode = pathname === "/AImode";

    return (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-white/50 backdrop-blur-sm p-1 shadow-sm border border-gray-100">
            <Link
                href="/"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${!isAiMode
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
            >
                Search
            </Link>
            <Link
                href="/AImode"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isAiMode
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
            >
                <svg
                    className={`h-4 w-4 ${isAiMode ? "text-purple-500" : ""}`}
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
            </Link>
        </div>
    );
}
