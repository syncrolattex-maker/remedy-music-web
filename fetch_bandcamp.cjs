const https = require('https');
const fs = require('fs');

async function fetchAlbumInfo(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Find data-tralbum="{"..."}"
        const match = data.match(/data-tralbum="([^"]+)"/);
        if (match) {
          try {
            // Decode HTML entities, especially &quot; to "
            let decoded = match[1].replace(/&quot;/g, '"');
            const json = JSON.parse(decoded);
            const trackinfo = json.trackinfo;
            
            if (trackinfo && trackinfo.length > 0) {
              console.log(`\n=== Found tracks for ${url} ===`);
              trackinfo.forEach((track, idx) => {
                const mp3Url = track.file && track.file['mp3-128'];
                console.log(`[Track ${idx+1}] ${track.title} | MP3: ${mp3Url || 'N/A'}`);
              });
              resolve(trackinfo);
            } else {
              console.log("No trackinfo array found in data-tralbum.");
              resolve(null);
            }
          } catch (e) {
            console.error("Error parsing JSON", e.message);
            resolve(null);
          }
        } else {
          console.log("Could not find data-tralbum on the page. Bot protection active or changed layout.");
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  await fetchAlbumInfo('https://remedymusicvlc.bandcamp.com/album/sampled-head-argent-rock-69-79');
  await fetchAlbumInfo('https://remedymusicvlc.bandcamp.com/album/safary-beats');
}

main();
