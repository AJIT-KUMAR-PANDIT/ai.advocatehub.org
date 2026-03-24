"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

const NAV_ITEMS = [
    { href: "/", label: "Search" },
    { href: "/AImode", label: "AI Workspace" },
];

export default function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <header className="px-4 pt-5 sm:px-6 lg:px-8">
            <div className="surface-panel mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full px-5 py-3.5 sm:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3.5 group">
                    <div className="surface-card flex h-12 items-center rounded-full px-3.5 py-2.5 transition-all duration-300 group-hover:scale-105">
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
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8f6a52]">
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
                                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                                    isActive
                                    ? "bg-gradient-to-r from-[#2d1b12] to-[#3d2b1f] text-[#fff4de] shadow-md"
                                    : "text-[#7b5b42] hover:bg-white/70 hover:text-[#2d1b12] hover:shadow-sm"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    {session?.user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm text-[#7b5b42] sm:block">
                                {session.user.email}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className="rounded-full border border-[#f1dfc6] bg-white/90 px-4 py-2 text-sm font-medium text-[#7b5b42] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffcf93] hover:text-[#2d1b12] hover:shadow-md"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("google")}
                            className="action-primary px-5 py-2.5 text-sm font-semibold sm:px-6"
                        >
                            Sign In
                        </button>
                    )}
                    
                    <Link
                        href={pathname === "/AImode" ? "/" : "/AImode"}
                        className="action-primary px-5 py-2.5 text-sm font-semibold sm:px-6"
                    >
                        {pathname === "/AImode" ? (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </>
                        ) : (
                            <>
                                Open AI
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
