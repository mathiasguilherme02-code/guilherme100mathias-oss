const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [adminTab, setAdminTab] = useState<',
  'const [adminTab, setAdminTab] = useState<\n    | "clientes"\n    | "cronograma"\n    | "fluxo_caixa"\n    | "mensagens"\n    | "produtos"\n  >("clientes");\n// '
);

code = code.replace(
  '    "clientes" | "cronograma" | "fluxo_caixa" | "mensagens"\n  >("clientes");',
  ''
);

fs.writeFileSync('src/App.tsx', code);
