const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetEdit = `                                      Taxa de Juros ao Mês (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={editSimData.taxaJuros}
                                      onChange={(e) =>`;

const replEdit = `                                      Taxa de Juros ao Mês (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={editSimData.prazo === "abater" ? 0 : editSimData.taxaJuros}
                                      disabled={editSimData.prazo === "abater"}
                                      onChange={(e) =>`;

code = code.replace(targetEdit, replEdit);
fs.writeFileSync('src/App.tsx', code);
