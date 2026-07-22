const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldButtons = `<div className="flex flex-col sm:flex-row gap-4">
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
                </div>`;

const newButtons = `<div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                       if (!formaPagamentoProduto) {
                         toast.error("Por favor, selecione uma forma de pagamento antes de continuar.");
                         return;
                       }
                       setView("client_login_produtos");
                    }}
                    className="flex-1 py-4 bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 text-lg"
                  >
                    <User size={20} />
                    Já sou cliente
                  </button>
                  <button
                    onClick={() => {
                       if (!formaPagamentoProduto) {
                         toast.error("Por favor, selecione uma forma de pagamento antes de continuar.");
                         return;
                       }
                       setView("form_produtos");
                    }}
                    className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 text-lg"
                  >
                    <UserPlus size={20} />
                    Quero me Cadastrar
                  </button>
                </div>`;

code = code.replace(oldButtons, newButtons);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched carrinho buttons");
