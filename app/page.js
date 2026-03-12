import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Navigation */}
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

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-[-15vh]">
        {/* Logo */}
        <div className="mb-[38px] w-full flex justify-center">
          <Image
            src="/advocatehub.webp"
            alt="AdvocateHub Search Logo"
            width={272}
            height={92}
            className="object-contain max-h-[92px] w-auto"
            priority
          />
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-[584px] mx-auto flex items-center rounded-full border border-gray-200 hover:shadow-md focus-within:shadow-md transition-shadow px-4 py-3 bg-white h-[46px] group">
          <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
          <input
            type="text"
            className="flex-grow outline-none text-base bg-transparent text-gray-800"
            autoFocus
          />
          {/* Mic Icon */}
          <div className="flex gap-4 items-center ml-2 flex-shrink-0">
            <svg className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285f4" d="m12 15c1.66 0 3-1.31 3-2.97v-7.02c0-1.66-1.34-3.01-3-3.01s-3 1.34-3 3.01v7.02c0 1.66 1.34 2.97 3 2.97z"></path>
              <path fill="#34a853" d="m11 18.08h2v3.92h-2z"></path>
              <path fill="#fbbc04" d="m7.05 16.87c-1.27-1.33-2.05-2.8-2.05-4.67h2c0 1.45.56 2.42 1.47 3.38v.32l-1.15 1.18z"></path>
              <path fill="#ea4335" d="m12 16.93a4.97 5.25 0 0 1 -3.54 -1.55l-1.41 1.49c1.26 1.34 3.02 2.13 4.95 2.13 3.87 0 6.99-2.92 6.99-7h-1.99c0 2.92-2.24 4.93-5 4.93z"></path>
            </svg>
            {/* Lens Icon */}
            <svg className="w-6 h-6 cursor-pointer" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285f4" d="M4 8H2C2 4.69 4.69 2 8 2v2C5.79 4 4 5.79 4 8z" />
              <path fill="#ea4335" d="M22 8h-2c0-2.21-1.79-4-4-4V2c3.31 0 6 2.69 6 6z" />
              <path fill="#fbbc04" d="M22 22h-2v-2c0-2.21-1.79-4-4-4v-2c3.31 0 6 2.69 6 6z" />
              <path fill="#34a853" d="M8 20V22C4.69 22 2 19.31 2 16h2c0 2.21 1.79 4 4 4z" />
              <circle fill="#4285f4" cx="12" cy="12" r="3" />
              <circle fill="#34a853" cx="16.5" cy="16.5" r="1.5" />
            </svg>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-[28px] flex gap-3 justify-center">
          <button className="bg-[#f8f9fa] text-[#3c4043] text-sm px-4 py-2 rounded-[4px] hover:border-gray-300 border border-transparent hover:shadow-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer">
            AdvocateHub Search
          </button>
          <button className="bg-[#f8f9fa] text-[#3c4043] text-sm px-4 py-2 rounded-[4px] hover:border-gray-300 border border-transparent hover:shadow-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer">
            I'm Feeling Lucky
          </button>
        </div>

        {/* Languages */}
        <div className="mt-7 text-[13px] text-[#4d5156]">
          Google offered in: <Link href="#" className="text-[#1a0dab] hover:underline mx-1">हिन्दी</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">বাংলা</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">తెలుగు</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">मराठी</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">தமிழ்</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ગુજરાતી</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ಕನ್ನಡ</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">മലയാളം</Link> <Link href="#" className="text-[#1a0dab] hover:underline mx-1">ਪੰਜਾਬੀ</Link>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}
