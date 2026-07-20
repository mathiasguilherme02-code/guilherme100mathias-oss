const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldUpload = `                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();`;

const newUpload = `                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert("A imagem não pode ter mais de 2MB");
                                  e.target.value = "";
                                  return;
                                }
                                const reader = new FileReader();`;

code = code.replace(oldUpload, newUpload);

fs.writeFileSync('src/App.tsx', code);
