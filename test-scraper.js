function resolveGoogleTargetUrl(href = "") {
    if (!href) return "";
    if (href.startsWith("/url?")) {
        try {
            const url = new URL(href, "https://www.google.com");
            const q = url.searchParams.get("q");
            if (q) return q;
        } catch {
            return href;
        }
    }
    return href.startsWith("/") ? `https://www.google.com${href}` : href;
}

function parseGoogleHtmlResults(html, num) {
    const results = [];
    const blockRegex = /<div class="g(?: [^>]+)?">(.*?)<\/div><\/div><\/div>/gs;
    const titleRegex = /<h3[^>]*>(.*?)<\/h3>/i;
    const linkRegex  = /<a[^>]+href="([^"]+)"[^>]*>/i;
    const snippetRegex = /<div class="VwiC3b[^>]*>(.*?)<\/div>|<span class="aCOpRe"[^>]*>(.*?)<\/span>|<div class="s"[^>]*>(.*?)<\/div>/i;
    const citeRegex  = /<cite[^>]*>(.*?)<\/cite>/i;

    let match;
    while ((match = blockRegex.exec(html)) !== null && results.length < num) {
        const block = match[1];
        const titleMatch = titleRegex.exec(block);
        const linkMatch  = linkRegex.exec(block);
        if (!titleMatch || !linkMatch) continue;

        let title = titleMatch[1].replace(/<[^>]*>?/gm, '').trim();
        let rawHref = linkMatch[1];
        if (rawHref === "#" || !rawHref) continue;

        const targetUrl = resolveGoogleTargetUrl(rawHref);
        const snippetMatch = snippetRegex.exec(block);
        let snippet = "";
        if (snippetMatch) {
            snippet = (snippetMatch[1] || snippetMatch[2] || snippetMatch[3] || "").replace(/<[^>]*>?/gm, '').trim();
        }
        if (!snippet || snippet.length < 10) {
            snippet = block.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 150).trim() + "...";
        }
        const citeMatch = citeRegex.exec(block);
        const visibleUrl = citeMatch ? citeMatch[1].replace(/<[^>]*>?/gm, '').split(" › ")[0].trim() : targetUrl;

        results.push({ title, link: targetUrl, snippet, formattedUrl: visibleUrl });
    }
    return results;
}
console.log(parseGoogleHtmlResults('<div><div class="g"><h3 class="test">Title</h3><a href="/url?q=https://test.com">test</a><div class="VwiC3b">Snippet contents</div><cite>test.com</cite></div></div></div>', 1));
