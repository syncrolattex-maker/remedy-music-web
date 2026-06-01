const { execSync } = require('child_process');

const url = 'https://remedymusicvlc.bandcamp.com/album/tempus-fugit';
const html = execSync(`curl.exe -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -s "${url}"`).toString();

const match = html.match(/data-tralbum="([^"]+)"/);
if (match) {
  let decoded = match[1].replace(/&quot;/g, '"');
  const json = JSON.parse(decoded);
  const trackinfo = json.trackinfo;
  if (trackinfo) {
    trackinfo.forEach((track, i) => {
      console.log(`Track ${i+1}: "${track.title}" | MP3: ${track.file ? track.file['mp3-128'] : 'NULL'}`);
    });
  } else {
    console.log('No trackinfo found');
  }
} else {
  console.log('No data-tralbum found');
}
