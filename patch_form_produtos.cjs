const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetView = `  if (view === "produtos_lista" || view === "form_produtos" || view === "client_login_produtos") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4 border-b-4 border-yellow-500">
          <button
            onClick={() => setView("produtos")}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {view === "produtos_lista" ? "Lista de Produtos" : view === "form_produtos" ? "Cadastro - Produtos" : "Login - Produtos"}
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Página em Construção</h2>
          <p className="text-slate-500 max-w-md">
            Esta seção será desenvolvida na próxima etapa. Estamos preparando tudo para oferecer a melhor experiência.
          </p>
        </div>
      </div>
    );
  }`;

const replView = `  if (view === "form_produtos") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
        <button
          onClick={() => setView("produtos")}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
          <div className="bg-white px-8 py-8 border-b-4 border-yellow-500 flex flex-col items-center text-center">
            <div className="mb-4 w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <UserPlus size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Cadastro de Interesse em Produtos
            </h1>
            <p className="text-slate-500 text-sm max-w-md">
              Preencha o formulário abaixo para registrar seu interesse em nossos produtos.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Cadastro realizado com sucesso! Em breve entraremos em contato.");
              setView("produtos");
            }}
            className="p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={produtoFormData.nomeCompleto}
                onChange={(e) => setProdutoFormData({ ...produtoFormData, nomeCompleto: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={produtoFormData.telefone}
                onChange={(e) => {
                  let v = e.target.value.replace(/\\D/g, "");
                  if (v.length > 11) v = v.slice(0, 11);
                  if (v.length > 2) v = \`(\${v.slice(0, 2)}) \${v.slice(2)}\`;
                  if (v.length > 9) v = \`\${v.slice(0, 10)}-\${v.slice(10)}\`;
                  setProdutoFormData({ ...produtoFormData, telefone: v });
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                Endereço
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CEP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={produtoFormData.cep}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\\D/g, "");
                      if (v.length > 8) v = v.slice(0, 8);
                      if (v.length > 5) v = \`\${v.slice(0, 5)}-\${v.slice(5)}\`;
                      setProdutoFormData({ ...produtoFormData, cep: v });
                    }}
                    onBlur={(e) => fetchProdutoAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="00000-000"
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Endereço <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={produtoFormData.endereco}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, endereco: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={produtoFormData.numero}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, numero: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="Nº"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={produtoFormData.complemento}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, complemento: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="Apto, Sala, Casa 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bairro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={produtoFormData.bairro}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, bairro: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={produtoFormData.cidade}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado (UF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={produtoFormData.estado}
                    onChange={(e) => setProdutoFormData({ ...produtoFormData, estado: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none uppercase"
                    placeholder="UF"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-yellow-500 text-slate-900 py-4 px-6 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Concluir Cadastro
                <CheckCircle2 size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "produtos_lista" || view === "client_login_produtos") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4 border-b-4 border-yellow-500">
          <button
            onClick={() => setView("produtos")}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {view === "produtos_lista" ? "Lista de Produtos" : "Login - Produtos"}
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Página em Construção</h2>
          <p className="text-slate-500 max-w-md">
            Esta seção será desenvolvida na próxima etapa. Estamos preparando tudo para oferecer a melhor experiência.
          </p>
        </div>
      </div>
    );
  }`;

code = code.replace(targetView, replView);
fs.writeFileSync('src/App.tsx', code);
