const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex flex-col">`;

const newCode = `                {produtos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Nenhum produto cadastrado no momento. Clique em "Novo Produto" para começar.
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex flex-col">`;

code = code.replace(oldCode, newCode);

const oldCodeClose = `                    </div>
                  ))}
                </div>
              </div>`;

const newCodeClose = `                    </div>
                  ))}
                </div>
                )}
              </div>`;

code = code.replace(oldCodeClose, newCodeClose);

fs.writeFileSync('src/App.tsx', code);
