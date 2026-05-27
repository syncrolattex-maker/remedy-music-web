const fs = require('fs');

const contentPath = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\e152796d-e2bf-444e-9365-47eed43f5205\\.system_generated\\steps\\654\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

// Bandcamp stores track information in a JS variable named 'TralbumData' or 'trackinfo'
// Let's find "trackinfo"
const startIdx = content.indexOf('trackinfo:');
if (startIdx !== -1) {
  console.log('Found trackinfo!');
  // Let's grab a chunk of text after trackinfo:
  let bracketCount = 0;
  let endIdx = -1;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) {
        bracketCount++;
        continue;
      }
      bracketCount++;
    } else if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  if (endIdx !== -1) {
    const trackinfoText = content.substring(startIdx, endIdx);
    console.log('Extracted trackinfo string length:', trackinfoText.length);
    // Find all track names and mp3 links
    const trackRegex = /"title"\s*:\s*"([^"]+)"/g;
    const fileRegex = /"file"\s*:\s*\{"mp3-128"\s*:\s*"([^"]+)"\}/g;
    
    // We can parse the trackinfo array using JSON-like parser or regex.
    // Let's extract the trackinfo JSON array.
    const jsonStr = trackinfoText.substring(trackinfoText.indexOf('['));
    try {
      // Bandcamp JS often has unquoted keys or comments or variable refs. Let's do regex extraction.
      const tracks = [];
      const trackBlockRegex = /\{\s*album_preorder[\s\S]*?\}/g;
      
      // Let's extract each track object by finding matching curly braces.
      let openBraces = 0;
      let startObj = -1;
      for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') {
          if (openBraces === 0) {
            startObj = i;
          }
          openBraces++;
        } else if (jsonStr[i] === '}') {
          openBraces--;
          if (openBraces === 0 && startObj !== -1) {
            tracks.push(jsonStr.substring(startObj, i + 1));
          }
        }
      }
      
      console.log(`Found ${tracks.length} track objects in js.`);
      tracks.forEach((trackStr, index) => {
        const titleMatch = trackStr.match(/"title"\s*:\s*"([^"]+)"/);
        const fileMatch = trackStr.match(/"file"\s*:\s*\{\s*"mp3-128"\s*:\s*"([^"]+)"\s*\}/) || trackStr.match(/"mp3-128"\s*:\s*"([^"]+)"/);
        const trackNumMatch = trackStr.match(/"track_num"\s*:\s*(\d+)/);
        
        const title = titleMatch ? titleMatch[1] : `Track ${index + 1}`;
        const file = fileMatch ? fileMatch[1] : 'No preview URL';
        const num = trackNumMatch ? trackNumMatch[1] : (index + 1);
        
        console.log(`Track ${num}: "${title}"`);
        console.log(`  File: ${file}`);
      });
      
    } catch (e) {
      console.error('Error parsing regex:', e);
    }
  } else {
    console.log('Could not find closing bracket for trackinfo.');
  }
} else {
  console.log('Could not find trackinfo: in content.');
  // Let's search for "mp3-128" or "bcbits.com"
  const matches = content.match(/https?:\/\/[^\s"']+\.bcbits\.com[^\s"']+/g);
  if (matches) {
    console.log(`Found ${matches.length} bcbits URLs in page:`);
    const unique = [...new Set(matches)];
    unique.forEach(url => console.log(url));
  } else {
    console.log('No bcbits URLs found.');
  }
}
