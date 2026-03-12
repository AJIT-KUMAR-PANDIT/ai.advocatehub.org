import Link from "next/link";

export default function LanguageLinks() {
    return (
        <div className="mt-7 text-[13px] text-[#4d5156]">
            Google offered in: <Link href="#" className="text-[#1a0dab] hover:underline mx-1">हिन्दी</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">বাংলা</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">తెలుగు</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">मराठी</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">தமிழ்</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ગુજરાતી</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ಕನ್ನಡ</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">മലയാളം</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ਪੰਜਾਬੀ</Link>
        </div>
    );
}
