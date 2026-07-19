const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsLines = code.split('} from "lucide-react";')[0];
const restOfCode = code.slice(importsLines.length + '} from "lucide-react";'.length);

const uniqueImports = Array.from(new Set(
  importsLines.split('\\n')
    .map(line => line.trim())
    .filter(line => line !== 'import {' && line !== '' && line.indexOf('import') === -1)
    .map(line => line.replace(',', ''))
));

// Remove 'ImageIcon' and 'Trash2' and 'Plus' as they are duplicates, but we want 'Image as ImageIcon'
const cleanedImports = uniqueImports.filter(imp => imp !== 'ImageIcon' && imp !== 'Trash2' && imp !== 'Plus' && imp !== 'Image as ImageIcon' && imp !== 'Minus' && imp !== 'ShoppingCart');

const finalImportsStr = 'import React, { useState, useEffect, useRef } from "react";\\nimport { Toaster, toast } from "sonner";\\nimport {\\n  ' + 
  [...cleanedImports, 'Trash2', 'Plus', 'Minus', 'ShoppingCart', 'Image as ImageIcon'].join(',\\n  ') + 
  ',\\n} from "lucide-react";';

fs.writeFileSync('src/App.tsx', finalImportsStr + restOfCode);
