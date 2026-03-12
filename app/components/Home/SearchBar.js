export default function SearchBar() {
    return (
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
    );
}
