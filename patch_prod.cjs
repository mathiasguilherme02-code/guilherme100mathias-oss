const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetView = `  if (view === "produtos") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <button
            onClick={() => setView("welcome")}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            Produtos - GM-Empreendimentos
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Em breve</h2>
          <p className="text-slate-500 max-w-md">
            A seção de produtos está em desenvolvimento e estará disponível em breve.
          </p>
        </div>
      </div>
    );
  }`;

const replView = `  if (view === "produtos") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
        <div className="absolute top-4 left-4 flex gap-3">
          <button
            onClick={() => setView("welcome")}
            className="flex items-center gap-2 bg-white text-slate-800 border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
            title="Voltar"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-white text-slate-800 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-3">
          <button
            onClick={() => setShowHowItWorksModal(true)}
            className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold"
          >
            <Info size={16} />
            Como funciona
          </button>
          <a
            href="https://wa.me/5531972323040"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold"
          >
            <Phone size={16} />
            Fale conosco
          </a>
          <button
            onClick={() => {
              setView("form_produtos");
            }}
            className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold"
          >
            <UserPlus size={16} />
            Cadastro de Clientes
          </button>
          <button
            onClick={() => setView("client_login_produtos")}
            className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold"
          >
            <User size={16} />
            Já sou cliente
          </button>
          <button
            onClick={() => setView("admin_login")}
            className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-sm font-semibold"
          >
            <LayoutDashboard size={16} />
            Acesso Admin
          </button>
        </div>
        <div className="max-w-[95%] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
          <div className="bg-white px-8 py-10 border-b-4 border-yellow-500 flex flex-col items-center text-center">
            <div className="mb-4 flex flex-col items-center justify-center">
              <div
                className="text-6xl font-black text-yellow-500 tracking-tighter leading-none flex items-center"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                <span>G</span>
                <span className="-ml-1">M</span>
              </div>
              <div
                className="text-2xl font-light text-yellow-500 tracking-widest mt-1"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                Produtos
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 mt-4">
              Selecione abaixo qual produto gostaria de saber mais informações:
            </h1>
          </div>
          <div className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[300px]">
            <button
              onClick={() => setView("produtos_lista")}
              className="px-10 py-5 bg-yellow-500 text-slate-900 text-2xl font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition-all hover:scale-105 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "produtos_lista" || view === "form_produtos" || view === "client_login_produtos") {
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

code = code.replace(targetView, replView);
fs.writeFileSync('src/App.tsx', code);
