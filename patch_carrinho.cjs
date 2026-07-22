const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const carrinhoBlock = `              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-600 font-medium text-lg">Total do Pedido:</span>
                  <span className="text-3xl font-black text-slate-800">{formatCurrency(totalCarrinho)}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">`;

const newCarrinhoBlock = `              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="mb-6">
                  <label className="block text-slate-700 font-bold mb-2">Forma de Pagamento:</label>
                  <select 
                    value={formaPagamentoProduto} 
                    onChange={(e) => setFormaPagamentoProduto(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="">Selecione uma forma de pagamento</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">Pix</option>
                    <option value="debito">Cartão de Débito</option>
                    <option value="credito">Cartão de Crédito</option>
                  </select>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-600 font-medium text-lg">Total do Pedido:</span>
                  <span className="text-3xl font-black text-slate-800">{formatCurrency(totalCarrinho)}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">`;

code = code.replace(carrinhoBlock, newCarrinhoBlock);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched carrinho view");
