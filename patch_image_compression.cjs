const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldUpload = `                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 800 * 1024) {
                                  alert("A imagem não pode ter mais de 800KB");
                                  e.target.value = "";
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingProduto({ ...editingProduto, imagemUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}`;

const newUpload = `                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let width = img.width;
                                    let height = img.height;
                                    const maxDim = 800;
                                    
                                    if (width > maxDim || height > maxDim) {
                                      if (width > height) {
                                        height = Math.round((height * maxDim) / width);
                                        width = maxDim;
                                      } else {
                                        width = Math.round((width * maxDim) / height);
                                        height = maxDim;
                                      }
                                    }
                                    
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, width, height);
                                      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                      setEditingProduto({ ...editingProduto, imagemUrl: compressedDataUrl });
                                    } else {
                                      setEditingProduto({ ...editingProduto, imagemUrl: reader.result as string });
                                    }
                                  };
                                  img.src = reader.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}`;

code = code.replace(oldUpload, newUpload);
fs.writeFileSync('src/App.tsx', code);
