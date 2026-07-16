const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetView = `  if (view === "produtos_lista" || view === "client_login_produtos") {
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

const replView = `  if (view === "client_login_produtos") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
        <button
          onClick={() => setView("produtos")}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Área do Cliente
            </h2>
            <p className="text-slate-500">
              Acesse com seu número de telefone
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const phone = (e.currentTarget.elements.namedItem('telefone') as HTMLInputElement).value;
            if (!phone) {
              setClientLoginError("Por favor, insira seu telefone.");
              return;
            }
            // For now, mock successful login or show a toast
            toast.success("Login realizado com sucesso! Em breve, você terá acesso à área de produtos.");
            setView("produtos");
          }}>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 mb-2">
                Telefone / WhatsApp
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors outline-none"
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  let v = e.target.value.replace(/\\D/g, "");
                  if (v.length > 11) v = v.slice(0, 11);
                  if (v.length > 2) v = \`(\${v.slice(0, 2)}) \${v.slice(2)}\`;
                  if (v.length > 9) v = \`\${v.slice(0, 10)}-\${v.slice(10)}\`;
                  e.target.value = v;
                }}
              />
            </div>
            {clientLoginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {clientLoginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-yellow-500 text-slate-900 py-4 px-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Acessar minha conta
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "produtos_lista") {
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
            Lista de Produtos
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
