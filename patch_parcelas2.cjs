const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/simulacao\.parcelas\.length/g, '(Array.isArray(simulacao.parcelas) ? simulacao.parcelas.length : 0)');
code = code.replace(/sim\.parcelas\?/g, '(Array.isArray(sim.parcelas) ? sim.parcelas : [])?');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched other parcelas checks.");
