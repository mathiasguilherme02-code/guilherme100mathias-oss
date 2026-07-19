const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsList = [
  'User', 'MapPin', 'FileText', 'Users', 'Camera', 'UploadCloud', 'CheckCircle2',
  'LayoutDashboard', 'ArrowLeft', 'ArrowRight', 'Eye', 'Download', 'Maximize',
  'Minimize', 'Phone', 'Info', 'X', 'UserPlus', 'Calculator', 'Edit2', 'Save',
  'Trash2', 'Calendar', 'TrendingUp', 'Plus', 'AlertCircle', 'LogOut',
  'ArrowUpRight', 'ArrowDownRight', 'AlertTriangle', 'Wallet', 'PiggyBank',
  'CreditCard', 'Activity', 'Clock', 'Search', 'Landmark', 'RefreshCw', 'Check',
  'CheckCheck', 'MessageCircle', 'Send', 'MessageSquare', 'Printer', 'ShoppingCart',
  'Minus', 'Image as ImageIcon'
].join(',\\n  ');

const importsStr = 'import {\\n  ' + importsList + '\\n} from "lucide-react";';

code = code.replace(/import \{[\s\S]*?\} from "lucide-react";/, importsStr);

fs.writeFileSync('src/App.tsx', code);
