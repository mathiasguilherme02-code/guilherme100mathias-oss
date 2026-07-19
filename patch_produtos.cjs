const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Insert after the settings API or backup API
const addProdutosAPI = `

// --- PRODUTOS API ---

app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }
    const q = query(collection(db, "produtos"));
    const querySnapshot = await getDocs(q);
      
    const produtos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    res.json(produtos);
  } catch (error) {
    console.error("Error fetching produtos:", error);
    res.status(500).json({ error: "Falha ao buscar produtos" });
  }
});

app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const produto = req.body;
    const docRef = await addDoc(collection(db, "produtos"), produto);
    res.json({ id: docRef.id, ...produto });
  } catch (error) {
    console.error("Error adding produto:", error);
    res.status(500).json({ error: "Falha ao adicionar produto" });
  }
});

app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    const produto = req.body;
    await updateDoc(doc(db, "produtos", id), produto);
    res.json({ id, ...produto });
  } catch (error) {
    console.error("Error updating produto:", error);
    res.status(500).json({ error: "Falha ao atualizar produto" });
  }
});

app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    await deleteDoc(doc(db, "produtos", id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting produto:", error);
    res.status(500).json({ error: "Falha ao excluir produto" });
  }
});
`;

if (!code.includes('/api/produtos')) {
  // Find a good spot to insert. Before the catch-all /api/* or before app.get("*")
  const insertionPoint = code.indexOf('// --- API ROUTES ---');
  if (insertionPoint !== -1) {
    // let's insert it after checkFirebaseConfig middleware
    const checkPoint = code.indexOf('app.use(\'/api/settings\', checkFirebaseConfig);');
    if (checkPoint !== -1) {
        code = code.slice(0, checkPoint + 50) + addProdutosAPI + code.slice(checkPoint + 50);
        fs.writeFileSync('server.ts', code);
        console.log("Produtos API added successfully");
    } else {
        console.log("Could not find checkPoint");
    }
  }
} else {
  console.log("Produtos API already exists");
}
