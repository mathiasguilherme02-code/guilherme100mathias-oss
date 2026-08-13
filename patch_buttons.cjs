const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const buttonsToInsert = `
          <button
            onClick={() => setShowComoFuncionaEmprestimo(true)}
            className="flex items-center gap-2 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm text-sm font-semibold"
          >
            <Info size={16} />
            Como funciona empréstimo
          </button>
          <button
            onClick={() => setShowComoFuncionaProdutos(true)}
            className="flex items-center gap-2 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm text-sm font-semibold"
          >
            <Info size={16} />
            Como funciona produtos
          </button>
`;

code = code.replace(/(\s*)<a\s+href="https:\/\/wa\.me\/5531972323040"/g, (match, spaces) => {
  // adjust the indentation for the buttons based on the indentation of the <a> tag
  const adjustedButtons = buttonsToInsert.split('\n').map(line => line.startsWith('          ') ? spaces + line.substring(10) : line).join('\n');
  return adjustedButtons + match;
});

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx buttons");
