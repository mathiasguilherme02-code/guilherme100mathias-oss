const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/import \{ createRequire \} from "module";\nconst require = createRequire\(import\.meta\.url\);\n/, '');
code = code.replace(/const __filename = fileURLToPath\(import\.meta\.url\);\nconst process\.cwd\(\) = path\.dirname\(__filename\);\n/, '');
code = code.replace(/import \{ fileURLToPath \} from "url";\n/, '');

fs.writeFileSync('server.ts', code);
