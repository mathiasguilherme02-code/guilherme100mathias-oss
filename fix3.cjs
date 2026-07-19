const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/Server-Sent Events for Real-time Updates/g, '// Server-Sent Events for Real-time Updates');
fs.writeFileSync('server.ts', code);
