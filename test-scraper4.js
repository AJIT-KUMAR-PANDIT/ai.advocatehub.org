const fs = require('fs');
const html = fs.readFileSync('test_duckduckgo_scraper.html', 'utf8');

const results = [];
const blocks = html.split('class="result ');

for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    const titleMatch = block.match(/<h2 class="result__title">[\s\S]*?<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/i);
    const snippetMatch = block.match(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/i);
    
    if (titleMatch) {
        let rawHref = titleMatch[1];
        let title = titleMatch[2].replace(/<[^>]+>/g, '').trim();
        let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        
        // Target URL usually in rawHref, sometimes encoded let's print rawHref
        console.log(`\nResult ${i}:`);
        console.log(`Title: ${title}`);
        console.log(`Href: ${rawHref}`);
        console.log(`Snippet: ${snippet}`);
        
        results.push({title, link:rawHref, snippet});
    }
}
console.log(`\nTotal parsed: ${results.length}`);
