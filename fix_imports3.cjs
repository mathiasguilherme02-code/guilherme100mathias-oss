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
].join(',\n  ');

const fullImports = `import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import {
  ${importsList}
} from "lucide-react";`;

// just replace the first line up to the export interface Produto {
const exportInterfaceIndex = code.indexOf("export interface Produto {");
if (exportInterfaceIndex !== -1) {
  code = fullImports + '\n\n' + code.slice(exportInterfaceIndex);
}

fs.writeFileSync('src/App.tsx', code);
