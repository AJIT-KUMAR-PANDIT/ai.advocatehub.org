import Link from "next/link";

export default function Header() {
    return (
        <header className="flex justify-end items-center p-3 space-x-3 text-[13px] text-gray-800 font-medium">
            <Link href="#" className="hover:underline">Gmail</Link>
            <Link href="#" className="hover:underline">Images</Link>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                <svg className="w-[20px] h-[20px] text-gray-700" focusable="false" viewBox="0 0 24 24">
                    <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z" fill="currentColor"></path>
                </svg>
            </button>
            <button className="bg-[#1a73e8] text-white px-6 py-[10px] rounded-[4px] font-medium hover:bg-[#1b66c9] hover:shadow-md transition-all text-sm ml-2">
                Sign in
            </button>
        </header>
    );
}
