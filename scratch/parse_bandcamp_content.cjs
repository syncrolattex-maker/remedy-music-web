const fs = require('fs');

const contentPath = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\e152796d-e2bf-444e-9365-47eed43f5205\\.system_generated\\steps\\654\\content.md';
let content = fs.readFileSync(contentPath, 'utf8');

// Basic HTML entity decoder
function decodeHtml(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Bandcamp stores track data in data-tralbum attribute sometimes, or TralbumData js variable
// Let's decode the entire text or find the data-tralbum attribute.
console.log('Searching for data-tralbum...');
const tralbumMatch = content.match(/data-tralbum="([^"]+)"/) || content.match(/data-tralbum='([^']+)'/);
if (tralbumMatch) {
  console.log('Found data-tralbum attribute!');
  const decoded = decodeHtml(tralbumMatch[1]);
  try {
    const data = JSON.parse(decoded);
    console.log('Album Title:', data.current.title);
    console.log('Artist:', data.artist);
    if (data.trackinfo) {
      console.log(`Found ${data.trackinfo.length} tracks in tralbum:`);
      data.trackinfo.forEach((track, i) => {
        const mp3 = track.file ? track.file['mp3-128'] : 'No preview';
        console.log(`[Track ${i + 1}] "${track.title}" - duration: ${track.duration}s`);
        console.log(`   Preview URL: ${mp3}`);
      });
    }
  } catch (e) {
    console.error('Error parsing data-tralbum JSON:', e.message);
  }
} else {
  console.log('No data-tralbum attribute found. Let\'s try decoding the whole page and searching for trackinfo...');
  const decodedPage = decodeHtml(content);
  const trackinfoIdx = decodedPage.indexOf('trackinfo:');
  if (trackinfoIdx !== -1) {
    console.log('Found trackinfo in decoded page!');
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = trackinfoIdx; i < decodedPage.length; i++) {
      if (decodedPage[i] === '[') {
        if (bracketCount === 0) {
          bracketCount++;
          continue;
        }
        bracketCount++;
      } else if (decodedPage[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      const arrayStr = decodedPage.substring(decodedPage.indexOf('[', trackinfoIdx), endIdx);
      try {
        // Try evaluating or regex-extracting
        const regex = /\{\s*"track_num"\s*:\s*(\d+),\s*"title"\s*:\s*"([^"]+)",[\s\S]*?"file"\s*:\s*\{\s*"mp3-128"\s*:\s*"([^"]+)"\s*\}/g;
        let m;
        console.log('Tracks found via regex in trackinfo:');
        // Let's do a more robust JSON-like parse by cleaning up JavaScript refs
        // Replace unquoted keys
        const cleanedStr = arrayStr
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
          .replace(/:\s*([a-zA-Z0-9_]+)\s*(,|})/g, ':"$1"$2')
          .replace(/,\s*\]/, ']');
        
        try {
          const parsed = JSON.parse(cleanedStr);
          parsed.forEach((track, i) => {
            const mp3 = track.file ? track.file['mp3-128'] : 'No preview';
            console.log(`Track ${track.track_num || (i+1)}: "${track.title}" - Preview: ${mp3}`);
          });
        } catch (jsonErr) {
          // Fallback to simpler regex
          console.log('Regex fallback search for mp3 files:');
          const bcbitsMatches = decodedPage.match(/https?:\/\/[^\s"']+\.bcbits\.com\/stream\/[^\s"']+/g);
          if (bcbitsMatches) {
            console.log(`Found ${bcbitsMatches.length} raw stream URLs:`);
            [...new Set(bcbitsMatches)].forEach(url => console.log(url));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  } else {
    console.log('Still not found. Printing all raw bcbits URLs:');
    const decodedPage = decodeHtml(content);
    const matches = decodedPage.match(/https?:\/\/[^\s"']+\.bcbits\.com\/stream\/[^\s"']+/g);
    if (matches) {
      [...new Set(matches)].forEach(url => console.log(url));
    } else {
      console.log('None.');
    }
  }
}
