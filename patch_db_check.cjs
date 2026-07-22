const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `app.get("/api/sysinfo", (req, res) => { res.json({ hasDb: !!db, firebaseConfig: !!process.env.FIREBASE_SERVICE_ACCOUNT }); });\n\n// Get All Clients (Protected)`;

code = code.replace('// Get All Clients (Protected)', newRoute);
fs.writeFileSync('server.ts', code);
