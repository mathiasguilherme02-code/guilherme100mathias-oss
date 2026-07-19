const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/transferência!\n\nEnvie/g, 'transferência!\\n\\nEnvie');

fs.writeFileSync('src/App.tsx', code);
