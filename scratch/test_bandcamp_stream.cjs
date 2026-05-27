const https = require('https');

const fullUrl = 'https://t4.bcbits.com/stream/6709b62adf1005708f044de904f01fb7/mp3-128/277718156?p=0&ts=1779951327&t=68d641c2651cbadda2989162ea325e6f8487920b&token=1779951327_6be00983e32ce023758d998aaa241eb9a0c0bd6b';
const cleanUrl = 'https://t4.bcbits.com/stream/6709b62adf1005708f044de904f01fb7/mp3-128/277718156';

function testUrl(url, label) {
  https.get(url, (res) => {
    console.log(`${label} - Status Code:`, res.statusCode);
    console.log(`${label} - Content Type:`, res.headers['content-type']);
  }).on('error', (err) => {
    console.error(`${label} - Error:`, err.message);
  });
}

testUrl(fullUrl, 'Full URL (with token)');
testUrl(cleanUrl, 'Clean URL (no token)');
