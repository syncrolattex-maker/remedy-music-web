const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\e152796d-e2bf-444e-9365-47eed43f5205\\.system_generated\\steps\\2084\\content.md', 'utf8');

const decoded = content.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const regex = /"mp3-128"\s*:\s*"([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(decoded)) !== null) {
  urls.push(match[1]);
}
console.log('Arrugas MP3 URLs found:', urls);
