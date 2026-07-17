const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove require = createRequire
code = code.replace(/import \{ createRequire \} from "module";\nconst require = createRequire\(import\.meta\.url\);\n/, '');

// Remove __dirname / __filename definitions because esbuild to cjs provides them natively or they break. Wait! In dev with tsx (which treats as esm because "type":"module" in package.json), we might still need __dirname.
// Actually, since tsx runs as ESM, if we use __dirname without defining it, it will fail in dev!
