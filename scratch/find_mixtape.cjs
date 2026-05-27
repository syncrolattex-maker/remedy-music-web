const http = require('https');

const url = 'https://itunes.apple.com/search?term=Dj+Taktel+Arrugas+en+el+Chandal&entity=musicTrack';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Results count:', result.resultCount);
      result.results.forEach((track, idx) => {
        console.log(`[Track ${idx + 1}] Title: "${track.trackName}" | Album: "${track.collectionName}" | Preview: ${track.previewUrl}`);
      });
    } catch (e) {
      console.error(e);
    }
  });
});
