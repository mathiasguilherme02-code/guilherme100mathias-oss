const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const typeStr = `
export interface Produto {
  id?: string;
  nome: string;
  descricao: string;
  preco: string;
  precoOferta: string;
  imagemUrl: string;
}
`;

if (!code.includes('export interface Produto')) {
  code = code.replace('export interface Client {', typeStr + '\nexport interface Client {');
}

const stateStr = `
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<{produto: Produto, quantidade: number}[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
`;

if (!code.includes('const [produtos, setProdutos]')) {
  code = code.replace('const [clients, setClients] = useState<Client[]>([]);', 'const [clients, setClients] = useState<Client[]>([]);\n' + stateStr);
}

fs.writeFileSync('src/App.tsx', code);
