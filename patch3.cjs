const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
`              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Taxa de Juros ao Mês (%)
                  </label>
                  <input
                    type="number"
                    value={adminSettings.taxaJuros}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        taxaJuros: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  />
                </div>`,
`              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Taxa
                  </label>
                  <select
                    value={adminSettings.tipoTaxa || "mensal"}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        tipoTaxa: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  >
                    <option value="diaria">Diária</option>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Taxa de Juros (%)
                    </label>
                    <span className="text-sm font-bold text-yellow-600">{adminSettings.taxaJuros}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={adminSettings.taxaJuros}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          taxaJuros: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                    <input
                      type="number"
                      value={adminSettings.taxaJuros}
                      onChange={(e) =>
                        setAdminSettings({
                          ...adminSettings,
                          taxaJuros: e.target.value,
                        })
                      }
                      className="w-20 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>`
);

code = code.replace(
`                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      Taxa de Juros ao Mês (%)
                                    </label>
                                    <input
                                      type="number"
                                      value={editSimData.prazo === "abater" ? 0 : editSimData.taxaJuros}
                                      disabled={editSimData.prazo === "abater"}
                                      onChange={(e) =>
                                        setEditSimData({
                                          ...editSimData,
                                          taxaJuros: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                  </div>`,
`                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      Tipo de Taxa
                                    </label>
                                    <select
                                      value={editSimData.tipoTaxa || adminSettings.tipoTaxa || "mensal"}
                                      disabled={editSimData.prazo === "abater"}
                                      onChange={(e) =>
                                        setEditSimData({
                                          ...editSimData,
                                          tipoTaxa: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    >
                                      <option value="diaria">Diária</option>
                                      <option value="semanal">Semanal</option>
                                      <option value="quinzenal">Quinzenal</option>
                                      <option value="mensal">Mensal</option>
                                    </select>
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="block text-sm font-medium text-slate-700">
                                        Taxa de Juros (%)
                                      </label>
                                      <span className="text-sm font-bold text-indigo-600">{editSimData.prazo === "abater" ? 0 : editSimData.taxaJuros}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={editSimData.prazo === "abater" ? 0 : editSimData.taxaJuros}
                                        disabled={editSimData.prazo === "abater"}
                                        onChange={(e) =>
                                          setEditSimData({
                                            ...editSimData,
                                            taxaJuros: e.target.value,
                                          })
                                        }
                                        className="w-full"
                                      />
                                      <input
                                        type="number"
                                        value={editSimData.prazo === "abater" ? 0 : editSimData.taxaJuros}
                                        disabled={editSimData.prazo === "abater"}
                                        onChange={(e) =>
                                          setEditSimData({
                                            ...editSimData,
                                            taxaJuros: e.target.value,
                                          })
                                        }
                                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                  </div>`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
