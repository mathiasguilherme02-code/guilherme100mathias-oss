const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">[\s\S]*?<label className="flex items-center gap-2 cursor-pointer mb-2">[\s\S]*?(?:<\/label>[\s\S]*?){1,3}Juros congelados[\s\S]*?<\/label>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

// Wait, that might be too complex of a regex.
// Let's just find the exact block from `<label className="flex items-center gap-2 cursor-pointer mb-2">`
// to the end of the Juros Congelados `</div>` if it exists.
