const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Truncate to approximately 30 seconds (128 kbps = 16,000 bytes/sec * 30 sec = 480,000 bytes)
function trimMp3(filePath) {
  try {
    const stats = fs.statSync(filePath);
    console.log(`Original file size of ${filePath}: ${stats.size} bytes`);
    
    // 30 seconds of 128kbps CBR MP3 is roughly 480,000 bytes.
    // Let's read the file and slice it.
    const targetSize = 480000;
    
    if (stats.size > targetSize) {
      const buffer = fs.readFileSync(filePath);
      const sliced = buffer.slice(0, targetSize);
      
      // Let's search back slightly to find an MP3 frame sync word (0xFFE or 0xFFF) to avoid audio click if possible,
      // but a clean slice works fine as decoder drops partial frame.
      fs.writeFileSync(filePath, sliced);
      console.log(`Trimmed ${filePath} to 30 seconds (${targetSize} bytes).`);
    } else {
      console.log(`File ${filePath} is already smaller than 30 seconds.`);
    }
  } catch (err) {
    console.error(`Error trimming ${filePath}:`, err.message);
  }
}

async function fetchAndDownload(url, destName) {
  console.log(`\n--- Fetching Bandcamp HTML for: ${destName} ---`);
  try {
    // Use curl.exe to get the Bandcamp page content
    const html = execSync(`curl.exe -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s "${url}"`).toString();
    
    const match = html.match(/data-tralbum="([^"]+)"/);
    if (match) {
      let decoded = match[1].replace(/&quot;/g, '"');
      const json = JSON.parse(decoded);
      const trackinfo = json.trackinfo;
      
      if (trackinfo && trackinfo.length > 0) {
        const firstTrackUrl = trackinfo[0].file && trackinfo[0].file['mp3-128'];
        if (firstTrackUrl) {
          const destPath = `./public/catalog/${destName}`;
          console.log(`Downloading MP3 from ${firstTrackUrl} -> ${destPath}`);
          await downloadFile(firstTrackUrl, destPath);
          console.log(`Downloaded ${destName} successfully.`);
          
          // Now trim to 30 seconds
          trimMp3(destPath);
        } else {
          console.log(`No mp3-128 found in trackinfo for ${destName}.`);
        }
      } else {
        console.log(`No tracks listed for ${destName}.`);
      }
    } else {
      console.log(`No data-tralbum found on the page for ${destName}.`);
    }
  } catch (err) {
    console.error(`Failed fetching/downloading ${destName}:`, err.message);
  }
}

async function main() {
  // Let's download and trim the requested BEATS previews:
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/safary-beats', 'safary_beats_preview.mp3');
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/tempus-fugit', 'tempus_fugit_preview.mp3');
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/sampled-head-argent-rock-69-79', 'sampled_head_preview.mp3');
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/wall-of-shadows-2', 'wall_of_shadows_preview.mp3');
}

main();
