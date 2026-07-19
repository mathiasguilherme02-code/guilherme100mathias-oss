const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace " \n " or just " \n " with "\n"
code = code.replace(/"\n"/g, '"\\\\n"'); // replace literal newline between quotes with "\n"

fs.writeFileSync('src/App.tsx', code);
