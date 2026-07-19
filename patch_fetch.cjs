const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fetchStr = `
  const fetchProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
      }
    } catch (err) {
      console.error("Error fetching produtos:", err);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);
`;

if (!code.includes('const fetchProdutos')) {
  // Find a useEffect to place it before
  const fetchClientsIndex = code.indexOf('const fetchClients = async');
  if (fetchClientsIndex !== -1) {
    code = code.slice(0, fetchClientsIndex) + fetchStr + '\n' + code.slice(fetchClientsIndex);
  }
}

fs.writeFileSync('src/App.tsx', code);
