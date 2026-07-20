const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add mockProdutos array at the top level
const dbDeclaration = `let db: any;
let storage: any;`;
const dbDeclarationNew = `let db: any;
let storage: any;
let mockProdutos: any[] = [];`;

code = code.replace(dbDeclaration, dbDeclarationNew);

// Update GET /api/produtos
const getOriginal = `app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }`;
const getNew = `app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json(mockProdutos);
    }`;

code = code.replace(getOriginal, getNew);

// Update POST /api/produtos
const postOriginal = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const produto = req.body;`;
const postNew = `app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    const produto = req.body;
    
    if (!db) {
      const p = { id: Date.now().toString(), ...produto };
      mockProdutos.push(p);
      return res.json(p);
    }`;

code = code.replace(postOriginal, postNew);

// Update PUT /api/produtos/:id
const putOriginal = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    const produto = req.body;`;
const putNew = `app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const produto = req.body;
    
    if (!db) {
      const idx = mockProdutos.findIndex(p => p.id === id);
      if (idx !== -1) mockProdutos[idx] = { ...mockProdutos[idx], ...produto, id };
      return res.json({ id, ...produto });
    }`;

code = code.replace(putOriginal, putNew);

// Update DELETE /api/produtos/:id
const delOriginal = `app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }
    const { id } = req.params;
    await deleteDoc(doc(db, "produtos", id));`;
const delNew = `app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!db) {
      mockProdutos = mockProdutos.filter(p => p.id !== id);
      return res.json({ success: true });
    }
    await deleteDoc(doc(db, "produtos", id));`;

code = code.replace(delOriginal, delNew);

fs.writeFileSync('server.ts', code);
