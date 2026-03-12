import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#f2f2f2] text-[#70757a] text-[14px] mt-auto w-full">
            <div className="px-8 py-3.5 border-b border-[#dadce0]">
                India
            </div>
            <div className="px-8 py-3.5 flex flex-col md:flex-row justify-between break-words gap-4 md:gap-0">
                <div className="flex gap-7 justify-center md:justify-start">
                    <Link href="#" className="hover:underline">About</Link>
                    <Link href="#" className="hover:underline">Advertising</Link>
                    <Link href="#" className="hover:underline">Business</Link>
                    <Link href="#" className="hover:underline">How Search works</Link>
                </div>
                <div className="flex gap-7 justify-center md:justify-end">
                    <Link href="#" className="hover:underline">Privacy</Link>
                    <Link href="#" className="hover:underline">Terms</Link>
                    <Link href="#" className="hover:underline">Settings</Link>
                </div>
            </div>
        </footer>
    );
}
