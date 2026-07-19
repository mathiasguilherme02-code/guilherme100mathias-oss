const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const postOriginal = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const produto = req.body;
    const docRef = await addDoc(collection(db, "produtos"), produto);`;

const postNew = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const produto = req.body;
    
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const fileRef = ref(storage, \`produtos/\${Date.now()}_imagem\`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image", e);
      }
    }

    const docRef = await addDoc(collection(db, "produtos"), produto);`;

code = code.replace(postOriginal, postNew);

const putOriginal = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    const produto = req.body;
    await updateDoc(doc(db, "produtos", id), produto);`;

const putNew = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    const produto = req.body;
    
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const fileRef = ref(storage, \`produtos/\${Date.now()}_imagem\`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image", e);
      }
    }

    await updateDoc(doc(db, "produtos", id), produto);`;

code = code.replace(putOriginal, putNew);

fs.writeFileSync('server.ts', code);
