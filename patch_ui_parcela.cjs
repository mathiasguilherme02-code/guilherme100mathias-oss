const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const uiCode = `
                                  {(sim.prazo === "abater") && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                      {addingParcela === simIndex ? (
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                          <h5 className="font-semibold text-slate-700 mb-2">
                                            Adicionar Nova Parcela
                                          </h5>
                                          <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Data de Vencimento
                                              </label>
                                              <input
                                                type="date"
                                                value={newParcela.dataVencimento}
                                                onChange={(e) =>
                                                  setNewParcela({
                                                    ...newParcela,
                                                    dataVencimento: e.target.value,
                                                  })
                                                }
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-yellow-500 outline-none"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Valor (R$)
                                              </label>
                                              <input
                                                type="number"
                                                step="0.01"
                                                value={newParcela.valor}
                                                onChange={(e) =>
                                                  setNewParcela({
                                                    ...newParcela,
                                                    valor: e.target.value,
                                                  })
                                                }
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-yellow-500 outline-none"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <button
                                              onClick={() => {
                                                setAddingParcela(null);
                                                setNewParcela({ dataVencimento: "", valor: "" });
                                              }}
                                              className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-200 rounded"
                                            >
                                              Cancelar
                                            </button>
                                            <button
                                              onClick={() => handleAddParcela(simIndex)}
                                              className="px-3 py-1 text-sm bg-yellow-500 text-white hover:bg-yellow-600 rounded"
                                            >
                                              Salvar Parcela
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setAddingParcela(simIndex)}
                                          className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                                        >
                                          <Plus size={16} />
                                          Adicionar Parcela (Restante)
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-200 print:hidden">
                                  <h4 className="font-semibold text-slate-700 mb-2">
                                    Anotações do Empréstimo
`;

code = code.replace(/                                <\/div>\n                                <div className="mt-6 pt-6 border-t border-slate-200 print:hidden">\n                                  <h4 className="font-semibold text-slate-700 mb-2">\n                                    Anotações do Empréstimo/g, uiCode);

fs.writeFileSync('src/App.tsx', code);
