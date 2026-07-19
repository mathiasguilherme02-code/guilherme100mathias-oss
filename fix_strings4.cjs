const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '"Link da Área do Cliente copiado para a área de transferência!\\n\\nEnvie este link para os seus clientes."',
  '"Link da Área do Cliente copiado para a área de transferência!\\\\n\\\\nEnvie este link para os seus clientes."'
);

fs.writeFileSync('src/App.tsx', code);
