import Header from "./components/Home/Header";
import Logo from "./components/Home/Logo";
import ModeToggle from "./components/Home/ModeToggle";
import SearchBar from "./components/Home/SearchBar";
import ActionButtons from "./components/Home/ActionButtons";
import LanguageLinks from "./components/Home/LanguageLinks";
import Footer from "./components/Home/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-[-15vh]">
        <Logo />
        <ModeToggle />
        <SearchBar />
        <ActionButtons />
        <LanguageLinks />
      </main>

      <Footer />
    </div>
  );
}
