const https = require('https');

const term = encodeURIComponent('Dj Taktel');
const url = `https://itunes.apple.com/search?term=${term}&entity=song`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Found ${json.resultCount} results:`);
      json.results.forEach((r, i) => {
        console.log(`[${i+1}] Album: ${r.collectionName} | Song: ${r.trackName} | Preview: ${r.previewUrl}`);
      });
    } catch(e) {
      console.error(e);
    }
  });
});
