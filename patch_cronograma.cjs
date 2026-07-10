const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCronograma = `                simIndex: sIdx,
                parcelaIndex: pIdx,
                taxaAtrasoDia: s.taxaAtrasoDia,
              };`;

const replCronograma = `                simIndex: sIdx,
                parcelaIndex: pIdx,
                taxaAtrasoDia: s.taxaAtrasoDia,
                prazo: s.prazo,
              };`;

code = code.replace(targetCronograma, replCronograma);
fs.writeFileSync('src/App.tsx', code);
