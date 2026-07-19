const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabHtml = `            <button
              onClick={() => {
                setAdminTab("produtos");
                setSelectedClient(null);
              }}
              className={\`pb-3 px-4 text-sm font-medium transition-colors \${adminTab === "produtos" ? "border-b-2 border-yellow-500 text-yellow-600" : "text-slate-500 hover:text-slate-700"}\`}
            >
              Produtos
            </button>`;

code = code.replace('            <div className="ml-auto flex items-center mb-3">', tabHtml + '\\n            <div className="ml-auto flex items-center mb-3">');
fs.writeFileSync('src/App.tsx', code);
