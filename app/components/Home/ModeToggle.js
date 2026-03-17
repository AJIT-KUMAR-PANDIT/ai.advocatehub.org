"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ModeToggle() {
    const pathname = usePathname();
    const isAiMode = pathname === "/AImode";

    return (
        <div className="surface-card inline-flex items-center justify-center gap-1 rounded-full p-1.5 shadow-md">
            <Link
                href="/"
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${!isAiMode
                        ? "bg-gradient-to-r from-[#2d1b12] to-[#3d2b1f] text-[#fff4de] shadow-md"
                        : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12]"
                    }`}
            >
                Search
            </Link>
            <Link
                href="/AImode"
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${isAiMode
                        ? "bg-gradient-to-r from-[#2d1b12] to-[#3d2b1f] text-[#ffe3bb] shadow-md"
                        : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12]"
                    }`}
            >
                <svg
                    className={`h-4 w-4 ${isAiMode ? "text-[#ffbe4a]" : "text-[#ffbe4a]"}`}
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
