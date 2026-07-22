const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(process.cwd(), 'data.json');

if (fs.existsSync(dataFilePath)) {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  
  data.mockClients = data.mockClients.map(c => {
    if (c.simulacao) {
       if (typeof c.simulacao.parcelas === 'number') {
           c.simulacao.quantidade = c.simulacao.parcelas.toString();
           c.simulacao.parcelas = [];
       }
    }
    if (c.simulacoes) {
        c.simulacoes = c.simulacoes.map(s => {
           if (typeof s.parcelas === 'number') {
               s.quantidade = s.parcelas.toString();
               s.parcelas = [];
           }
           return s;
        });
    }
    return c;
  });
  
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  console.log("Mock clients fixed.");
}
