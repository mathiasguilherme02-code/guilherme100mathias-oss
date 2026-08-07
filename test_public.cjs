const https = require('https');

const options = {
  hostname: 'ais-dev-iuaewkhwf2i2wi4bd7n74o-6135474589.us-east1.run.app',
  path: '/api/clients',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer Gustavo@01',
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let bytes = 0;
  res.on('data', (chunk) => {
    bytes += chunk.length;
  });
  res.on('end', () => {
    console.log(`Received ${bytes} bytes`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
