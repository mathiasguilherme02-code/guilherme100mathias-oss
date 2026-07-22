const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(process.cwd(), 'data.json');

if (fs.existsSync(dataFilePath)) {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  
  if (data.mockClients.length === 0) {
    data.mockClients = [
      {
        id: "c1",
        dataCadastro: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: "Ativo",
        nome: "João da Silva",
        cpf: "111.111.111-11",
        telefone: "(11) 99999-9999",
        produto: "Empréstimo Pessoal",
        valorSolicitado: "5000",
        simulacao: {
          valorEmprestimo: 5000,
          prazo: "mensal",
          parcelas: 12,
          taxaJuros: 5,
          valorParcela: 450,
          total: 5400
        },
        historicoStatus: [
          { status: "Aguardando", data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
          { status: "Ativo", data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }
        ],
        mensagens: []
      },
      {
        id: "c2",
        dataCadastro: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        status: "Aguardando",
        nome: "Maria Oliveira",
        cpf: "222.222.222-22",
        telefone: "(11) 88888-8888",
        produto: "Empréstimo Consignado",
        valorSolicitado: "10000",
        simulacao: {
          valorEmprestimo: 10000,
          prazo: "mensal",
          parcelas: 24,
          taxaJuros: 2,
          valorParcela: 550,
          total: 13200
        },
        historicoStatus: [
          { status: "Aguardando", data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
        ],
        mensagens: []
      }
    ];
    
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log("Mock clients added.");
  } else {
    console.log("Clients already exist.");
  }
}
