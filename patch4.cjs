const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
`                                      Taxa aplicada: {sim.taxaJuros}% ao mês
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                      Fórmula: Valor Solicitado + (Valor
                                      Solicitado * Taxa de Juros * (Dias Totais
                                      / 30))
                                    </p>`,
`                                      Taxa aplicada: {sim.taxaJuros}% ({sim.tipoTaxa || adminSettings.tipoTaxa || 'mensal'})
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                      Fórmula: Valor Solicitado + (Valor
                                      Solicitado * Taxa de Juros * (Dias Totais
                                      / Divisor do Tipo de Taxa))
                                    </p>`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
