const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const produtoInterface = `
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  precoOferta?: string;
  imagemUrl?: string;
}
`;

const stateDeclarations = `
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<{produto: Produto, quantidade: number}[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const fetchProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);
`;

// Insert interface after initialFormData
const interfaceIndex = code.indexOf('const initialFormData = {');
if (interfaceIndex !== -1) {
  code = code.slice(0, interfaceIndex) + produtoInterface + '\n' + code.slice(interfaceIndex);
}

// Insert states after setAdminTab
const stateIndex = code.indexOf('const [cronogramaDate, setCronogramaDate] = useState(getLocalISODate());');
if (stateIndex !== -1) {
  code = code.slice(0, stateIndex) + stateDeclarations + '\n  ' + code.slice(stateIndex);
}

fs.writeFileSync('src/App.tsx', code);
