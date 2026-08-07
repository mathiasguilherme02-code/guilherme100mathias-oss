const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const selectClientFn = `
  const handleSelectClient = async (client: any) => {
    setSelectedClient(client);
    if (adminToken) {
      try {
        const res = await fetch(\`/api/clients/\${client.id}\`, {
          headers: { Authorization: \`Bearer \${adminToken}\` }
        });
        if (res.ok) {
          const fullClient = await res.json();
          setSelectedClient(fullClient);
        }
      } catch (e) {
        console.error("Error fetching full client details:", e);
      }
    }
  };
`;

code = code.replace(
  /const \[selectedClient, setSelectedClient\] = useState<any \| null>\(null\);/,
  `const [selectedClient, setSelectedClient] = useState<any | null>(null);\n${selectClientFn}`
);

code = code.replace(/onClick=\{\(\) => setSelectedClient\(client\)\}/g, 'onClick={() => handleSelectClient(client)}');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
