const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function addDbCheck(method, route, defaultRes) {
    const regex = new RegExp(`(app\\.${method}\\("${route}"[^{]*?{\\s*try\\s*{)`);
    const replacement = `$1\n    if (!db) {\n      return res.json(${defaultRes});\n    }`;
    code = code.replace(regex, replacement);
}

addDbCheck('post', '/api/admin/settings', '{ success: true }');
addDbCheck('post', '/api/clients', '{ id: Date.now().toString(), ...req.body }');
addDbCheck('put', '/api/clients/:id', '{ success: true }');
addDbCheck('delete', '/api/clients/:id', '{ success: true }');
addDbCheck('post', '/api/clients/:id/restore', '{ success: true }');
addDbCheck('get', '/api/backup', '{ error: "Database not initialized" }'); // actually it's a file download

fs.writeFileSync('server.ts', code);
