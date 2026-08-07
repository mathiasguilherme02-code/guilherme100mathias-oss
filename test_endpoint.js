const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer secret-admin-token-123'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
