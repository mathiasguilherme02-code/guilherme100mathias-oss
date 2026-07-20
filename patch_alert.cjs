const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `                            if (res.ok) {
                              setEditingProduto(null);
                              fetchProdutos();
                            }`;

const newCode = `                            if (res.ok) {
                              setEditingProduto(null);
                              fetchProdutos();
                            } else {
                              const errorData = await res.json().catch(() => ({}));
                              alert("Erro ao salvar produto: " + (errorData.error || res.statusText));
                            }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', code);
