const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                  <div>
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
                  </div>`;

const newBlock = `                  {adminToken && (
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
                  )}`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched taxa de juros visibility.");
} else {
  console.log("Block not found.");
}
