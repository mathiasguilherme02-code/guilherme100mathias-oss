const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGet = `app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json(mockProdutos);
    }
    const q = query(collection(db, "produtos"));
    const querySnapshot = await getDocs(q);
      
    const produtos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    res.json(produtos);
  } catch (error) {
    console.error("Error fetching produtos:", error);
    res.status(500).json({ error: "Falha ao buscar produtos" });
  }
});`;

const newGet = `app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json(mockProdutos);
    }
    const querySnapshot = await db.collection("produtos").get();
    const produtos = querySnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    res.json(produtos);
  } catch (error) {
    console.error("Error fetching produtos:", error);
    res.status(500).json({ error: "Falha ao buscar produtos" });
  }
});`;

const oldPost = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    const produto = req.body;
    
    if (!db) {
      const p = { id: Date.now().toString(), ...produto };
      mockProdutos.push(p); syncData();
      return res.json(p);
    }
    
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const fileRef = ref(storage, \`produtos/\${Date.now()}_imagem\`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image:", e);
        console.error("Data length:", produto.imagemUrl.length, "Starts with:", produto.imagemUrl.substring(0, 50));
      }
    }
    const docRef = await addDoc(collection(db, "produtos"), produto);
    res.json({ id: docRef.id, ...produto });
  } catch (error) {
    console.error("Error adding produto:", error);
    res.status(500).json({ error: "Falha ao adicionar produto" });
  }
});`;

const newPost = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    const produto = req.body;
    if (!db) {
      const p = { id: Date.now().toString(), ...produto };
      mockProdutos.push(p); syncData();
      return res.json(p);
    }
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const base64Str = produto.imagemUrl.split(';base64,').pop();
        if (base64Str) {
            const buffer = Buffer.from(base64Str, 'base64');
            const file = storage.file(\`produtos/\${Date.now()}_imagem\`);
            await file.save(buffer, { public: true });
            produto.imagemUrl = \`https://storage.googleapis.com/\${storage.name}/\${file.name}\`;
        }
      } catch(e) {
          console.error(e);
      }
    }
    const docRef = await db.collection("produtos").add(produto);
    res.json({ id: docRef.id, ...produto });
  } catch (error) {
    console.error("Error adding produto:", error);
    res.status(500).json({ error: "Falha ao adicionar produto" });
  }
});`;

const oldPut = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const produto = req.body;
    
    if (!db) {
      const idx = mockProdutos.findIndex(p => p.id === id);
      if (idx !== -1) mockProdutos[idx] = { ...mockProdutos[idx], ...produto, id }; syncData();
      return res.json({ id, ...produto });
    }
    
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const fileRef = ref(storage, \`produtos/\${Date.now()}_imagem\`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image:", e);
        console.error("Data length:", produto.imagemUrl.length, "Starts with:", produto.imagemUrl.substring(0, 50));
      }
    }
    await updateDoc(doc(db, "produtos", id), produto);
    res.json({ id, ...produto });
  } catch (error) {
    console.error("Error updating produto:", error);
    res.status(500).json({ error: "Falha ao atualizar produto" });
  }
});`;

const newPut = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const produto = req.body;
    if (!db) {
      const idx = mockProdutos.findIndex(p => p.id === id);
      if (idx !== -1) mockProdutos[idx] = { ...mockProdutos[idx], ...produto, id }; syncData();
      return res.json({ id, ...produto });
    }
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const base64Str = produto.imagemUrl.split(';base64,').pop();
        if (base64Str) {
            const buffer = Buffer.from(base64Str, 'base64');
            const file = storage.file(\`produtos/\${Date.now()}_imagem\`);
            await file.save(buffer, { public: true });
            produto.imagemUrl = \`https://storage.googleapis.com/\${storage.name}/\${file.name}\`;
        }
      } catch(e) { console.error(e); }
    }
    await db.collection("produtos").doc(id).update(produto);
    res.json({ id, ...produto });
  } catch (error) {
    console.error("Error updating produto:", error);
    res.status(500).json({ error: "Falha ao atualizar produto" });
  }
});`;

const oldDelete = `app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!db) {
      mockProdutos = mockProdutos.filter(p => p.id !== id); syncData();
      return res.json({ success: true });
    }
    await deleteDoc(doc(db, "produtos", id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting produto:", error);
    res.status(500).json({ error: "Falha ao excluir produto" });
  }
});`;

const newDelete = `app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) {
      mockProdutos = mockProdutos.filter(p => p.id !== id); syncData();
      return res.json({ success: true });
    }
    await db.collection("produtos").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting produto:", error);
    res.status(500).json({ error: "Falha ao excluir produto" });
  }
});`;

code = code.replace(oldGet, newGet).replace(oldPost, newPost).replace(oldPut, newPut).replace(oldDelete, newDelete);
fs.writeFileSync('server.ts', code);
console.log("Patched server API endpoints for produtos");
