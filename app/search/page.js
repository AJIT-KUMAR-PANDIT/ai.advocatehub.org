import { Suspense } from "react";
import SearchResultsClient from "../components/Search/SearchResultsClient";

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen"></div>}>
            <SearchResultsClient />
        </Suspense>
    );
}
