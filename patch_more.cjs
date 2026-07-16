const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function addDbCheck(method, route, defaultRes) {
    const regex = new RegExp(`(app\\.${method}\\("${route}"[^{]*?{\\s*try\\s*{)`);
    const replacement = `$1\n    if (!db) {\n      return res.status(404).json(${defaultRes});\n    }`;
    code = code.replace(regex, replacement);
}

addDbCheck('post', '/api/clients/login', '{ error: "Cliente não encontrado" }');

function addDbCheck2(method, route, defaultRes) {
    const regex = new RegExp(`(app\\.${method}\\("${route}"[^{]*?{\\s*try\\s*{)`);
    const replacement = `$1\n    if (!db) {\n      return res.json(${defaultRes});\n    }`;
    code = code.replace(regex, replacement);
}

addDbCheck2('put', '/api/settings', '{ success: true }');

fs.writeFileSync('server.ts', code);
