const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('  ImageIcon,\n} from "lucide-react";', '  Image as ImageIcon,\n  Plus,\n} from "lucide-react";');

fs.writeFileSync('src/App.tsx', code);
