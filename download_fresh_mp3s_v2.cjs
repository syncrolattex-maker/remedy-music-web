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

async function fetchAndDownload(url, destName) {
  console.log(`Fetching HTML for ${destName}...`);
  // Use curl to bypass simple node block
  const html = execSync(`curl.exe -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s "${url}"`).toString();
  
  const match = html.match(/data-tralbum="([^"]+)"/);
  if (match) {
    let decoded = match[1].replace(/&quot;/g, '"');
    const json = JSON.parse(decoded);
    const trackinfo = json.trackinfo;
    
    if (trackinfo && trackinfo.length > 0) {
      const firstTrackUrl = trackinfo[0].file && trackinfo[0].file['mp3-128'];
      if (firstTrackUrl) {
        console.log(`Downloading ${destName} from ${firstTrackUrl}`);
        await downloadFile(firstTrackUrl, `./public/catalog/${destName}`);
        console.log(`Downloaded ${destName} successfully.`);
      } else {
        console.log(`No mp3-128 found for ${destName}.`);
      }
    }
  } else {
    console.log(`No data-tralbum found for ${destName}.`);
  }
}

async function main() {
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/sampled-head-argent-rock-69-79', 'sampled_head_preview.mp3');
  await fetchAndDownload('https://remedymusicvlc.bandcamp.com/album/safary-beats', 'safary_beats_preview.mp3');
}

main();
