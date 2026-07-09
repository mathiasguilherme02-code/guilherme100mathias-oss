const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const taxa = editSimData.prazo === "abater" \? 0 :\n\s*parseFloat\(simulacao.taxaJuros\)/, 'const taxa = simulacao.prazo === "abater" ? 0 :\n      parseFloat(simulacao.taxaJuros)');

code = code.replace(/const taxa = editSimData.prazo === "abater" \? 0 : parseFloat\(sim.taxaJuros\)/, 'const taxa = parseFloat(sim.taxaJuros)');

fs.writeFileSync('src/App.tsx', code);
