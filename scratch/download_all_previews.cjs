const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function downloadFile(url, dest) {
  // Replace HTML entities in query string
  const cleanUrl = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  
  return new Promise((resolve, reject) => {
    https.get(cleanUrl, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`Following redirect for ${dest}: ${response.headers.location}`);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download. Status code: ${response.statusCode} for URL: ${cleanUrl}`));
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size === 0) {
            fs.unlink(dest, () => reject(new Error('Downloaded file is 0 bytes')));
          } else {
            resolve();
          }
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

function trimMp3(filePath) {
  try {
    const stats = fs.statSync(filePath);
    console.log(`Downloaded size: ${stats.size} bytes`);
    
    // 30 seconds of 128kbps CBR MP3 is roughly 480,000 bytes.
    const targetSize = 480000;
    
    if (stats.size > targetSize) {
      const buffer = fs.readFileSync(filePath);
      const sliced = buffer.slice(0, targetSize);
      fs.writeFileSync(filePath, sliced);
      console.log(`Trimmed ${filePath} successfully to 30 seconds.`);
    } else {
      console.log(`${filePath} is already under 30 seconds (${stats.size} bytes).`);
    }
  } catch (err) {
    console.error(`Error trimming ${filePath}:`, err.message);
  }
}

async function fetchAndDownload(url, destName) {
  console.log(`\n==================================================`);
  console.log(`Processing: ${destName}`);
  console.log(`Album URL: ${url}`);
  console.log(`==================================================`);
  
  try {
    // Run curl to bypass Cloudflare/Bot protection
    const html = execSync(`curl.exe -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s "${url}"`).toString();
    
    const match = html.match(/data-tralbum="([^"]+)"/);
    if (match) {
      let decoded = match[1].replace(/&quot;/g, '"');
      const json = JSON.parse(decoded);
      const trackinfo = json.trackinfo;
      
      if (trackinfo && trackinfo.length > 0) {
        // Find the first track with a file property
        const trackWithFile = trackinfo.find(t => t.file && t.file['mp3-128']);
        if (trackWithFile) {
          const firstTrackUrl = trackWithFile.file['mp3-128'];
          console.log(`Found track: "${trackWithFile.title}"`);
          console.log(`Source stream: ${firstTrackUrl}`);
          
          const destPath = `./public/catalog/${destName}`;
          await downloadFile(firstTrackUrl, destPath);
          trimMp3(destPath);
        } else {
          console.log(`Could not find any tracks with 'mp3-128' preview URL.`);
        }
      } else {
        console.log(`No trackinfo array found.`);
      }
    } else {
      console.log(`Could not find data-tralbum on the page.`);
    }
  } catch (err) {
    console.error(`Error processing ${destName}:`, err.message);
  }
}

async function main() {
  const items = [
    // Tapes
    { url: 'https://remedymusicvlc.bandcamp.com/album/control-remoto', name: 'control_remoto_preview.mp3' },
    { url: 'https://remedymusicvlc.bandcamp.com/album/arrugas-en-el-ch-ndal', name: 'arrugas_en_el_chandal_preview.mp3' },
    { url: 'https://remedymusicvlc.bandcamp.com/album/geometria-variable', name: 'geometria_variable_preview.mp3' },
    
    // Beats
    { url: 'https://remedymusicvlc.bandcamp.com/album/safary-beats', name: 'safary_beats_preview.mp3' },
    { url: 'https://remedymusicvlc.bandcamp.com/album/tempus-fugit', name: 'tempus_fugit_preview.mp3' },
    { url: 'https://remedymusicvlc.bandcamp.com/album/sampled-head-argent-rock-69-79', name: 'sampled_head_preview.mp3' },
    { url: 'https://remedymusicvlc.bandcamp.com/album/wall-of-shadows-2', name: 'wall_of_shadows_preview.mp3' }
  ];

  for (const item of items) {
    await fetchAndDownload(item.url, item.name);
  }
  
  console.log('\nAll done!');
}

main();
