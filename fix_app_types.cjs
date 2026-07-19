const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('| "client_login_produtos"', '| "client_login_produtos"\n    | "produto_detalhes"\n    | "carrinho"');
fs.writeFileSync('src/App.tsx', code);
