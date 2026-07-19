const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button[^>]*onClick=\{\(\) => setShowHowItWorksModal\(true\)\}[^>]*>[\s\S]*?<Info size=\{16\} \/>[\s\S]*?Como funciona[\s\S]*?<\/button>/g;

code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
