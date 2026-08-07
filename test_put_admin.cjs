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
    const client = JSON.parse(data);
    const initialLength = client.retiradas?.length || client.dados?.retiradas?.length || 0;
    console.log("Initial retiradas:", initialLength);
    
    if (initialLength > 0) {
      // Remove one
      let retiradas = client.retiradas || client.dados?.retiradas;
      const idToRemove = retiradas[0].id;
      retiradas = retiradas.filter(t => t.id !== idToRemove);
      
      const updatedClient = { ...client, retiradas };
      if (updatedClient.dados) {
        updatedClient.dados.retiradas = retiradas;
      }
      
      const putData = JSON.stringify(updatedClient);
      const putOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/clients/admin-transactions',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ADMIN_TOKEN_HERE', // I need the actual token
        }
      };
      console.log("Would PUT", putData.length, "bytes to", putOptions.path);
    }
  });
});

req.end();
