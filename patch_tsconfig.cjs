const fs = require('fs');
let code = fs.readFileSync('tsconfig.json', 'utf8');

code = code.replace(
/  \}/,
\`  \},
  "exclude": ["dist", "node_modules"]\`
);

fs.writeFileSync('tsconfig.json', code);
