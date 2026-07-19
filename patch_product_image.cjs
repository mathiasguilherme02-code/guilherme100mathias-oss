const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const originalImageField = `                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem</label>
                        <input
                          type="text"
                          value={editingProduto.imagemUrl || ""}
                          onChange={e => setEditingProduto({ ...editingProduto, imagemUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>`;

const originalImageField2 = `                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem</label>
                        <input
                          type="text"
                          value={editingProduto.imagemUrl}
                          onChange={e => setEditingProduto({ ...editingProduto, imagemUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                      </div>`;

const newImageField = `                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do Produto</label>
                        <div className="flex flex-col gap-4">
                          {editingProduto.imagemUrl && (
                            <img src={editingProduto.imagemUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-slate-200" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingProduto({ ...editingProduto, imagemUrl: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                          />
                        </div>
                      </div>`;

if (code.includes(originalImageField2)) {
  code = code.replace(originalImageField2, newImageField);
} else if (code.includes(originalImageField)) {
  code = code.replace(originalImageField, newImageField);
}

fs.writeFileSync('src/App.tsx', code);
