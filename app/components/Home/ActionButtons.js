import Link from "next/link";

export default function ActionButtons() {
    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
                href="/search?q=latest+Supreme+Court+judgments+India"
                className="action-primary px-5 py-3 text-sm font-semibold"
            >
                Explore live results
            </Link>
            <Link
                href="/AImode"
                className="action-secondary px-5 py-3 text-sm font-semibold"
            >
                Open AI workspace
            </Link>
        </div>
    );
}
