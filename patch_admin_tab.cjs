const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabHtml = `
            <button
              onClick={() => {
                setAdminTab("produtos");
                setSelectedClient(null);
              }}
              className={\`pb-3 px-4 text-sm font-medium transition-colors \${adminTab === "produtos" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-slate-500 hover:text-slate-700"}\`}
            >
              Produtos
            </button>
`;
if (!code.includes('adminTab === "produtos"')) {
  const adminTabAnchor = code.indexOf('adminTab === "mensagens"');
  if (adminTabAnchor !== -1) {
    const parentDivStart = code.lastIndexOf('<button', adminTabAnchor);
    code = code.slice(0, parentDivStart) + tabHtml + code.slice(parentDivStart);
  }
}

fs.writeFileSync('src/App.tsx', code);
