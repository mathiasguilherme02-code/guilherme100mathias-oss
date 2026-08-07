const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients/admin-transactions',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const d = JSON.parse(data);
    console.log("Got:", d.id, "retiradas length:", d.dados?.retiradas?.length || d.retiradas?.length);
  });
});

req.end();
