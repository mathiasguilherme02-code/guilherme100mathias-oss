const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/clients/admin-transactions',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const client = JSON.parse(data);
    let retiradas = client.retiradas || client.dados?.retiradas;
    if (!retiradas || retiradas.length === 0) return;
    
    const initialLen = retiradas.length;
    const idToRemove = retiradas[0].id;
    retiradas = retiradas.filter(t => t.id !== idToRemove);
    
    const updatedClient = { ...client, retiradas };
    if (updatedClient.dados) updatedClient.dados.retiradas = retiradas;
    
    const putData = JSON.stringify(updatedClient);
    const putOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/clients/admin-transactions',
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
        console.log("PUT status:", putRes.statusCode);
        console.log("PUT response:", putResData);
      });
    });
    putReq.write(putData);
    putReq.end();
  });
});

req.end();
