const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetView = `  const [view, setView] = useState<
    | "welcome"
    | "simulation"
    | "form"
    | "admin_login"
    | "admin"
    | "client_login"
    | "client_dashboard"
    | "produtos"
  >(() => {`;

const replView = `  const [view, setView] = useState<
    | "welcome"
    | "simulation"
    | "form"
    | "admin_login"
    | "admin"
    | "client_login"
    | "client_dashboard"
    | "produtos"
    | "produtos_lista"
    | "form_produtos"
    | "client_login_produtos"
  >(() => {`;

code = code.replace(targetView, replView);
fs.writeFileSync('src/App.tsx', code);
