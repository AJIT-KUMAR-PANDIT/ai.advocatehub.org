import Header from "../components/Home/Header";
import Logo from "../components/Home/Logo";
import ModeToggle from "../components/Home/ModeToggle";
import Footer from "../components/Home/Footer";

export default function AImode() {
    return (
        <div className="flex flex-col min-h-screen bg-ai-gradient transition-all duration-700">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-[-15vh]">
                <Logo />
                <ModeToggle />

                {/* Glow Search Bar */}
                <div className="w-full max-w-[680px] mx-auto flex items-center rounded-2xl shadow-lg px-4 py-3 bg-white/90 backdrop-blur-md h-[56px] ai-search-glow group mb-6 relative z-10">
                    <svg className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Ask AdvocateHub AI anything..."
                        className="flex-grow outline-none text-base bg-transparent text-gray-800 placeholder-gray-500"
                        autoFocus
                    />
                    {/* Sparkle Icon */}
                    <div className="flex gap-4 items-center ml-2 flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                </div>

                {/* Suggested Prompts */}
                <div className="flex flex-wrap gap-2 justify-center max-w-[700px]">
                    <button className="px-4 py-2 bg-white/60 hover:bg-white/90 border border-white/40 shadow-sm rounded-full text-[13px] text-gray-700 font-medium transition-all">
                        Draft a non-disclosure agreement
                    </button>
                    <button className="px-4 py-2 bg-white/60 hover:bg-white/90 border border-white/40 shadow-sm rounded-full text-[13px] text-gray-700 font-medium transition-all">
                        Explain latest Supreme Court rulings
                    </button>
                    <button className="px-4 py-2 bg-white/60 hover:bg-white/90 border border-white/40 shadow-sm rounded-full text-[13px] text-gray-700 font-medium transition-all">
                        What is a tort?
                    </button>
                </div>

            </main>

            <Footer />
        </div>
    );
}
