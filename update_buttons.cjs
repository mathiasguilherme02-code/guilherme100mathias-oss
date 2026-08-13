const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexEmprestimo = /(onClick=\{\(\) => setShowComoFuncionaEmprestimo\(true\)\}\s+className=")[^"]+(")/g;
code = code.replace(regexEmprestimo, '$1flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold$2');

const regexProdutos = /(onClick=\{\(\) => setShowComoFuncionaProdutos\(true\)\}\s+className=")[^"]+(")/g;
code = code.replace(regexProdutos, '$1flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold$2');

fs.writeFileSync('src/App.tsx', code);
console.log("Buttons updated.");
