const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                                                {diasAtraso *
                                                  (parseFloat(
                                                    sim.taxaAtrasoDia,
                                                  ) || 1)}
                                                %`;

const replacementStr = `                                                {sim.prazo === "abater" ? 0 : diasAtraso * (parseFloat(sim.taxaAtrasoDia) || 1)}%`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', code);
