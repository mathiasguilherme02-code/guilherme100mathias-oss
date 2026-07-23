const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                          } catch(e) {
                            console.error(e);
                          }`;
const replacement = `                          } catch(e: any) {
                            console.error(e);
                            alert("Erro de conexão ao salvar produto: " + (e.message || "Erro desconhecido"));
                          }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched catch");
