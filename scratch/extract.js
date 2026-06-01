const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\e152796d-e2bf-444e-9365-47eed43f5205\\.system_generated\\steps\\2062\\content.md', 'utf8');
const matches = content.match(/https?:\/\/[^\s"']+\.bcbits\.com[^\s"']+/g);
console.log(matches ? [...new Set(matches)] : 'none');
