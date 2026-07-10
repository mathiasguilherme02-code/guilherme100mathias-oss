const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
/taxaJuros: prev.taxaJuros \|\| adminSettings.taxaJuros,/g,
'taxaJuros: prev.prazo === "abater" ? "0" : (prev.taxaJuros || adminSettings.taxaJuros),'
);

fs.writeFileSync('src/App.tsx', code);
