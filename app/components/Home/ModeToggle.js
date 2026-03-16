"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ModeToggle() {
    const pathname = usePathname();
    const isAiMode = pathname === "/AImode";

    return (
        <div className="surface-card inline-flex items-center justify-center gap-2 rounded-full p-1.5">
            <Link
                href="/"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${!isAiMode
                        ? "bg-[#2d1b12] text-[#fff4de] shadow-sm"
                        : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12]"
                    }`}
            >
                Search
            </Link>
            <Link
                href="/AImode"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${isAiMode
                        ? "bg-[#2d1b12] text-[#ffe3bb] shadow-sm"
                        : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12]"
                    }`}
            >
                <svg
                    className={`h-4 w-4 ${isAiMode ? "text-[#ffbe4a]" : ""}`}
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
