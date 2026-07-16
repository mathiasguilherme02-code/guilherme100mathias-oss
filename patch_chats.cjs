const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

function addDbCheck(method, route, defaultRes) {
    const regex = new RegExp(`(app\\.${method}\\("${route}"[^{]*?{\\s*try\\s*{)`);
    const replacement = `$1\n    if (!db) {\n      return res.json(${defaultRes});\n    }`;
    code = code.replace(regex, replacement);
}

addDbCheck('get', '/api/chat/:clientId', '[]');
addDbCheck('post', '/api/chat/:clientId', '{ success: true }');
addDbCheck('put', '/api/chat/:clientId/read', '{ success: true }');
addDbCheck('get', '/api/chats', '[]');
addDbCheck('delete', '/api/chat/:clientId/messages/:messageId', '{ success: true }');
addDbCheck('delete', '/api/chat/:clientId', '{ success: true }');
addDbCheck('post', '/api/chat/:clientId/restore', '{ success: true }');
addDbCheck('post', '/api/chat/:clientId/messages/:messageId/restore', '{ success: true }');

fs.writeFileSync('server.ts', code);
