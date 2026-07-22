const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldItem = `<div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{item.produto.nome}</h3>
                        <p className="text-yellow-600 font-bold">{formatCurrency(precoReal)}</p>
                      </div>`;

const newItem = `<div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{item.produto.nome}</h3>
                        <p className="text-slate-500 text-sm">{formatCurrency(precoReal)} unid.</p>
                        {item.quantidade > 1 && (
                           <p className="text-yellow-600 font-bold mt-1">Subtotal: {formatCurrency(precoReal * item.quantidade)}</p>
                        )}
                      </div>`;

code = code.replace(oldItem, newItem);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched subtotal");
