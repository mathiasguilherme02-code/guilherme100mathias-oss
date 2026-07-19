const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lastCurly = code.lastIndexOf('  );\\n}');
if (lastCurly !== -1) {
  code = code.substring(0, lastCurly + 6) + '\\n';
  fs.writeFileSync('src/App.tsx', code);
}
