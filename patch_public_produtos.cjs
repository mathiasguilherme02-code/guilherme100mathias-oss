const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const publicProdutosHtml = `
  if (view === "produtos_lista") {
    const totalCarrinho = carrinho.reduce((acc, item) => acc + (parseFloat(item.produto.precoOferta || item.produto.preco) * item.quantidade), 0);
    const numItensCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4 border-b-4 border-yellow-500 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("produtos")}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              Produtos
            </h1>
          </div>
          {numItensCarrinho > 0 && (
            <button
              onClick={() => setView("carrinho")}
              className="relative p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {numItensCarrinho}
              </span>
            </button>
          )}
        </div>
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map(p => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden cursor-pointer flex flex-col"
                onClick={() => {
                  setSelectedProduto(p);
                  setView("produto_detalhes");
                }}
              >
                {p.imagemUrl ? (
                  <img src={p.imagemUrl} alt={p.nome} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{p.nome}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.descricao}</p>
                  <div className="mt-auto">
                    {p.precoOferta ? (
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-sm line-through">{formatCurrency(parseFloat(p.preco))}</span>
                        <span className="text-green-600 font-bold text-lg">{formatCurrency(parseFloat(p.precoOferta))}</span>
                      </div>
                    ) : (
                      <span className="text-slate-800 font-bold text-lg">{formatCurrency(parseFloat(p.preco))}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {produtos.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Nenhum produto cadastrado no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "produto_detalhes" && selectedProduto) {
    const preco = parseFloat(selectedProduto.preco);
    const precoOferta = selectedProduto.precoOferta ? parseFloat(selectedProduto.precoOferta) : null;
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4 border-b-4 border-yellow-500">
          <button
            onClick={() => setView("produtos_lista")}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            Detalhes do Produto
          </h1>
        </div>
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2">
              {selectedProduto.imagemUrl ? (
                <img src={selectedProduto.imagemUrl} alt={selectedProduto.nome} className="w-full h-full object-cover min-h-[300px]" />
              ) : (
                <div className="w-full h-full min-h-[300px] bg-slate-200 flex items-center justify-center text-slate-400">
                  <ImageIcon size={64} />
                </div>
              )}
            </div>
            <div className="p-8 md:w-1/2 flex flex-col">
              <h2 className="text-3xl font-black text-slate-800 mb-4">{selectedProduto.nome}</h2>
              <p className="text-slate-600 mb-6 text-lg">{selectedProduto.descricao}</p>
              
              <div className="mb-8">
                {precoOferta ? (
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-lg line-through">De: {formatCurrency(preco)}</span>
                    <span className="text-green-600 font-bold text-4xl">Por: {formatCurrency(precoOferta)}</span>
                  </div>
                ) : (
                  <span className="text-slate-800 font-bold text-4xl">{formatCurrency(preco)}</span>
                )}
              </div>
              
              <div className="mt-auto space-y-4">
                <button
                  onClick={() => {
                    const existingItem = carrinho.find(i => i.produto.id === selectedProduto.id);
                    if (existingItem) {
                      setCarrinho(carrinho.map(i => i.produto.id === selectedProduto.id ? { ...i, quantidade: i.quantidade + 1 } : i));
                    } else {
                      setCarrinho([...carrinho, { produto: selectedProduto, quantidade: 1 }]);
                    }
                    toast.success("Produto adicionado ao carrinho!");
                  }}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 shadow-lg"
                >
                  <ShoppingCart size={20} />
                  Adicionar ao Carrinho
                </button>
                
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                       setView("client_login_produtos");
                    }}
                    className="flex-1 py-3 bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    Já sou cliente
                  </button>
                  <button
                    onClick={() => {
                       setView("form_produtos");
                    }}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    Cadastro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "carrinho") {
    const totalCarrinho = carrinho.reduce((acc, item) => acc + (parseFloat(item.produto.precoOferta || item.produto.preco) * item.quantidade), 0);
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4 border-b-4 border-yellow-500">
          <button
            onClick={() => setView("produtos_lista")}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={24} />
            Meu Carrinho
          </h1>
        </div>
        <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
          {carrinho.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <ShoppingCart size={64} className="text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Seu carrinho está vazio</h2>
              <p className="text-slate-500 mb-8">Navegue pelos nossos produtos e adicione itens ao carrinho.</p>
              <button
                onClick={() => setView("produtos_lista")}
                className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold rounded-xl hover:bg-yellow-600 transition-colors shadow-md"
              >
                Voltar aos Produtos
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {carrinho.map((item, index) => {
                  const precoReal = parseFloat(item.produto.precoOferta || item.produto.preco);
                  return (
                    <li key={index} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        {item.produto.imagemUrl ? (
                          <img src={item.produto.imagemUrl} alt={item.produto.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{item.produto.nome}</h3>
                        <p className="text-yellow-600 font-bold">{formatCurrency(precoReal)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (item.quantidade > 1) {
                              setCarrinho(carrinho.map((c, i) => i === index ? { ...c, quantidade: c.quantidade - 1 } : c));
                            } else {
                              setCarrinho(carrinho.filter((c, i) => i !== index));
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-slate-800 w-4 text-center">{item.quantidade}</span>
                        <button
                          onClick={() => {
                            setCarrinho(carrinho.map((c, i) => i === index ? { ...c, quantidade: c.quantidade + 1 } : c));
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCarrinho(carrinho.filter((c, i) => i !== index));
                            toast.info("Produto removido do carrinho");
                          }}
                          className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors ml-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-600 font-medium text-lg">Total do Pedido:</span>
                  <span className="text-3xl font-black text-slate-800">{formatCurrency(totalCarrinho)}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                       setView("client_login_produtos");
                    }}
                    className="flex-1 py-4 bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 text-lg"
                  >
                    <User size={20} />
                    Já sou cliente
                  </button>
                  <button
                    onClick={() => {
                       setView("form_produtos");
                    }}
                    className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 text-lg"
                  >
                    <UserPlus size={20} />
                    Quero me Cadastrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
`;

const startIndex = code.indexOf('if (view === "produtos_lista") {');
if (startIndex !== -1) {
  const nextViewIndex = code.indexOf('if (view === "client_login") {', startIndex);
  if (nextViewIndex !== -1) {
    code = code.slice(0, startIndex) + publicProdutosHtml + '\n' + code.slice(nextViewIndex);
  }
}

fs.writeFileSync('src/App.tsx', code);
