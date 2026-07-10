const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
/const taxaDia =\s*parseFloat\(sim.taxaAtrasoDia\) \|\|\s*parseFloat\(adminSettings.taxaAtrasoDia\) \|\|\s*1;/g,
'const taxaDia = sim.prazo === "abater" ? 0 : parseFloat(sim.taxaAtrasoDia) || parseFloat(adminSettings.taxaAtrasoDia) || 1;'
);

code = code.replace(
/const taxaDia =\s*parseFloat\(sim.taxaAtrasoDia\) \|\| 1;/g,
'const taxaDia = sim.prazo === "abater" ? 0 : parseFloat(sim.taxaAtrasoDia) || 1;'
);

fs.writeFileSync('src/App.tsx', code);
