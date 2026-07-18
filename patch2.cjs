const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/adminSettings\.tipoTaxa \|\| "diaria"/g, 'adminSettings.tipoTaxa || "mensal"');
code = code.replace(/prev\.tipoTaxa \|\| adminSettings\.tipoTaxa \|\| "diaria"/g, 'prev.tipoTaxa || adminSettings.tipoTaxa || "mensal"');
code = code.replace(/sim\.tipoTaxa \|\| adminSettings\.tipoTaxa \|\| "diaria"/g, 'sim.tipoTaxa || adminSettings.tipoTaxa || "mensal"');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
