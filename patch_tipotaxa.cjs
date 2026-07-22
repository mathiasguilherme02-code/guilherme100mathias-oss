const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
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
                  </div>`;

const newBlock = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
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
                  )}`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched Tipo de Taxa visibility.");
} else {
  console.log("Block not found.");
}
