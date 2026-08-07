const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<label className="flex items-center gap-2 cursor-pointer mb-2">[\s\S]*?Data de Congelamento:[\s\S]*?<\/div>\s*?\)\}/;
const match = code.match(regex);

if (match) {
  console.log("Matched!");
} else {
  console.log("Not matched!");
}
