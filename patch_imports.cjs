const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('} from "lucide-react";', '  ShoppingCart,\n  Minus,\n  Trash2,\n  ImageIcon,\n} from "lucide-react";');

fs.writeFileSync('src/App.tsx', code);
