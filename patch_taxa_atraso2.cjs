const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
/const taxaDia =\s*parseFloat\(p.taxaAtrasoDia\) \|\|\s*parseFloat\(\s*adminSettings.taxaAtrasoDia,\s*\) \|\|\s*1;/g,
'const taxaDia = sim.prazo === "abater" ? 0 : parseFloat(p.taxaAtrasoDia) || parseFloat(adminSettings.taxaAtrasoDia) || 1;'
);

fs.writeFileSync('src/App.tsx', code);
