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
      console.log(`\n=== Found tracks for ${destName} ===`);
      trackinfo.forEach((t, idx) => console.log(`[Track ${idx+1}] ${t.title}`));
      
      const firstTrackUrl = trackinfo[0].file && trackinfo[0].file['mp3-128'];
      if (firstTrackUrl) {
        console.log(`Downloading ${destName} from ${firstTrackUrl}`);
        await downloadFile(firstTrackUrl, `./public/catalog/${destName}`);
        console.log(`Downloaded ${destName} successfully.`);
      } else {
        console.log(`No mp3-128 found for ${destName}.`);
      }
      
      // Save tracklist to a json file for easy reading
      fs.writeFileSync(`./public/catalog/${destName.replace('.mp3', '.json')}`, JSON.stringify(trackinfo.map(t => t.title), null, 2));
    }
  } else {
    console.log(`No data-tralbum found for ${destName}.`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node download_mp3.cjs <url> <destName.mp3>');
    process.exit(1);
  }
  await fetchAndDownload(args[0], args[1]);
}

main();
