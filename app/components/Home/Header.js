"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/", label: "Search" },
    { href: "/AImode", label: "AI Workspace" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-3 sm:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] text-sm font-semibold text-[#2a1610] shadow-lg">
                        AH
                    </span>
                    <div className="min-w-0">
                        <p className="font-display truncate text-lg font-semibold text-[#2d1b12]">
                            AdvocateHub
                        </p>
                        <p className="truncate text-[11px] uppercase tracking-[0.24em] text-[#8f6a52]">
                            Legal Research OS
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href === "/AImode"
                            ? pathname === "/AImode"
                            : pathname === "/" || pathname.startsWith("/search");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-full px-4 py-2 text-sm font-medium ${isActive
                                    ? "bg-[linear-gradient(135deg,#ffbe4a,#ff6e41)] text-white shadow-sm"
                                    : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12]"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Link
                    href={pathname === "/AImode" ? "/" : "/AImode"}
                    className="action-primary px-4 py-2 text-sm font-semibold sm:px-5"
                >
                    {pathname === "/AImode" ? "Back to search" : "Open AI mode"}
                </Link>
            </div>
        </header>
    );
}
