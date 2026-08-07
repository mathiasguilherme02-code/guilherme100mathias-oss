const http = require('http');

const data = JSON.stringify({ cpf: "12080822640" });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let resData = '';
  res.on('data', (chunk) => {
    resData += chunk;
  });
  res.on('end', () => {
    console.log(resData.substring(0, 500));
  });
});

req.write(data);
req.end();
