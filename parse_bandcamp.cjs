const fs = require('fs');

function parseHtmlFile(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf-8');
    const match = data.match(/data-tralbum="([^"]+)"/);
    if (match) {
      // Decode HTML entities, especially &quot; to "
      let decoded = match[1].replace(/&quot;/g, '"');
      const json = JSON.parse(decoded);
      const trackinfo = json.trackinfo;
      
      if (trackinfo && trackinfo.length > 0) {
        console.log(`\n=== Found tracks for ${filename} ===`);
        trackinfo.forEach((track, idx) => {
          const mp3Url = track.file && track.file['mp3-128'];
          console.log(`[Track ${idx+1}] ${track.title} | MP3: ${mp3Url || 'N/A'}`);
        });
      } else {
        console.log(`No trackinfo array found in ${filename}.`);
      }
    } else {
      console.log(`Could not find data-tralbum in ${filename}.`);
    }
  } catch (e) {
    console.error(`Error parsing ${filename}:`, e.message);
  }
}

parseHtmlFile('sampled_head.html');
parseHtmlFile('safary_beats.html');
