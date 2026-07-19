const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const adminProdutosHtml = `
          {adminTab === "produtos" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Gerenciar Produtos</h2>
                <button
                  onClick={() => setEditingProduto({ nome: "", descricao: "", preco: "", precoOferta: "", imagemUrl: "" })}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Novo Produto
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex flex-col">
                      {p.imagemUrl && <img src={p.imagemUrl} alt={p.nome} className="w-full h-40 object-cover rounded-md mb-4" />}
                      <h3 className="font-bold text-lg mb-2">{p.nome}</h3>
                      <p className="text-slate-600 text-sm mb-4 flex-grow">{p.descricao}</p>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          {p.precoOferta ? (
                            <>
                              <span className="line-through text-slate-400 text-sm mr-2">{formatCurrency(parseFloat(p.preco))}</span>
                              <span className="font-bold text-green-600">{formatCurrency(parseFloat(p.precoOferta))}</span>
                            </>
                          ) : (
                            <span className="font-bold text-slate-800">{formatCurrency(parseFloat(p.preco))}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => setEditingProduto(p)}
                          className="flex-1 border border-slate-300 rounded py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Deseja realmente excluir este produto?")) {
                              try {
                                const res = await fetch(\`/api/produtos/\${p.id}\`, {
                                  method: "DELETE",
                                  headers: { Authorization: \`Bearer \${adminToken}\` }
                                });
                                if (res.ok) fetchProdutos();
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          className="flex-1 border border-red-200 text-red-600 rounded py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {editingProduto && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-800">{editingProduto.id ? "Editar Produto" : "Novo Produto"}</h2>
                      <button onClick={() => setEditingProduto(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={editingProduto.nome}
                          onChange={e => setEditingProduto({ ...editingProduto, nome: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <textarea
                          value={editingProduto.descricao}
                          onChange={e => setEditingProduto({ ...editingProduto, descricao: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Preço Normal</label>
                          <input
                            type="number"
                            value={editingProduto.preco}
                            onChange={e => setEditingProduto({ ...editingProduto, preco: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Preço Oferta (Opcional)</label>
                          <input
                            type="number"
                            value={editingProduto.precoOferta}
                            onChange={e => setEditingProduto({ ...editingProduto, precoOferta: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem</label>
                        <input
                          type="text"
                          value={editingProduto.imagemUrl}
                          onChange={e => setEditingProduto({ ...editingProduto, imagemUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                      <button onClick={() => setEditingProduto(null)} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Cancelar</button>
                      <button
                        onClick={async () => {
                          try {
                            const method = editingProduto.id ? "PUT" : "POST";
                            const url = editingProduto.id ? \`/api/produtos/\${editingProduto.id}\` : "/api/produtos";
                            const res = await fetch(url, {
                              method,
                              headers: { "Content-Type": "application/json", Authorization: \`Bearer \${adminToken}\` },
                              body: JSON.stringify(editingProduto)
                            });
                            if (res.ok) {
                              setEditingProduto(null);
                              fetchProdutos();
                            }
                          } catch(e) {
                            console.error(e);
                          }
                        }}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
`;

if (!code.includes('adminTab === "produtos" && (')) {
  const insertionPoint = code.indexOf('{adminTab === "mensagens" && (');
  if (insertionPoint !== -1) {
    code = code.slice(0, insertionPoint) + adminProdutosHtml + code.slice(insertionPoint);
  }
}

fs.writeFileSync('src/App.tsx', code);
