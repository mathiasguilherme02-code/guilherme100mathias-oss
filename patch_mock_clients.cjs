const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const mockDec = `let mockProdutos: any[] = [];`;
const mockDecNew = `let mockProdutos: any[] = [];\nlet mockClients: any[] = [];`;
code = code.replace(mockDec, mockDecNew);

const getClientsOrig = `app.get("/api/clients", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }`;
const getClientsNew = `app.get("/api/clients", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json(mockClients.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()));
    }`;
code = code.replace(getClientsOrig, getClientsNew);

const postClientOrig = `app.post("/api/clients", async (req, res) => {
  try {
    if (!db) {
      return res.json({ id: Date.now().toString(), ...req.body });
    }`;
const postClientNew = `app.post("/api/clients", async (req, res) => {
  try {
    if (!db) {
      const client = { id: Date.now().toString(), ...req.body };
      mockClients.push(client);
      return res.json(client);
    }`;
code = code.replace(postClientOrig, postClientNew);

const putClientOrig = `app.put("/api/clients/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }`;
const putClientNew = `app.put("/api/clients/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      const idx = mockClients.findIndex(c => c.id === req.params.id);
      if (idx !== -1) mockClients[idx] = { ...mockClients[idx], ...req.body, id: req.params.id };
      return res.json({ id: req.params.id, ...req.body });
    }`;
code = code.replace(putClientOrig, putClientNew);

const delClientOrig = `app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Banco de dados não inicializado" });
    }`;
const delClientNew = `app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      mockClients = mockClients.filter(c => c.id !== req.params.id);
      return res.json({ success: true });
    }`;
code = code.replace(delClientOrig, delClientNew);

fs.writeFileSync('server.ts', code);
