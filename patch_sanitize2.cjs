const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /await setDoc\(doc\(db, "clients", client\.id\), \{[\s\S]*?dados: processedClient\n\s*\}\);/m,
  'await setDoc(doc(db, "clients", client.id), sanitizeForFirestore({\n      id: client.id,\n      nomeCompleto: client.nomeCompleto,\n      cpf: formattedCpf,\n      dataCadastro: pgDate,\n      dados: processedClient\n    }));'
);

code = code.replace(
  /await setDoc\(doc\(db, "clients", id\), clientData\);/g,
  'await setDoc(doc(db, "clients", id), sanitizeForFirestore(clientData));'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts POST client and restore endpoints");
