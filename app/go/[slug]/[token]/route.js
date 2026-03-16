import { NextResponse } from "next/server";
import { decodeSearchRedirectToken } from "@/lib/searchRedirect";

export async function GET(_request, { params }) {
    try {
        const { token } = params;
        const destination = decodeSearchRedirectToken(token);

        return NextResponse.redirect(destination, 307);
    } catch (error) {
        console.error("[redirect] Invalid redirect token:", error);
        return NextResponse.redirect("https://advocatehub.org", 302);
    }
}
