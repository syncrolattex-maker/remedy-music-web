const fs = require('fs');
const https = require('https');

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

function parseAndDownload(filename, destName) {
  try {
    const data = fs.readFileSync(filename, 'utf-8');
    const match = data.match(/data-tralbum="([^"]+)"/);
    if (match) {
      let decoded = match[1].replace(/&quot;/g, '"');
      const json = JSON.parse(decoded);
      const trackinfo = json.trackinfo;
      
      if (trackinfo && trackinfo.length > 0) {
        const firstTrackUrl = trackinfo[0].file && trackinfo[0].file['mp3-128'];
        if (firstTrackUrl) {
          console.log(`Downloading ${destName} from ${firstTrackUrl}`);
          downloadFile(firstTrackUrl, `./public/catalog/${destName}`)
            .then(() => console.log(`Downloaded ${destName} successfully.`))
            .catch(e => console.error(`Error downloading ${destName}:`, e));
        }
      }
    }
  } catch (e) {
    console.error(`Error with ${filename}:`, e.message);
  }
}

parseAndDownload('sampled_head.html', 'sampled_head_preview.mp3');
parseAndDownload('safary_beats.html', 'safary_beats_preview.mp3');
