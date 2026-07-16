const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFetch = `  const fetchAddress = async (`;
const replFetch = `  const fetchProdutoAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\\D/g, "");
    if (cleanCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const response = await fetch(\`https://viacep.com.br/ws/\${cleanCep}/json/\`);
      const data = await response.json();
      if (!data.erro) {
        setProdutoFormData(prev => ({
          ...prev,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || ""
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const fetchAddress = async (`;

code = code.replace(targetFetch, replFetch);
fs.writeFileSync('src/App.tsx', code);
