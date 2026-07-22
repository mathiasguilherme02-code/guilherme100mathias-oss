const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The original map is: (s.parcelas || []).map((p: any, pIdx: number) => {
// We can change it to: (Array.isArray(s.parcelas) ? s.parcelas : []).map((p: any, pIdx: number) => {
code = code.replace(/\(s\.parcelas \|\| \[\]\)\.map\(/g, '(Array.isArray(s.parcelas) ? s.parcelas : []).map(');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched parcelas array check.");
