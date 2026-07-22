const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {adminToken && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de Taxa
                    </label>
                    <select
                      value={simulacao.tipoTaxa || adminSettings.tipoTaxa || "mensal"}
                      disabled={simulacao.prazo === "abater"}
                      onChange={(e) =>
                        setSimulacao({
                          ...simulacao,
                          tipoTaxa: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all bg-white"
                    >
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="mensal">Mensal</option>
                    </select>
                  </div>
                  )}
                  {adminToken && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Taxa de Juros (%)
                      </label>
                      <span className="text-sm font-bold text-yellow-600">
                        {simulacao.prazo === "abater" ? 0 : (simulacao.taxaJuros || adminSettings.taxaJuros)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={simulacao.prazo === "abater" ? 0 : (simulacao.taxaJuros || adminSettings.taxaJuros)}
                        disabled={simulacao.prazo === "abater"}
                        onChange={(e) =>
                          setSimulacao({
                            ...simulacao,
                            taxaJuros: e.target.value,
                          })
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <input
                        type="number"
                        value={simulacao.prazo === "abater" ? 0 : (simulacao.taxaJuros || adminSettings.taxaJuros)}
                        disabled={simulacao.prazo === "abater"}
                        onChange={(e) =>
                          setSimulacao({
                            ...simulacao,
                            taxaJuros: e.target.value,
                          })
                        }
                        className="w-20 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  )}
                </div>`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, '');
  fs.writeFileSync('src/App.tsx', code);
  console.log("Removed form block.");
} else {
  console.log("Block not found.");
}
