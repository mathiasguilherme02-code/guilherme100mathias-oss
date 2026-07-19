const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('}); Server-Sent', '});\n// Server-Sent');
fs.writeFileSync('server.ts', code);
