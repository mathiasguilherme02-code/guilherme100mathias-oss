const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients/3ce5236e-f05f-4dcf-b064-efa75120fe0a',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer Gustavo@01',
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

const req = http.request(options, (res) => {
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
