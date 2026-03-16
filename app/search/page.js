import { Suspense } from "react";
import SearchResultsClient from "../components/Search/SearchResultsClient";
import { getSearchSystemSnapshot } from "@/lib/searchSystemSnapshot";

export default function SearchPage() {
    const dashboardSnapshot = getSearchSystemSnapshot();

    return (
        <Suspense fallback={<div className="min-h-screen"></div>}>
            <SearchResultsClient dashboardSnapshot={dashboardSnapshot} />
        </Suspense>
    );
}
