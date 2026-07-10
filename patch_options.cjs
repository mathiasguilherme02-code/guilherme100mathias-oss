const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<option value="mensal">Mensal<\/option><option value="abater">Abater<\/option>/g, 
'<option value="mensal">Mensal</option><option value="abater">Abater</option>');
                      
fs.writeFileSync('src/App.tsx', code);
