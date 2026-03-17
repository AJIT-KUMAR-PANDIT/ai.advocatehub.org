const fs = require('fs');
const html = fs.readFileSync('test_duckduckgo_scraper.html', 'utf8');

const titleRegex = /<h2 class="result__title">.*?<a class="result__url" href="([^"]+)">([^<]+)<\/a>.*?<\/h2>/ig;
const snippetClassRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/ig;

let match;
let count = 0;
while ((match = titleRegex.exec(html)) !== null) {
    count++;
    console.log(`Found Title [${count}]: ${match[2].replace(/<[^>]*>?/gm, '').trim()}`);
}
console.log('Total titles found:', count);
