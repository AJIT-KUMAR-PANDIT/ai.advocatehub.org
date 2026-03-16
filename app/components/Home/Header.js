"use client";

import Image from "next/image";
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
            <div className="surface-panel mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full px-4 py-3 sm:px-5">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <div className="surface-card flex h-12 items-center rounded-full px-3 py-2">
                        <Image
                            src="/advocatehub.webp"
                            alt="AdvocateHub"
                            width={114}
                            height={32}
                            className="h-7 w-auto object-contain"
                            priority
                        />
                    </div>
                    <div className="hidden min-w-0 sm:block">
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a52]">
                            Minimal search + AI
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
                                    ? "bg-[#2d1b12] text-[#fff4de] shadow-sm"
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
