const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const declarations = `let db: any;
let storage: any;
let mockProdutos: any[] = [
  { id: "mock1", nome: "Empréstimo Pessoal", descricao: "Crédito rápido e fácil com taxas competitivas para suas necessidades do dia a dia.", preco: "1000", precoOferta: "950", imagemUrl: "" },
  { id: "mock2", nome: "Empréstimo Consignado", descricao: "A melhor taxa do mercado, com desconto direto na folha de pagamento.", preco: "5000", precoOferta: "4500", imagemUrl: "" },
  { id: "mock3", nome: "Antecipação FGTS", descricao: "Antecipe suas parcelas do saque-aniversário do FGTS de forma rápida e segura.", preco: "2000", imagemUrl: "" },
  { id: "mock4", nome: "Crédito com Garantia de Veículo", descricao: "Use seu carro ou moto como garantia para conseguir taxas menores e valores maiores.", preco: "10000", imagemUrl: "" },
  { id: "mock5", nome: "Crédito com Garantia de Imóvel", descricao: "Use seu imóvel como garantia e consiga as melhores condições do mercado.", preco: "50000", precoOferta: "48000", imagemUrl: "" },
  { id: "mock6", nome: "Financiamento de Veículos", descricao: "Financiamento rápido para você comprar seu carro novo ou seminovo.", preco: "30000", imagemUrl: "" },
  { id: "mock7", nome: "Refinanciamento de Veículo", descricao: "Refinancie seu veículo e consiga dinheiro rápido com as melhores taxas.", preco: "15000", imagemUrl: "" },
  { id: "mock8", nome: "Cartão de Crédito Consignado", descricao: "Cartão de crédito sem anuidade com desconto direto na folha.", preco: "0", imagemUrl: "" },
  { id: "mock9", nome: "Consórcio de Automóveis", descricao: "Planeje a compra do seu carro sem pagar juros através de consórcios parceiros.", preco: "40000", imagemUrl: "" },
  { id: "mock10", nome: "Consórcio de Imóveis", descricao: "A forma mais econômica de planejar a compra da sua casa própria.", preco: "150000", imagemUrl: "" }
];
let mockClients: any[] = [];`;

const newDeclarations = `let db: any;
let storage: any;

const dataFilePath = path.join(process.cwd(), 'data.json');
const loadData = () => {
  if (fs.existsSync(dataFilePath)) {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  }
  return {
    mockProdutos: [
      { id: "mock1", nome: "Empréstimo Pessoal", descricao: "Crédito rápido e fácil com taxas competitivas para suas necessidades do dia a dia.", preco: "1000", precoOferta: "950", imagemUrl: "" },
      { id: "mock2", nome: "Empréstimo Consignado", descricao: "A melhor taxa do mercado, com desconto direto na folha de pagamento.", preco: "5000", precoOferta: "4500", imagemUrl: "" },
      { id: "mock3", nome: "Antecipação FGTS", descricao: "Antecipe suas parcelas do saque-aniversário do FGTS de forma rápida e segura.", preco: "2000", imagemUrl: "" },
      { id: "mock4", nome: "Crédito com Garantia de Veículo", descricao: "Use seu carro ou moto como garantia para conseguir taxas menores e valores maiores.", preco: "10000", imagemUrl: "" },
      { id: "mock5", nome: "Crédito com Garantia de Imóvel", descricao: "Use seu imóvel como garantia e consiga as melhores condições do mercado.", preco: "50000", precoOferta: "48000", imagemUrl: "" },
      { id: "mock6", nome: "Financiamento de Veículos", descricao: "Financiamento rápido para você comprar seu carro novo ou seminovo.", preco: "30000", imagemUrl: "" },
      { id: "mock7", nome: "Refinanciamento de Veículo", descricao: "Refinancie seu veículo e consiga dinheiro rápido com as melhores taxas.", preco: "15000", imagemUrl: "" },
      { id: "mock8", nome: "Cartão de Crédito Consignado", descricao: "Cartão de crédito sem anuidade com desconto direto na folha.", preco: "0", imagemUrl: "" },
      { id: "mock9", nome: "Consórcio de Automóveis", descricao: "Planeje a compra do seu carro sem pagar juros através de consórcios parceiros.", preco: "40000", imagemUrl: "" },
      { id: "mock10", nome: "Consórcio de Imóveis", descricao: "A forma mais econômica de planejar a compra da sua casa própria.", preco: "150000", imagemUrl: "" }
    ],
    mockClients: []
  };
};

const saveData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

let appData = loadData();
let mockProdutos = appData.mockProdutos;
let mockClients = appData.mockClients;

const syncData = () => {
  saveData({ mockProdutos, mockClients });
};
`;

code = code.replace(declarations, newDeclarations);

// Replace occurrences where mockProdutos or mockClients are mutated to call syncData()
code = code.replace(/mockProdutos\.push\(p\);/g, 'mockProdutos.push(p); syncData();');
code = code.replace(/mockProdutos\[idx\] = \{ \.\.\.mockProdutos\[idx\], \.\.\.produto, id \};/g, 'mockProdutos[idx] = { ...mockProdutos[idx], ...produto, id }; syncData();');
code = code.replace(/mockProdutos = mockProdutos\.filter\(p => p\.id !== id\);/g, 'mockProdutos = mockProdutos.filter(p => p.id !== id); syncData();');

code = code.replace(/mockClients\.push\(client\);/g, 'mockClients.push(client); syncData();');
code = code.replace(/mockClients\[idx\] = \{ \.\.\.mockClients\[idx\], \.\.\.req\.body, id: req\.params\.id \};/g, 'mockClients[idx] = { ...mockClients[idx], ...req.body, id: req.params.id }; syncData();');
code = code.replace(/mockClients = mockClients\.filter\(c => c\.id !== req\.params\.id\);/g, 'mockClients = mockClients.filter(c => c.id !== req.params.id); syncData();');

// check for mockClients mutation in post client logic
code = code.replace(/mockClients\.push\(\{ id: Date\.now\(\)\.toString\(\), \.\.\.req\.body \}\);/g, 'mockClients.push({ id: Date.now().toString(), ...req.body }); syncData();');

fs.writeFileSync('server.ts', code);
