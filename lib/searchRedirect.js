const ADVOCATEHUB_REDIRECT_BASE = "https://advocatehub.org";

function toBase64Url(value) {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function fromBase64Url(value) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded     = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
}

export function slugifySearchRedirect(input = "") {
    const slug = input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);

    return slug || "result";
}

export function buildSearchRedirectPath(targetUrl, label = "") {
    const slug  = slugifySearchRedirect(label || targetUrl);
    const token = toBase64Url(targetUrl);

    return `/go/${slug}/${token}`;
}

export function buildSearchRedirectDisplayUrl(targetUrl, label = "") {
    const slug = slugifySearchRedirect(label || targetUrl);
    return `${ADVOCATEHUB_REDIRECT_BASE}/go/${slug}`;
}

export function decodeSearchRedirectToken(token) {
    const decoded = fromBase64Url(token);
    return new URL(decoded).toString();
}
