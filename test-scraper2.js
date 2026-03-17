const fs = require('fs');
const html = fs.readFileSync('test_google_scraper.html', 'utf8');

const regex = /<h3[^>]*>(.*?)<\/h3>/g;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
    count++;
    console.log(`Found Title: ${match[1].replace(/<[^>]*>?/gm, '').trim()}`);
}
console.log('Total h3 tags found:', count);
