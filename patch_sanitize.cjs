const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sanitizeFn = `
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = sanitizeForFirestore(obj[key]);
    }
  }
  return result;
}
`;

if (!code.includes("sanitizeForFirestore")) {
  code = code.replace('const app = express();', sanitizeFn + '\nconst app = express();');
  
  code = code.replace(
    /const updateData: any = \{ dados: processedClient \};/g,
    'const updateData: any = sanitizeForFirestore({ dados: processedClient });'
  );
  
  // Also fix the POST route
  code = code.replace(
    /await setDoc\(doc\(db, "clients", clientId\), \{\n\s*nomeCompleto: newClient\.nomeCompleto,\n\s*cpf: newClient\.cpf,\n\s*dados: newClient\.dados\n\s*\}\);/g,
    'await setDoc(doc(db, "clients", clientId), sanitizeForFirestore({ nomeCompleto: newClient.nomeCompleto, cpf: newClient.cpf, dados: newClient.dados }));'
  );

  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with sanitization");
} else {
  console.log("Already patched.");
}
