const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [formData, setFormData] = useState(initialFormData);`;
const replState = `  const [formData, setFormData] = useState(initialFormData);
  const [produtoFormData, setProdutoFormData] = useState({
    nomeCompleto: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });`;

code = code.replace(targetState, replState);
fs.writeFileSync('src/App.tsx', code);
