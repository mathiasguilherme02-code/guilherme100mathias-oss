const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const clients = JSON.parse(data);
    const client = clients.find(c => c.id !== 'admin-transactions' && (c.simulacoes || c.simulacao));
    if (!client) return console.log("No client found");
    
    // Attempt dummy PUT
    const putData = JSON.stringify(client);
    const putOptions = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/clients/${client.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer secret-admin-token-123'
      }
    };
    
    const putReq = http.request(putOptions, (putRes) => {
      let putResData = '';
      putRes.on('data', (chunk) => putResData += chunk);
      putRes.on('end', () => {
        console.log("Client PUT status:", putRes.statusCode);
        console.log("Client PUT response:", putResData);
      });
    });
    putReq.write(putData);
    putReq.end();
  });
});
req.end();
