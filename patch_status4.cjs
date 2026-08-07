const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const chunk = fs.readFileSync('/tmp/to_replace.tsx', 'utf8');

if (code.includes(chunk)) {
  const replacement = chunk.replace(/<label className="flex items-center gap-2 cursor-pointer mb-2">[\s\S]*border-blue-500 bg-white"[\s\n]*\/>[\s\n]*<\/div>[\s\n]*\)\}/m, `                                          <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-slate-700">
                                              Status da Parcela:
                                            </label>
                                            <select
                                              value={p.paga ? "pago" : p.jurosCongelados ? "juros_congelados" : "pendente"}
                                              onChange={async (e) => {
                                                const newVal = e.target.value;
                                                if (!selectedClient) return;
                                                try {
                                                  const res = await fetch(\`/api/clients/\${selectedClient.id}\`, { headers: { Authorization: \`Bearer \${adminToken}\` } });
                                                  if (!res.ok) throw new Error("Failed to fetch latest client data");
                                                  const latestClient = await res.json();
                                                  const updatedSimulacoes = [...(latestClient.simulacoes || (latestClient.simulacao ? [latestClient.simulacao] : []))];
                                                  const novasParcelas = [...updatedSimulacoes[simIndex].parcelas];
                                                  
                                                  const isNowPaid = newVal === "pago";
                                                  const isNowCongelado = newVal === "juros_congelados";
                                                  
                                                  let computedDataPagamento = null;
                                                  if (isNowPaid) {
                                                    const todayStr = getLocalISODateTime().split("T")[0];
                                                    const vencimentoStr = (p.dataVencimento || "").split("T")[0];
                                                    if (vencimentoStr && new Date(todayStr + "T00:00:00") > new Date(vencimentoStr + "T00:00:00")) {
                                                      computedDataPagamento = p.dataVencimento; // acionado em data atrasada -> vencimento
                                                    } else {
                                                      computedDataPagamento = getLocalISODateTime(); // antecipado ou em dia -> hoje
                                                    }
                                                  }
                                                  
                                                  novasParcelas[i] = {
                                                    ...novasParcelas[i],
                                                    paga: isNowPaid,
                                                    status: isNowPaid ? "pago" : "pendente",
                                                    dataPagamento: computedDataPagamento,
                                                    jurosCongelados: isNowCongelado,
                                                    dataCongelamento: isNowCongelado ? (novasParcelas[i].dataCongelamento || getLocalISODateTime().split("T")[0]) : null
                                                  };
                                                  
                                                  if (isNowPaid && isVencida) {
                                                    novasParcelas[i].valor = valorAtualizado;
                                                  }
                                                  
                                                  updatedSimulacoes[simIndex] = { ...updatedSimulacoes[simIndex], parcelas: novasParcelas };
                                                  const updatedClient = { ...latestClient, simulacoes: updatedSimulacoes };
                                                  const success = await updateClientWithUndo(updatedClient, \`Atualizar Status para \${newVal}\`);
                                                  
                                                  if (success) {
                                                    setClients((prev) => prev.map((c) => c.id === latestClient.id ? updatedClient : c));
                                                    setSelectedClient(updatedClient);
                                                  } else {
                                                    throw new Error("Failed to update");
                                                  }
                                                } catch (error) {
                                                  console.error("Error toggling payment:", error);
                                                  toast.error("Erro ao atualizar status da parcela");
                                                }
                                              }}
                                              className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white text-sm"
                                            >
                                              <option value="pendente">Pendente</option>
                                              <option value="juros_congelados">Juros Congelados</option>
                                              <option value="pago">Pagamento (Pago)</option>
                                            </select>
                                          </div>
                                          
                                          {p.paga && (
                                            <div className="mt-2 text-sm bg-emerald-50 p-2 rounded border border-emerald-100">
                                              <label className="block text-emerald-800 font-medium mb-1">
                                                Data de Pagamento:
                                              </label>
                                              <input
                                                type="date"
                                                value={p.dataPagamento ? p.dataPagamento.split("T")[0] : ""}
                                                onChange={async (e) => {
                                                  const newDate = e.target.value;
                                                  if (!selectedClient) return;
                                                  try {
                                                    const res = await fetch(\`/api/clients/\${selectedClient.id}\`, { headers: { Authorization: \`Bearer \${adminToken}\` } });
                                                    if (!res.ok) throw new Error("Failed to fetch latest client data");
                                                    const latestClient = await res.json();
                                                    const updatedSimulacoes = [...(latestClient.simulacoes || (latestClient.simulacao ? [latestClient.simulacao] : []))];
                                                    const novasParcelas = [...updatedSimulacoes[simIndex].parcelas];
                                                    novasParcelas[i] = { ...novasParcelas[i], dataPagamento: newDate ? newDate + "T00:00:00.000Z" : null };
                                                    updatedSimulacoes[simIndex] = { ...updatedSimulacoes[simIndex], parcelas: novasParcelas };
                                                    const updatedClient = { ...latestClient, simulacoes: updatedSimulacoes };
                                                    const success = await updateClientWithUndo(updatedClient, "Atualizar Data de Pagamento");
                                                    if (success) {
                                                      setClients((prev) => prev.map((c) => c.id === latestClient.id ? updatedClient : c));
                                                      setSelectedClient(updatedClient);
                                                    } else {
                                                      throw new Error("Failed to update");
                                                    }
                                                  } catch (error) {
                                                    console.error("Error updating data pagamento:", error);
                                                    toast.error("Erro ao atualizar data de pagamento");
                                                  }
                                                }}
                                                className="w-full px-2 py-1 border border-emerald-200 rounded text-slate-700 focus:outline-none focus:border-emerald-500 bg-white"
                                              />
                                            </div>
                                          )}
                                          
                                          {!p.paga && p.jurosCongelados && (
                                              <div className="mt-2 text-sm bg-blue-50 p-2 rounded border border-blue-100">
                                                <label className="block text-blue-800 font-medium mb-1">
                                                  Data de Congelamento:
                                                </label>
                                                <input
                                                  type="date"
                                                  value={p.dataCongelamento || ""}
                                                  onChange={async (e) => {
                                                    const newDate = e.target.value;
                                                    if (!selectedClient) return;
                                                    try {
                                                      const res = await fetch(\`/api/clients/\${selectedClient.id}\`, { headers: { Authorization: \`Bearer \${adminToken}\` } });
                                                      if (!res.ok) throw new Error("Failed to fetch latest client data");
                                                      const latestClient = await res.json();
                                                      const updatedSimulacoes = [...(latestClient.simulacoes || (latestClient.simulacao ? [latestClient.simulacao] : []))];
                                                      const novasParcelas = [...updatedSimulacoes[simIndex].parcelas];
                                                      novasParcelas[i] = { ...novasParcelas[i], dataCongelamento: newDate };
                                                      updatedSimulacoes[simIndex] = { ...updatedSimulacoes[simIndex], parcelas: novasParcelas };
                                                      const updatedClient = { ...latestClient, simulacoes: updatedSimulacoes };
                                                      const success = await updateClientWithUndo(updatedClient, "Atualizar Data de Congelamento");
                                                      if (success) {
                                                        setClients((prev) => prev.map((c) => c.id === latestClient.id ? updatedClient : c));
                                                        setSelectedClient(updatedClient);
                                                      } else {
                                                        throw new Error("Failed to update");
                                                      }
                                                    } catch (error) {
                                                      console.error("Error updating data congelamento:", error);
                                                      toast.error("Erro ao atualizar data de congelamento");
                                                    }
                                                  }}
                                                  className="w-full px-2 py-1 border border-blue-200 rounded text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                                                />
                                              </div>
                                          )}`);
                                          
  code = code.replace(chunk, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced using chunk replace!");
} else {
  console.log("Chunk not found!");
}
