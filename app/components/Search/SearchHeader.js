import Image from "next/image";
import Link from "next/link";
import SearchBar from "../Home/SearchBar";

export default function SearchHeader({ query }) {
    return (
        <header className="flex items-center p-6 gap-8 border-b border-gray-200 bg-white sticky top-0 z-50">
            <Link href="/">
                <Image
                    src="/advocatehub.webp"
                    alt="AdvocateHub Search Logo"
                    width={120}
                    height={40}
                    className="object-contain cursor-pointer"
                />
            </Link>

            <div className="flex-grow max-w-[690px]">
                {/* We reuse the SearchBar but pass the existing query as defaultValue */}
                <SearchBar defaultValue={query} />
            </div>

            <div className="flex-grow flex justify-end gap-3 hidden sm:flex text-sm font-medium">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-[20px] h-[20px] text-gray-700" focusable="false" viewBox="0 0 24 24">
                        <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z" fill="currentColor"></path>
                    </svg>
                </button>
                <button className="bg-[#1a73e8] text-white px-6 py-2 rounded-[4px] font-medium hover:bg-[#1b66c9] hover:shadow-md transition-all">
                    Sign in
                </button>
            </div>
        </header>
    );
}
