import express from "express";
import compression from "compression";
import path from "path";
import admin from "firebase-admin";
import { ZipArchive } from "archiver";
import fs, { readFileSync, existsSync } from "fs";
import crypto from "crypto";
import dotenv from 'dotenv';
import * as webpush from "web-push";
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  DEFAULT_AUTO_SCHEDULE_CONFIG,
  normalizeAutoScheduleConfig,
  evaluateAutoScheduleNotifications,
  getBrazilTodayISO,
  getBrazilTimeHHMM,
  ScheduledWhatsAppNotification,
} from './src/utils/whatsappReminders';
import {
  DEFAULT_FERIADOS_CONFIG,
  normalizeFeriadosConfig,
} from './src/utils/holidays';
import {
  DEFAULT_PUSH_CONFIG,
  normalizePushConfig,
  PushNotificationConfig,
  DEFAULT_NEW_CLIENT_ALERT_CONFIG,
  normalizeNewClientAlertConfig,
  DEFAULT_QUIET_HOURS_CONFIG,
  normalizeQuietHoursConfig,
  isTimeInQuietWindow,
} from './src/utils/pushNotifications';

dotenv.config();


// Load service account
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
let serviceAccount: any;
const embeddedFallbackServiceAccount = {
  type: "service_account",
  project_id: "gmemprestimo-69965",
  private_key_id: "d91a245e41db3bb0d6a9202e9445300a56bbb44b",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD4H1AvEyJMPaap\n1aEpXueIp45AXLWn7a4tKLy146/ylyuUa+xzzJgSD5DgzrKS1WMz46HcupUlkG9d\nYyQSopFatmfIF3ZLBaNnSlbThLhlMYIXXx3BgOFJ5fKp7bXI8mEdMrbfwg3gtm1i\nOy87iooOQQF0zrQtU9IqnutfxaOoguakS7qkYW/JGZh9Pi/2RlDwxzrjBBPMcFIh\nMabmsIg8hqW4dx7TMmPhg12QSxiRPVNfzLJAs76ishW3Ms5MdBmLBhrIeAia2wn3\nI7bpd843cgXcEn0ZD4jeZmDS0fP6yNwyaSXfZBhEpCIeSR46ZTQckQQSsTvT7sov\naxMgZyidAgMBAAECggEAQUavqCrO/6LKiWy/8OvcWtnF9U3OpqbDh3Lrrqh/fgFi\nQDJiaxacvUemFFacqT+FUT3mM/VMTq0gdz+hWlu1hNlvFTeC8frCQebPT+dfQZQU\nRwTJhcJbwr7BqA33IK4PeYiBjv10/DTSMyEh7Hammlhkwy+sPC6MoJTdlH0g8LA2\n1B1ajdahIgbi0ZxBpEhAFT68tpYk09O4CaVHpT/BJeZXJXqcaCoZzEdzjrHQclQ8\nboEnjZz/oKkvfWvecMttdg2yZun4/gBIONPLObeBeGzKB+Aw7NHTnmlscS4e+b1q\nfey18RoJiNVh7ZmWW6IsZ2gCVjZUIjiaRY0zbtu3uwKBgQD8OAvCmP9d3W7hbw6U\nrHVCMirbPV7YD1UG3WxT2lgofys5Dchq3QPZJNiAvIXu6GYtLOudGNXEmYQ286FJ\nUelrCiewR0rVfrtdcYvo6NnLS6ihr7ET4YsNAfXOY/MSahuJUTMHC9T9aZ0Vt4Tj\nUUxsfD8g18VomyOxNTzzVmTYwwKBgQD714ulab8ErIahKYjgNjJdg0JQd7r+hXDw\nTRVIjskUFlzuTIkYTpu74qMhGH7c/2pxoyhhoh3RrzBY98xKGrYupBm76fmRRo4Q\nkLqKYosIc/IJv0oraY8BJalYWLlbsO+Ku4J0lzPet1HPpspZG53Fl0V4nnWDDMXz\n79iwilTjHwKBgQDxbYCsVKHVKtoxhooRfId9xuHJHRTFgt+kA53nIlFS6m/oXC4l\nRMyjNabcjBk0WFc+FQqwRQ6S81Rg+ZLAyVzC7mSRU5zpgjc9uivv1bxs4k5X/wJl\nAneFCwRM/NW3IcScDBLpQsUtkcQg/puAsNiT29bdzE0V1bMztL9UOrWr2wKBgQCx\nuR3CYMq9mKb1iqMeXwDR/zRIJwZeYXsfCbbQWntKYrG4NWi2L5s1Ty4ByBCXEuRi\nR1rS854JgJEk59JSJWGVrpa+htJpFBpjVE9gI0SsdW5ENKs50adqjtJgF1TPgSC6\njbL1ZlLjhAkG+lRn59ZCP4t2IJUbI2N6zzLi+uwGzwKBgQC5sKs3OTFxjMKdslcZ\n9O8MGfFB3MPmDDG5TiWRSa/DRsWCd4ob1Lwhi/R28DEfzIPLfv0VwZYu3O1OBArR\nz2PJu1cNzPn4Gmm52r25GUQkOmCicA417MwXAP+S7BB+l1atZ1W/7VzfH3ZQv4fj\nedi25gfmeZlR3hDJ/+chLa5m3w==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@gmemprestimo-69965.iam.gserviceaccount.com",
  client_id: "100381538727015059185",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gmemprestimo-69965.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

try {
  if (existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT) {
    const rawEnvSa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
    serviceAccount = typeof rawEnvSa === 'string' ? JSON.parse(rawEnvSa) : rawEnvSa;
  } else {
    serviceAccount = embeddedFallbackServiceAccount;
  }
} catch (e) {
  console.error("Failed to load service account credentials, using fallback", e);
  serviceAccount = embeddedFallbackServiceAccount;
}

let db: any;
let storage: any;

const dataFilePath = path.join(process.cwd(), 'data.json');
const loadData = () => {
  if (fs.existsSync(dataFilePath)) {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  }
  return {
    mockProdutos: [
      { id: "mock1", nome: "Empréstimo Pessoal", descricao: "Crédito rápido e fácil com taxas competitivas para suas necessidades do dia a dia.", preco: "1000", precoOferta: "950", imagemUrl: "" },
      { id: "mock2", nome: "Empréstimo Consignado", descricao: "A melhor taxa do mercado, com desconto direto na folha de pagamento.", preco: "5000", precoOferta: "4500", imagemUrl: "" },
      { id: "mock3", nome: "Antecipação FGTS", descricao: "Antecipe suas parcelas do saque-aniversário do FGTS de forma rápida e segura.", preco: "2000", imagemUrl: "" },
      { id: "mock4", nome: "Crédito com Garantia de Veículo", descricao: "Use seu carro ou moto como garantia para conseguir taxas menores e valores maiores.", preco: "10000", imagemUrl: "" },
      { id: "mock5", nome: "Crédito com Garantia de Imóvel", descricao: "Use seu imóvel como garantia e consiga as melhores condições do mercado.", preco: "50000", precoOferta: "48000", imagemUrl: "" },
      { id: "mock6", nome: "Financiamento de Veículos", descricao: "Financiamento rápido para você comprar seu carro novo ou seminovo.", preco: "30000", imagemUrl: "" },
      { id: "mock7", nome: "Refinanciamento de Veículo", descricao: "Refinancie seu veículo e consiga dinheiro rápido com as melhores taxas.", preco: "15000", imagemUrl: "" },
      { id: "mock8", nome: "Cartão de Crédito Consignado", descricao: "Cartão de crédito sem anuidade com desconto direto na folha.", preco: "0", imagemUrl: "" },
      { id: "mock9", nome: "Consórcio de Automóveis", descricao: "Planeje a compra do seu carro sem pagar juros através de consórcios parceiros.", preco: "40000", imagemUrl: "" },
      { id: "mock10", nome: "Consórcio de Imóveis", descricao: "A forma mais econômica de planejar a compra da sua casa própria.", preco: "150000", imagemUrl: "" }
    ],
    mockClients: [],
    mockSettings: null,
    mockScheduleLogs: [],
    mockPushSubscriptions: [],
    mockPushSentKeys: [],
    mockVapidKeys: null
  };
};

const saveData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

let appData = loadData();
let mockProdutos = appData.mockProdutos || [];
let mockClients = appData.mockClients || [];
let mockSettings: any = appData.mockSettings || null;
let mockScheduleLogs: ScheduledWhatsAppNotification[] = Array.isArray(appData.mockScheduleLogs)
  ? appData.mockScheduleLogs
  : [];
let mockPushSubscriptions: any[] = Array.isArray(appData.mockPushSubscriptions)
  ? appData.mockPushSubscriptions
  : [];
let mockPushSentKeys: Array<{ id: string; dateISO: string; sentAt: string }> = Array.isArray(appData.mockPushSentKeys)
  ? appData.mockPushSentKeys
  : [];
let mockVapidKeys: { publicKey: string; privateKey: string; subject: string } | null =
  appData.mockVapidKeys || null;

const syncData = () => {
  saveData({
    mockProdutos,
    mockClients,
    mockSettings,
    mockScheduleLogs,
    mockPushSubscriptions,
    mockPushSentKeys,
    mockVapidKeys,
  });
};


try {
  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "gmemprestimo-69965.firebasestorage.app"
    });
    db = admin.firestore();
    storage = admin.storage().bucket();
    console.log("Firebase Admin initialized successfully");
  } else {
    console.error("No service account found, Firebase Admin not initialized");
  }
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
}

// --- Firebase Client SDK Mock Wrappers ---
const collection = (db: any, ...pathSegments: string[]) => {
  if (!db) throw new Error("Database not initialized");
  return db.collection(pathSegments.join('/'));
};
const doc = (db: any, ...pathSegments: string[]) => {
  if (!db) throw new Error("Database not initialized");
  return db.doc(pathSegments.join('/'));
};
const setDoc = (ref: any, data: any, options?: any) => options?.merge ? ref.set(data, { merge: true }) : ref.set(data);
const getDoc = async (ref: any) => {
  const snap = await ref.get();
  return { exists: () => snap.exists, data: () => snap.data(), id: snap.id, ref: snap.ref };
};
const getDocs = (query: any) => query.get();
const updateDoc = (ref: any, data: any) => ref.update(data);
const deleteDoc = (ref: any) => ref.delete();
const query = (ref: any, ...constraints: any[]) => {
  let q = ref;
  for (const c of constraints) q = c(q);
  return q;
};
const where = (field: string, op: string, value: any) => (q: any) => q.where(field, op, value);
const orderBy = (field: string, dir: string = 'asc') => (q: any) => q.orderBy(field, dir);
const addDoc = async (ref: any, data: any) => {
  const docRef = await ref.add(data);
  return { id: docRef.id, ...docRef };
};
const increment = (n: number) => admin.firestore.FieldValue.increment(n);
const writeBatch = (db: any) => {
  if (!db) throw new Error("Database not initialized");
  return db.batch();
};

const ref = (storage: any, path: string) => storage.file(path);
const uploadString = async (fileRef: any, dataString: string, format: string) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid input string');
  const buffer = Buffer.from(matches[2], 'base64');
  await fileRef.save(buffer, { metadata: { contentType: matches[1] } });
};
const getDownloadURL = async (fileRef: any) => {
  try { await fileRef.makePublic(); } catch (e) { /* ignore if already public or not allowed */ }
  return `https://storage.googleapis.com/${fileRef.bucket.name}/${fileRef.name}`;
};
// -----------------------------------------

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gustavo@01';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'secret-admin-token-123';

const requireAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}` || authHeader === `Bearer ${ADMIN_PASSWORD}`) {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};


function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = sanitizeForFirestore(obj[key]);
    }
  }
  return result;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable HTTP compression to speed up API responses (skip SSE stream)
app.use(compression({
  filter: (req, res) => {
    if (req.path === '/api/events') return false;
    return compression.filter(req, res);
  },
}));

// Increase payload limit for file uploads (base64)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- API ROUTES ---

const checkFirebaseConfig = (req: any, res: any, next: any) => {
  // Config is now hardcoded as fallback, so it's always available
  next();
};

app.use('/api/clients', checkFirebaseConfig);
app.use('/api/settings', checkFirebaseConfig);

//

// --- PRODUTOS API ---

const PRODUTOS_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedProdutosList: any[] | null = null;
let lastKnownProdutosList: any[] | null = null;
let lastProdutosFetchTime = 0;

function invalidateProdutosCache() {
  cachedProdutosList = null;
  lastProdutosFetchTime = 0;
}

app.get("/api/produtos", async (req, res) => {
  try {
    if (!db) {
      return res.json(mockProdutos);
    }
    const now = Date.now();
    if (cachedProdutosList && now - lastProdutosFetchTime < PRODUTOS_CACHE_TTL_MS) {
      return res.json(cachedProdutosList);
    }
    const querySnapshot = await db.collection("produtos").get();
    const produtos = querySnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    cachedProdutosList = produtos;
    lastKnownProdutosList = produtos;
    lastProdutosFetchTime = now;
    res.json(produtos);
  } catch (error) {
    console.error("Error fetching produtos:", error);
    if (lastKnownProdutosList) {
      return res.json(lastKnownProdutosList);
    }
    if (Array.isArray(mockProdutos) && mockProdutos.length > 0) {
      return res.json(mockProdutos);
    }
    res.status(500).json({ error: "Falha ao buscar produtos" });
  }
});

app.post("/api/produtos", requireAdmin, async (req, res) => {
  try {
    const produto = req.body;
    
    if (!db) {
      const p = { id: Date.now().toString(), ...produto };
      mockProdutos.push(p); syncData();
      return res.json(p);
    }
    
    if (produto.imagemUrl && produto.imagemUrl.startsWith('data:')) {
      try {
        const fileRef = ref(storage, `produtos/${Date.now()}_imagem`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image:", e);
        console.error("Data length:", produto.imagemUrl.length, "Starts with:", produto.imagemUrl.substring(0, 50));
      }
    }

    const docRef = await addDoc(collection(db, "produtos"), produto);
    invalidateProdutosCache();
    res.json({ id: docRef.id, ...produto });
  } catch (error) {
    console.error("Error adding produto:", error);
    res.status(500).json({ error: "Falha ao adicionar produto" });
  }
});

app.put("/api/produtos/:id", requireAdmin, async (req, res) => {
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
        const fileRef = ref(storage, `produtos/${Date.now()}_imagem`);
        await uploadString(fileRef, produto.imagemUrl, 'data_url');
        produto.imagemUrl = await getDownloadURL(fileRef);
      } catch (e) {
        console.error("Error uploading produto image:", e);
        console.error("Data length:", produto.imagemUrl.length, "Starts with:", produto.imagemUrl.substring(0, 50));
      }
    }

    await updateDoc(doc(db, "produtos", id), produto);
    invalidateProdutosCache();
    res.json({ id, ...produto });
  } catch (error) {
    console.error("Error updating produto:", error);
    res.status(500).json({ error: "Falha ao atualizar produto" });
  }
});

app.delete("/api/produtos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) {
      mockProdutos = mockProdutos.filter(p => p.id !== id); syncData();
      return res.json({ success: true });
    }
    await db.collection("produtos").doc(id).delete();
    invalidateProdutosCache();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting produto:", error);
    res.status(500).json({ error: "Falha ao excluir produto" });
  }
});
 // Server-Sent Events for Real-time Updates
const sseClients = new Set<express.Response>();

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent proxy buffering
  res.flushHeaders();

  sseClients.add(res);

  // Send a ping every 15 seconds to keep the connection alive
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
  });
});

function broadcastUpdate(type: string, payload?: any) {
  const message = `data: ${JSON.stringify({ type, payload })}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
}

// Admin Login
app.post("/api/admin/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Senha incorreta" });
  }
});

const isFirestoreQuotaError = (err: any): boolean => {
  const code = Number(err?.code || 0);
  const msg = String(err?.message || err?.details || "");
  return code === 8 || /RESOURCE_EXHAUSTED|Quota exceeded/i.test(msg);
};

const normalizeCpfDigits = (cpf: any): string =>
  typeof cpf === "string" ? cpf.replace(/\D/g, "") : String(cpf || "").replace(/\D/g, "");

const formatCpfMask = (digits: string): string =>
  digits.length === 11
    ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    : digits;

const mergeClientDocData = (docId: string, data: any) => {
  let clientData: any = {};
  if (typeof data?.dados === "string") {
    try {
      clientData = JSON.parse(data.dados);
    } catch {
      clientData = {};
    }
  } else if (data?.dados && typeof data.dados === "object") {
    clientData = data.dados;
  }
  const merged = { ...(data || {}), ...clientData, id: docId };
  if (!merged.arquivos && data?.arquivos) {
    merged.arquivos = data.arquivos;
  }
  delete merged.dados;
  return merged;
};

const CLIENTS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min TTL (invalidated on writes)
const CLIENT_LOGIN_CACHE_TTL_MS = 60 * 1000; // 1 min TTL for repeated logins/refreshes
let cachedClientsList: any[] | null = null;
let cachedRawClientsList: any[] | null = null;
let lastKnownClientsList: any[] | null = null;
let lastKnownRawClientsList: any[] | null = null;
let lastClientsFetchTime = 0;
const clientLoginCache = new Map<string, { data: any; ts: number }>();

function invalidateClientsCache() {
  cachedClientsList = null;
  cachedRawClientsList = null;
  lastKnownClientsList = null;
  lastKnownRawClientsList = null;
  lastClientsFetchTime = 0;
  clientLoginCache.clear();
}

const findClientInArrayByCpf = (list: any[] | null | undefined, cpfDigits: string) => {
  if (!Array.isArray(list) || !cpfDigits) return null;
  return (
    list.find((c) => {
      const topDigits = normalizeCpfDigits(c?.cpf);
      if (topDigits === cpfDigits) return true;
      if (c?.dados && typeof c.dados === "object") {
        if (normalizeCpfDigits(c.dados.cpf) === cpfDigits) return true;
      }
      return false;
    }) || null
  );
};

// Client Login (Securely fetch only one client's data)
app.post("/api/clients/login", async (req, res) => {
  const rawCpf = req.body?.cpf;
  const formattedCpf = normalizeCpfDigits(rawCpf);

  if (formattedCpf.length !== 11) {
    return res.status(400).json({ error: "CPF inválido. Informe os 11 números do CPF." });
  }

  try {
    if (!db) {
      const parsedMock = mockClients.map((c) => mergeClientDocData(c.id, c));
      const found = findClientInArrayByCpf(parsedMock, formattedCpf);
      if (!found) {
        return res.status(404).json({ error: "CPF não encontrado em nossa base de dados." });
      }
      return res.json(found);
    }

    const now = Date.now();
    const cachedLogin = clientLoginCache.get(formattedCpf);
    if (cachedLogin && now - cachedLogin.ts < CLIENT_LOGIN_CACHE_TTL_MS) {
      return res.json(cachedLogin.data);
    }

    if (cachedRawClientsList && now - lastClientsFetchTime < CLIENTS_CACHE_TTL_MS) {
      const foundInRaw = findClientInArrayByCpf(cachedRawClientsList, formattedCpf);
      if (foundInRaw) {
        clientLoginCache.set(formattedCpf, { data: foundInRaw, ts: now });
        return res.json(foundInRaw);
      }
    }

    const q = query(collection(db, "clients"), where("cpf", "==", formattedCpf));
    let querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const maskedCpf = formatCpfMask(formattedCpf);
      if (maskedCpf !== formattedCpf) {
        const qMasked = query(collection(db, "clients"), where("cpf", "==", maskedCpf));
        querySnapshot = await getDocs(qMasked);
      }
    }

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const merged = mergeClientDocData(docSnap.id, docSnap.data());
      clientLoginCache.set(formattedCpf, { data: merged, ts: now });
      return res.json(merged);
    }

    // Fallback: check full client list in case cpf was stored with extra spaces or nested only in dados.cpf
    const allClients = await loadAllClientsForSchedule();
    const fallbackMatch = findClientInArrayByCpf(allClients, formattedCpf);
    if (fallbackMatch) {
      clientLoginCache.set(formattedCpf, { data: fallbackMatch, ts: now });
      return res.json(fallbackMatch);
    }

    return res.status(404).json({ error: "CPF não encontrado em nossa base de dados." });
  } catch (error: any) {
    console.error("Error logging in client:", error?.message || error);

    const staleLogin = clientLoginCache.get(formattedCpf)?.data;
    if (staleLogin) {
      return res.json(staleLogin);
    }
    const staleRaw = findClientInArrayByCpf(lastKnownRawClientsList, formattedCpf);
    if (staleRaw) {
      return res.json(staleRaw);
    }

    if (isFirestoreQuotaError(error)) {
      return res.status(503).json({
        error: "O sistema está temporariamente sobrecarregado (limite diário do banco de dados atingido). Tente novamente em alguns instantes ou fale com o administrador.",
        code: "QUOTA_EXCEEDED",
      });
    }
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

const buildDefaultSettings = () => ({
  taxaJuros: '40',
  taxaAtrasoDia: '8',
  tipoTaxa: 'mensal',
  diasLembreteAntecipado: '3',
  ...DEFAULT_WHATSAPP_TEMPLATES,
  msgTelefones: {} as Record<string, string>,
  customWhatsAppTemplates: [] as any[],
  whatsappAppMode: 'business',
  autoScheduleConfig: { ...DEFAULT_AUTO_SCHEDULE_CONFIG },
  feriadosConfig: normalizeFeriadosConfig(DEFAULT_FERIADOS_CONFIG),
  pushConfig: { ...DEFAULT_PUSH_CONFIG },
  newClientAlertConfig: { ...DEFAULT_NEW_CLIENT_ALERT_CONFIG },
  quietHoursConfig: { ...DEFAULT_QUIET_HOURS_CONFIG },
});

const normalizeLoadedSettings = (raw: any) => {
  const defaultSettings = buildDefaultSettings();
  const data = { ...defaultSettings, ...(raw || {}) };
  const legacyFrozenDefaults = [
    'Olá {cliente}, a GM-Empréstimo informa que {referencia} está com juros congelados para pagamento até {data} no valor de {valor}. Nossa chave Pix para quitação: 31972323040 (Silmara).',
    'Olá {cliente}, a GM-Empréstimo informa que {referencia} está com juros congelados para pagamento até {data} no valor de {valor}.\n\n{abatimentos}\n\nNossa chave Pix para quitação: 31972323040 (Silmara).',
    'Olá {cliente}, a GM-Empréstimo informa que sua dívida está com juros congelados desde {data}.\n{abatimentos}\n\nSeu saldo devedor é de {valor}.',
  ];
  if (
    typeof data.msgLembreteCongelado === 'string' &&
    legacyFrozenDefaults.includes(data.msgLembreteCongelado.trim())
  ) {
    data.msgLembreteCongelado = defaultSettings.msgLembreteCongelado;
  }
  data.diasLembreteAntecipado = String(
    Math.min(
      60,
      Math.max(
        1,
        parseInt(String(data.diasLembreteAntecipado ?? '3'), 10) || 3,
      ),
    ),
  );
  if (!data.msgTelefones || typeof data.msgTelefones !== 'object' || Array.isArray(data.msgTelefones)) {
    data.msgTelefones = {};
  }
  if (!Array.isArray(data.customWhatsAppTemplates)) {
    data.customWhatsAppTemplates = [];
  }
  if (data.whatsappAppMode !== 'business' && data.whatsappAppMode !== 'padrao') {
    data.whatsappAppMode = 'business';
  }
  data.autoScheduleConfig = normalizeAutoScheduleConfig(data.autoScheduleConfig);
  data.feriadosConfig = normalizeFeriadosConfig(data.feriadosConfig);
  data.pushConfig = normalizePushConfig(data.pushConfig);
  data.newClientAlertConfig = normalizeNewClientAlertConfig(data.newClientAlertConfig);
  data.quietHoursConfig = normalizeQuietHoursConfig(data.quietHoursConfig);
  return data;
};

const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedServerSettings: any = null;
let lastSettingsFetchTime = 0;

function invalidateSettingsCache() {
  lastSettingsFetchTime = 0;
}

const loadServerSettings = async (forceRefresh = false) => {
  if (!db) {
    return normalizeLoadedSettings(mockSettings);
  }
  const now = Date.now();
  if (!forceRefresh && cachedServerSettings && now - lastSettingsFetchTime < SETTINGS_CACHE_TTL_MS) {
    return cachedServerSettings;
  }
  try {
    const docRef = doc(db, "admin_settings", "1");
    const docSnap = await getDoc(docRef);
    const normalized = !docSnap.exists()
      ? normalizeLoadedSettings(null)
      : normalizeLoadedSettings(docSnap.data());
    cachedServerSettings = normalized;
    lastSettingsFetchTime = now;
    return normalized;
  } catch (error) {
    if (cachedServerSettings) {
      return cachedServerSettings;
    }
    throw error;
  }
};

// Get Admin Settings (Public, needed for simulation)
app.get("/api/settings", async (req, res) => {
  try {
    const data = await loadServerSettings();
    res.json(data);
  } catch (error) {
    console.error("Error fetching settings (returning defaults):", error);
    res.json(cachedServerSettings || buildDefaultSettings());
  }
});

// Update Admin Settings (Protected)
app.put("/api/settings", requireAdmin, async (req, res) => {
  try {
    const {
      taxaJuros,
      taxaAtrasoDia,
      tipoTaxa,
      diasLembreteAntecipado,
      msgLembreteAVencer,
      msgLembretePreVencimento,
      msgLembreteVenceHoje,
      msgLembreteCongelado,
      msgLembreteConfirmacao,
      msgLembreteVencido,
      msgTelefones,
      customWhatsAppTemplates,
      whatsappAppMode,
      autoScheduleConfig,
      feriadosConfig,
      pushConfig,
      newClientAlertConfig,
      quietHoursConfig,
    } = req.body;

    const currentSettings = await loadServerSettings();
    const mergedAutoConfig = autoScheduleConfig
      ? normalizeAutoScheduleConfig({
          ...currentSettings.autoScheduleConfig,
          ...autoScheduleConfig,
          lastRunDate:
            autoScheduleConfig.lastRunDate !== undefined
              ? autoScheduleConfig.lastRunDate
              : currentSettings.autoScheduleConfig?.lastRunDate || "",
          lastRunAt:
            autoScheduleConfig.lastRunAt !== undefined
              ? autoScheduleConfig.lastRunAt
              : currentSettings.autoScheduleConfig?.lastRunAt || "",
        })
      : currentSettings.autoScheduleConfig;

    const mergedPushConfig = pushConfig
      ? normalizePushConfig({
          ...currentSettings.pushConfig,
          ...pushConfig,
          lastReminderPushDate:
            pushConfig.lastReminderPushDate !== undefined
              ? pushConfig.lastReminderPushDate
              : currentSettings.pushConfig?.lastReminderPushDate || "",
          lastReminderPushAt:
            pushConfig.lastReminderPushAt !== undefined
              ? pushConfig.lastReminderPushAt
              : currentSettings.pushConfig?.lastReminderPushAt || "",
        })
      : currentSettings.pushConfig;

    const normalizedDiasAntecipado = String(
      Math.min(
        60,
        Math.max(
          1,
          parseInt(
            String(
              diasLembreteAntecipado !== undefined && diasLembreteAntecipado !== ""
                ? diasLembreteAntecipado
                : currentSettings.diasLembreteAntecipado || "3",
            ),
            10,
          ) || 3,
        ),
      ),
    );

    const payloadToSave: any = {
      taxaJuros,
      taxaAtrasoDia,
      tipoTaxa,
      diasLembreteAntecipado: normalizedDiasAntecipado,
      ...(whatsappAppMode === 'business' || whatsappAppMode === 'padrao'
        ? { whatsappAppMode }
        : {}),
      ...(msgLembreteAVencer !== undefined ? { msgLembreteAVencer } : {}),
      ...(msgLembretePreVencimento !== undefined ? { msgLembretePreVencimento } : {}),
      ...(msgLembreteVenceHoje !== undefined ? { msgLembreteVenceHoje } : {}),
      ...(msgLembreteCongelado !== undefined ? { msgLembreteCongelado } : {}),
      ...(msgLembreteConfirmacao !== undefined ? { msgLembreteConfirmacao } : {}),
      ...(msgLembreteVencido !== undefined ? { msgLembreteVencido } : {}),
      ...(msgTelefones && typeof msgTelefones === 'object' && !Array.isArray(msgTelefones)
        ? {
            msgTelefones: Object.fromEntries(
              Object.entries(msgTelefones).map(([k, v]) => [k, String(v || "")]),
            ),
          }
        : {}),
      ...(Array.isArray(customWhatsAppTemplates)
        ? {
            customWhatsAppTemplates: customWhatsAppTemplates.map((t: any) => ({
              id: String(t?.id || ""),
              label: String(t?.label || "Modelo Personalizado"),
              situacao: String(t?.situacao || "personalizado"),
              text: String(t?.text || ""),
              telefone: String(t?.telefone || ""),
            })),
          }
        : {}),
      ...(autoScheduleConfig ? { autoScheduleConfig: mergedAutoConfig } : {}),
      ...(feriadosConfig !== undefined
        ? { feriadosConfig: normalizeFeriadosConfig(feriadosConfig) }
        : {}),
      ...(pushConfig !== undefined ? { pushConfig: mergedPushConfig } : {}),
      ...(newClientAlertConfig !== undefined
        ? { newClientAlertConfig: normalizeNewClientAlertConfig(newClientAlertConfig) }
        : {}),
      ...(quietHoursConfig !== undefined
        ? { quietHoursConfig: normalizeQuietHoursConfig(quietHoursConfig) }
        : {}),
    };

    if (!db) {
      mockSettings = { ...(mockSettings || {}), ...payloadToSave };
      syncData();
      broadcastUpdate('UPDATE_SETTINGS');
      return res.json({ success: true });
    }

    await setDoc(doc(db, "admin_settings", "1"), sanitizeForFirestore(payloadToSave), { merge: true });
    invalidateSettingsCache();
    cachedServerSettings = normalizeLoadedSettings({ ...(cachedServerSettings || {}), ...payloadToSave });
    lastSettingsFetchTime = Date.now();

    broadcastUpdate('UPDATE_SETTINGS');
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Falha ao atualizar configurações" });
  }
});

app.get("/api/sysinfo", (req, res) => { res.json({ hasDb: !!db, firebaseConfig: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT }); });

function sanitizeClientForList(c: any) {
  const shallow = { ...c };
  if (Array.isArray(shallow.arquivos)) {
    shallow.arquivos = shallow.arquivos.map((a: any) => {
      if (typeof a === 'string') {
        return a.startsWith('data:') ? { name: 'Comprovante', type: 'image/jpeg' } : a;
      }
      if (a && typeof a === 'object') {
        const { url, preview, ...rest } = a;
        return {
          ...rest,
          url: typeof url === 'string' && url.startsWith('http') ? url : undefined,
          hasAttachment: !!(url || preview)
        };
      }
      return a;
    });
  }
  return shallow;
}

// Get All Clients (Protected)
app.get("/api/clients", requireAdmin, async (req, res) => {
  try {
    const now = Date.now();
    const forceFresh = req.query.fresh === '1' || req.query.fresh === 'true';
    if (!forceFresh && cachedClientsList && (now - lastClientsFetchTime) < CLIENTS_CACHE_TTL_MS) {
      return res.json(cachedClientsList);
    }

    if (!db) {
      const parsedMock = mockClients.map((c) => sanitizeClientForList(mergeClientDocData(c.id, c)))
        .sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());

      cachedClientsList = parsedMock;
      lastKnownClientsList = parsedMock;
      lastClientsFetchTime = now;
      return res.json(parsedMock);
    }

    const q = query(collection(db, "clients"), orderBy("dataCadastro", "desc"));
    const querySnapshot = await getDocs(q);

    const rawClients = querySnapshot.docs.map(doc => mergeClientDocData(doc.id, doc.data()));
    const parsedClients = rawClients.map(sanitizeClientForList);

    cachedRawClientsList = rawClients;
    lastKnownRawClientsList = rawClients;
    cachedClientsList = parsedClients;
    lastKnownClientsList = parsedClients;
    lastClientsFetchTime = now;
    res.json(parsedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    if (lastKnownClientsList) {
      return res.json(lastKnownClientsList);
    }
    if (isFirestoreQuotaError(error)) {
      return res.status(503).json({
        error: "Limite diário de leitura do banco de dados atingido. Aguarde a renovação da cota ou tente novamente em instantes.",
        code: "QUOTA_EXCEEDED",
      });
    }
    res.status(500).json({ error: "Falha ao buscar clientes" });
  }
});

// Get Single Client
app.get("/api/clients/:id", async (req, res) => {
  try {
    if (!db) {
      const client = mockClients.find((c) => c.id === req.params.id);
      if (client) {
        let merged = { ...client };
        if (merged.dados) {
            const dados = typeof merged.dados === 'string' ? JSON.parse(merged.dados) : merged.dados;
            merged = { ...merged, ...dados };
            delete merged.dados;
        }
        return res.json(merged);
      }
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    const docRef = doc(db, "clients", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    const data = docSnap.data();
    const clientData = typeof data.dados === 'string' ? JSON.parse(data.dados) : (data.dados || {});
    let merged = { ...data, ...clientData, id: docSnap.id };
    delete merged.dados;
    
    // Explicitly check for arquivos at root if missing from merged
    if (!merged.arquivos && data.arquivos) {
        merged.arquivos = data.arquivos;
    }
    
    res.json(merged);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Falha ao buscar cliente" });
  }
});

async function processClientFiles(client: any) {
  const arraysToProcess = [];
  if (client.arquivos && Array.isArray(client.arquivos)) arraysToProcess.push(client.arquivos);
  if (client.dados && client.dados.arquivos && Array.isArray(client.dados.arquivos)) arraysToProcess.push(client.dados.arquivos);
  
  for (const arr of arraysToProcess) {
    for (let i = 0; i < arr.length; i++) {
      const arquivo = arr[i];
      if (arquivo.url && arquivo.url.startsWith('data:')) {
        try {
          if (storage) {
             const fileRef = ref(storage, `clients/${client.id}/${Date.now()}_${arquivo.name}`);
             await uploadString(fileRef, arquivo.url, 'data_url');
             const downloadURL = await getDownloadURL(fileRef);
             arquivo.url = downloadURL;
          }
        } catch (error) {
          console.error("Error uploading file to storage:", error);
        }
      }
    }
  }
  return client;
}

// Add New Client (Public, for registration)
app.post("/api/clients", async (req, res) => {
  try {
    if (!db) {
      const client = { id: Date.now().toString(), ...req.body };
      mockClients.push(client);
      syncData();
      invalidateClientsCache();
      const valorSol =
        client.simulacoes?.[0]?.valorSolicitado ||
        client.simulacao?.valorSolicitado ||
        client.valorSolicitado ||
        null;
      broadcastUpdate('UPDATE_CLIENTS');
      broadcastUpdate('NEW_CLIENT', {
        id: client.id,
        nomeCompleto: client.nomeCompleto,
        cpf: client.cpf,
        telefone: client.telefone,
        valorSolicitado: valorSol,
        dataCadastro: client.dataCadastro || new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });
      void notifyNewClientPush({
        id: client.id,
        nomeCompleto: client.nomeCompleto,
        cpf: client.cpf,
        valorSolicitado: valorSol,
      });
      return res.json(client);
    }
    const client = req.body;
    if (!client || !client.cpf) {
      return res.status(400).json({ error: "CPF é obrigatório" });
    }
    const formattedCpf = client.cpf.replace(/[^\d]+/g, '');
    
    // Check if CPF already exists
    const q = query(collection(db, "clients"), where("cpf", "==", formattedCpf));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).json({ error: "CPF já cadastrado" });
    }
    
    // Convert DD/MM/YYYY to YYYY-MM-DD for sorting
    let pgDate = new Date().toISOString();
    if (client.dataCadastro) {
      if (client.dataCadastro.includes('/')) {
        const [day, month, year] = client.dataCadastro.split('/');
        if (day && month && year) {
          pgDate = `${year}-${month}-${day}`;
        }
      } else if (client.dataCadastro.includes('-')) {
        pgDate = client.dataCadastro;
      }
    }
    
    // Process files (upload to Firebase Storage)
    const processedClient = await processClientFiles(client);
    
    await setDoc(doc(db, "clients", client.id), sanitizeForFirestore({
      id: client.id,
      nomeCompleto: client.nomeCompleto,
      cpf: formattedCpf,
      dataCadastro: pgDate,
      dados: processedClient
    }));
      
    invalidateClientsCache();
    const valorSol =
      client.simulacoes?.[0]?.valorSolicitado ||
      client.simulacao?.valorSolicitado ||
      client.valorSolicitado ||
      null;
    broadcastUpdate('UPDATE_CLIENTS');
    broadcastUpdate('NEW_CLIENT', {
      id: client.id,
      nomeCompleto: client.nomeCompleto,
      cpf: formattedCpf,
      telefone: client.telefone,
      valorSolicitado: valorSol,
      dataCadastro: pgDate,
      timestamp: new Date().toISOString(),
    });
    void notifyNewClientPush({
      id: client.id,
      nomeCompleto: client.nomeCompleto,
      cpf: formattedCpf,
      valorSolicitado: valorSol,
    });
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error("Error saving client:", error);
    res.status(500).json({ error: "Falha ao salvar cliente", details: error.message || error });
  }
});

// Update Client (Public for now, but requires CPF validation to prevent unauthorized updates)
app.put("/api/clients/:id", async (req, res) => {
  try {
    if (!db) {
      const idx = mockClients.findIndex(c => c.id === req.params.id);
      if (idx !== -1) {
         mockClients[idx] = { ...mockClients[idx], ...req.body };
         syncData();
         invalidateClientsCache();
         return res.json({ success: true });
      }
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    const { id } = req.params;
    let client = req.body;
    
    if (client.cpf) {
      client.cpf = client.cpf.replace(/[^\d]+/g, '');
    }

    const authHeader = req.headers.authorization;
    const isAdmin = authHeader === `Bearer ${ADMIN_TOKEN}`;
    
    if (!isAdmin) {
      const docRef = doc(db, "clients", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().cpf !== client.cpf) {
        return res.status(403).json({ error: "Não autorizado" });
      }
    }

    // Explicitly merge existing arquivos if they were sent, or keep them if they were deleted by accident in the client
    const docRef = doc(db, "clients", id);
    const docSnap = await getDoc(docRef);
    let existingArquivos = [];
    if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.arquivos) {
           existingArquivos = d.arquivos;
        } else if (d.dados && typeof d.dados === 'string') {
           const p = JSON.parse(d.dados);
           if (p.arquivos) existingArquivos = p.arquivos;
        } else if (d.dados && d.dados.arquivos) {
           existingArquivos = d.dados.arquivos;
        }
    }
    
    if ((client.arquivos && client.arquivos.length > 0) || (client.dados && client.dados.arquivos && client.dados.arquivos.length > 0)) {
       client = await processClientFiles(client);
    } else {
       client.arquivos = existingArquivos;
    }
    
    let updateData = {
      ...client
    };
    
    // Convert date if present
    if (updateData.dataCadastro && updateData.dataCadastro.includes('/')) {
        const parts = updateData.dataCadastro.split('/');
        if (parts.length === 3) {
            updateData.dataCadastro = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    
    const sanitized = sanitizeForFirestore(updateData);
    
    // we want to nest everything except top level fields in 'dados' to match the existing schema
    const topLevelFields = ['id', 'nomeCompleto', 'cpf', 'dataCadastro', 'arquivos'];
    const dados: any = {};
    const finalData: any = {};
    for (const key of Object.keys(sanitized)) {
        if (topLevelFields.includes(key)) {
            finalData[key] = sanitized[key];
        } else {
            dados[key] = sanitized[key];
        }
    }
    finalData.dados = dados;

    if (docSnap.exists()) {
      try {
        const prevData = docSnap.data();
        let prevDados = prevData.dados;
        if (typeof prevDados === 'string') {
          try { prevDados = JSON.parse(prevDados); } catch (e) {}
        }
        const prevSims = prevDados?.simulacoes || prevData.simulacoes || [];
        const newSims = dados.simulacoes || finalData.simulacoes || [];
        if (prevSims.length > newSims.length || prevSims.some((ps: any, idx: number) => ps.anotacoes && !newSims[idx]?.anotacoes)) {
          const now = new Date();
          await db.collection("audit_history").add({
            type: "simulation_or_note_modified",
            clientId: id,
            clientName: finalData.nomeCompleto || prevData.nomeCompleto || "Cliente",
            timestamp: now.toISOString(),
            data: now.toISOString().split("T")[0],
            hora: now.toTimeString().split(" ")[0].slice(0, 5),
            previousSimulacoes: prevSims,
            newSimulacoes: newSims,
          });
        }
      } catch (e) {}
    }

    await setDoc(docRef, finalData);
    
    invalidateClientsCache();
    broadcastUpdate('UPDATE_CLIENTS');
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Falha ao atualizar cliente" });
  }
});

// Mark Client Ficha as Viewed by Admin (Protected)
app.post("/api/clients/:id/view-ficha", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) {
      const idx = mockClients.findIndex((c) => c.id === id);
      if (idx !== -1) {
        mockClients[idx].fichaVisualizada = true;
        syncData();
        invalidateClientsCache();
      }
      return res.json({ success: true });
    }
    const docRef = doc(db, "clients", id);
    await setDoc(docRef, { fichaVisualizada: true }, { merge: true });
    invalidateClientsCache();
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking ficha as viewed:", error);
    res.status(500).json({ error: "Falha ao marcar ficha como visualizada" });
  }
});

// Delete Client (Protected)
app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { id } = req.params;

    const clientSnap = await getDoc(doc(db, "clients", id));
    if (clientSnap.exists()) {
      try {
        const now = new Date();
        await db.collection("audit_history").add({
          type: "client_deleted",
          clientId: id,
          clientData: clientSnap.data(),
          timestamp: now.toISOString(),
          data: now.toISOString().split("T")[0],
          hora: now.toTimeString().split(" ")[0].slice(0, 5),
        });
      } catch (e) {}
    }

    await deleteDoc(doc(db, "clients", id));
      
    invalidateClientsCache();
    broadcastUpdate('UPDATE_CLIENTS');
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Falha ao excluir cliente" });
  }
});

// Restore Client (Protected)
app.post("/api/clients/:id/restore", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { id } = req.params;
    const clientData = req.body;
    await setDoc(doc(db, "clients", id), sanitizeForFirestore(clientData));
    invalidateClientsCache();
    broadcastUpdate('UPDATE_CLIENTS');
    res.json({ success: true });
  } catch (error) {
    console.error("Error restoring client:", error);
    res.status(500).json({ error: "Falha ao restaurar cliente" });
  }
});

// Restore deleted simulations from backup
app.post("/api/admin/restore-deleted-simulations", requireAdmin, async (req, res) => {
  try {
    const { data, horaInicio, horaFim } = req.body || {};
    const { restoreDeletedSimulations } = await import("./restore_deleted_data");
    const result = await restoreDeletedSimulations(false, { data, horaInicio, horaFim });
    invalidateClientsCache();
    broadcastUpdate('UPDATE_CLIENTS');
    res.json({
      success: true,
      message: result.message,
      restoredCount: result.restoredCount,
      details: result.details,
    });
  } catch (error: any) {
    console.error("Error running restore:", error);
    res.status(500).json({ error: error.message || "Falha ao restaurar dados" });
  }
});

// Get Chat Messages
app.get("/api/chat/:clientId", async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }
    const { clientId } = req.params;
    const q = query(collection(db, "chats", clientId, "messages"), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Falha ao buscar mensagens" });
  }
});

// Send Chat Message
app.post("/api/chat/:clientId", async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId } = req.params;
    const { text, sender, clientName } = req.body; // sender: 'admin' | 'client'
    const message = {
      text,
      sender,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add to subcollection
    const docRef = await addDoc(collection(db, "chats", clientId, "messages"), message);
    
    // Also update a summary document for the admin to see unread counts
    const chatDocRef = doc(db, "chats", clientId);
    const chatDoc = await getDoc(chatDocRef);
    
    const updateData: any = {
      lastMessage: text,
      lastMessageTimestamp: message.timestamp,
      lastSender: sender,
      unreadAdmin: sender === 'client' ? increment(1) : 0,
      unreadClient: sender === 'admin' ? increment(1) : 0,
    };
    
    if (clientName) {
      updateData.clientName = clientName;
    }

    await setDoc(chatDocRef, updateData, { merge: true });
    invalidateChatsCache();

    broadcastUpdate('CHAT_UPDATE', { clientId, newMessage: true, sender });
    res.json({ id: docRef.id, ...message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Falha ao enviar mensagem" });
  }
});

// Mark messages as read
app.put("/api/chat/:clientId/read", async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId } = req.params;
    const { reader } = req.body; // 'admin' | 'client'
    
    // Reset unread count
    const updateData = reader === 'admin' ? { unreadAdmin: 0 } : { unreadClient: 0 };
    await setDoc(doc(db, "chats", clientId), updateData, { merge: true });
    
    // Update individual messages
    const messagesRef = collection(db, "chats", clientId, "messages");
    const q = query(messagesRef, where("sender", "==", reader === 'admin' ? 'client' : 'admin'), where("read", "==", false));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
    invalidateChatsCache();
    
    broadcastUpdate('CHAT_READ', { clientId, reader });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ error: "Falha ao atualizar status" });
  }
});

const CHATS_CACHE_TTL_MS = 2 * 60 * 1000;
let cachedChatsList: any[] | null = null;
let lastKnownChatsList: any[] | null = null;
let lastChatsFetchTime = 0;

function invalidateChatsCache() {
  cachedChatsList = null;
  lastChatsFetchTime = 0;
}

// Get all chats summary for admin
app.get("/api/chats", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json([]);
    }
    const now = Date.now();
    if (cachedChatsList && now - lastChatsFetchTime < CHATS_CACHE_TTL_MS) {
      return res.json(cachedChatsList);
    }
    const q = query(collection(db, "chats"), orderBy("lastMessageTimestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cachedChatsList = chats;
    lastKnownChatsList = chats;
    lastChatsFetchTime = now;
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    if (lastKnownChatsList) {
      return res.json(lastKnownChatsList);
    }
    res.status(500).json({ error: "Falha ao buscar chats" });
  }
});

// Delete Chat Message
app.delete("/api/chat/:clientId/messages/:messageId", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId, messageId } = req.params;
    
    await deleteDoc(doc(db, "chats", clientId, "messages", messageId));
    invalidateChatsCache();
    
    broadcastUpdate('CHAT_UPDATE', { clientId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Falha ao apagar mensagem" });
  }
});

// Delete Chat
app.delete("/api/chat/:clientId", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId } = req.params;
    
    // Delete all messages in the subcollection
    const messagesRef = collection(db, "chats", clientId, "messages");
    const querySnapshot = await getDocs(messagesRef);
    
    if (!querySnapshot.empty) {
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
    // Delete the chat summary document
    await deleteDoc(doc(db, "chats", clientId));
    invalidateChatsCache();
    
    broadcastUpdate('CHAT_UPDATE', { clientId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Falha ao apagar conversa" });
  }
});

// Restore Chat
app.post("/api/chat/:clientId/restore", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId } = req.params;
    const { chatData, messages } = req.body;
    
    if (chatData) {
      await setDoc(doc(db, "chats", clientId), chatData);
    }
    
    if (messages && messages.length > 0) {
      const batch = writeBatch(db);
      messages.forEach((msg: any) => {
        const msgRef = doc(db, "chats", clientId, "messages", msg.id);
        batch.set(msgRef, msg);
      });
      await batch.commit();
    }
    
    broadcastUpdate('CHAT_UPDATE', { clientId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error restoring chat:", error);
    res.status(500).json({ error: "Falha ao restaurar conversa" });
  }
});

// Restore Message
app.post("/api/chat/:clientId/messages/:messageId/restore", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ success: true });
    }
    const { clientId, messageId } = req.params;
    const messageData = req.body;
    await setDoc(doc(db, "chats", clientId, "messages", messageId), messageData);
    
    const chatRef = doc(db, "chats", clientId);
    await setDoc(chatRef, {
      lastMessage: messageData.text,
      lastMessageTimestamp: messageData.timestamp,
      clientId: clientId
    }, { merge: true });

    broadcastUpdate('CHAT_UPDATE', { clientId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error restoring message:", error);
    res.status(500).json({ error: "Falha ao restaurar mensagem" });
  }
});

function generateHtmlReport(dbData: any): string {
  let html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>Relatório de Backup GM-Empréstimo</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; background-color: #f9fafb; }
      h1, h2 { color: #1a56db; }
      .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
      th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
      th { background-color: #f3f4f6; color: #374151; }
      .client-header { background-color: #e5e7eb; font-weight: bold; font-size: 16px; color: #111827; }
      .client-card { margin-bottom: 30px; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
      .client-card table { margin-bottom: 0; border: none; }
      .client-card th, .client-card td { border-left: none; border-right: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Relatório de Backup - GM-Empréstimo</h1>
      <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      
      <h2>Clientes e Empréstimos</h2>
  `;

  if (dbData.clients && dbData.clients.length > 0) {
    dbData.clients.forEach((client: any) => {
      html += `
      <div class="client-card">
        <table>
          <tr class="client-header">
            <td colspan="4">👤 Cliente: ${client.nomeCompleto || 'Sem Nome'} (CPF: ${client.cpf || '-'})</td>
          </tr>
          <tr>
            <td><strong>Celular:</strong> ${client.celular || '-'}</td>
            <td><strong>Cidade/UF:</strong> ${client.cidade || '-'} - ${client.estado || '-'}</td>
            <td><strong>Banco:</strong> ${client.banco || '-'}</td>
            <td><strong>Chave PIX:</strong> ${client.chavePix || '-'}</td>
          </tr>
        </table>
      `;

      if (client.emprestimos && client.emprestimos.length > 0) {
        html += `
        <div style="padding: 15px; background-color: #f8fafc; border-top: 1px solid #d1d5db;">
          <h4 style="margin-top: 0; color: #475569;">Empréstimos</h4>
          <table style="background: white; border: 1px solid #e2e8f0;">
            <tr>
              <th>Data</th>
              <th>Valor Solicitado</th>
              <th>Parcelas</th>
              <th>Status</th>
            </tr>
        `;
        client.emprestimos.forEach((emp: any) => {
          html += `
            <tr>
              <td>${emp.dataEmprestimo ? new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR') : '-'}</td>
              <td>R$ ${Number(emp.valorSolicitado || 0).toFixed(2)}</td>
              <td>${emp.parcelas ? emp.parcelas.length : 0} parcelas</td>
              <td>${emp.status || '-'}</td>
            </tr>
          `;
        });
        html += `
          </table>
        </div>
        `;
      } else {
        html += `<div style="padding: 10px 15px; color: #6b7280; font-style: italic; border-top: 1px solid #d1d5db;">Sem empréstimos registrados.</div>`;
      }
      
      html += `</div>`;
    });
  } else {
    html += `<p>Nenhum cliente encontrado.</p>`;
  }

  html += `
    </div>
  </body>
  </html>
  `;
  return html;
}

// Backup route for admin
app.get("/api/backup", requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({ error: "Database not initialized" });
    }
    const archive = new ZipArchive({ zlib: { level: 9 } });
    
    res.attachment(`backup_gm_${new Date().toISOString().slice(0, 10)}.zip`);
    archive.on('error', (err) => {
      console.error("Archive error:", err);
    });

    archive.pipe(res);

    // 1. Export Database
    const dbData: any = {};
    if (db) {
      const collectionsToBackup = ['clients', 'chats', 'admin'];
      for (const colName of collectionsToBackup) {
        try {
          const snapshot = await db.collection(colName).get();
          dbData[colName] = [];
          snapshot.forEach((doc: any) => {
            let data = doc.data();
            if (colName === 'clients' && typeof data.dados === 'string') {
               try {
                  const parsed = JSON.parse(data.dados);
                  data = { ...parsed, ...data };
                  delete data.dados;
               } catch(e) {}
            }
            dbData[colName].push({ id: doc.id, ...data });
          });
          
          if (colName === 'chats') {
             // Fetch messages subcollections
             for (const doc of snapshot.docs) {
                const msgsSnap = await db.collection('chats').doc(doc.id).collection('messages').get();
                const msgs: any[] = [];
                msgsSnap.forEach((m: any) => msgs.push({ id: m.id, ...m.data() }));
                const idx = dbData['chats'].findIndex((c: any) => c.id === doc.id);
                if (idx !== -1) dbData['chats'][idx].messages = msgs;
             }
          }
        } catch (e) {
          console.error(`Error backing up collection ${colName}:`, e);
        }
      }
      archive.append(JSON.stringify(dbData, null, 2), { name: 'database_backup.json' });
      
      // Generate readable HTML report
      const htmlReport = generateHtmlReport(dbData);
      archive.append(htmlReport, { name: 'relatorio_leitura.html' });
    }

    // 2. Export Storage Files
    if (storage) {
      try {
        const [files] = await storage.getFiles();
        for (const file of files) {
          const fileStream = file.createReadStream();
          archive.append(fileStream, { name: `storage/${file.name}` });
        }
      } catch (e) {
        console.error("Error backing up files:", e);
        archive.append(JSON.stringify({ error: "Failed to backup files", details: String(e) }), { name: 'storage_errors.txt' });
      }
    }

    await archive.finalize();
  } catch (error: any) {
    console.error("Backup generation failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Falha ao gerar backup", details: error.message });
    }
  }
});

// --- AUTOMATIC WHATSAPP SCHEDULE ENGINE & ROUTES ---

const loadAllClientsForSchedule = async (): Promise<any[]> => {
  if (!db) {
    return mockClients.map((c) => mergeClientDocData(c.id, c));
  }
  const now = Date.now();
  if (cachedRawClientsList && now - lastClientsFetchTime < CLIENTS_CACHE_TTL_MS) {
    return cachedRawClientsList;
  }
  try {
    const snap = await db.collection("clients").get();
    const rawClients = snap.docs.map((d: any) => mergeClientDocData(d.id, d.data()));
    cachedRawClientsList = rawClients;
    lastKnownRawClientsList = rawClients;
    cachedClientsList = rawClients.map(sanitizeClientForList);
    lastKnownClientsList = cachedClientsList;
    lastClientsFetchTime = now;
    return rawClients;
  } catch (err) {
    if (lastKnownRawClientsList) {
      return lastKnownRawClientsList;
    }
    throw err;
  }
};

const SCHEDULE_LOGS_CACHE_TTL_MS = 2 * 60 * 1000;
let cachedScheduleLogs: ScheduledWhatsAppNotification[] | null = null;
let lastKnownScheduleLogs: ScheduledWhatsAppNotification[] | null = null;
let lastScheduleLogsFetchTime = 0;

function invalidateScheduleLogsCache() {
  cachedScheduleLogs = null;
  lastScheduleLogsFetchTime = 0;
}

const loadScheduleLogsFromStore = async (): Promise<ScheduledWhatsAppNotification[]> => {
  if (!db) {
    return [...mockScheduleLogs].sort((a, b) =>
      (b.dateISO || "").localeCompare(a.dateISO || "") ||
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );
  }
  const now = Date.now();
  if (cachedScheduleLogs && now - lastScheduleLogsFetchTime < SCHEDULE_LOGS_CACHE_TTL_MS) {
    return cachedScheduleLogs;
  }
  try {
    const snap = await db
      .collection("whatsapp_schedule_logs")
      .orderBy("createdAt", "desc")
      .limit(400)
      .get();
    const list = snap.docs.map((d: any) => ({ ...d.data(), id: d.id } as ScheduledWhatsAppNotification));
    cachedScheduleLogs = list;
    lastKnownScheduleLogs = list;
    lastScheduleLogsFetchTime = now;
    return list;
  } catch (err) {
    if (lastKnownScheduleLogs) {
      return lastKnownScheduleLogs;
    }
    throw err;
  }
};

const saveScheduleLogToStore = async (item: ScheduledWhatsAppNotification) => {
  const sanitized = sanitizeForFirestore(item);
  if (!db) {
    const idx = mockScheduleLogs.findIndex((l) => l.id === item.id);
    if (idx >= 0) {
      mockScheduleLogs[idx] = sanitized;
    } else {
      mockScheduleLogs.unshift(sanitized);
      if (mockScheduleLogs.length > 500) {
        mockScheduleLogs = mockScheduleLogs.slice(0, 500);
      }
    }
    syncData();
    return;
  }
  await setDoc(doc(db, "whatsapp_schedule_logs", item.id), sanitized, { merge: true });
  invalidateScheduleLogsCache();
};

const sendNotificationViaWebhook = async (
  item: ScheduledWhatsAppNotification,
  webhookUrl: string,
  webhookToken: string,
): Promise<{ ok: boolean; error?: string }> => {
  if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
    return { ok: false, error: "URL do Webhook/API inválida ou não configurada." };
  }
  if (!item.phoneDigits || item.phoneDigits.length < 10) {
    return { ok: false, error: "Telefone do destinatário inválido ou ausente." };
  }
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (webhookToken) {
      headers["Authorization"] = webhookToken.startsWith("Bearer ")
        ? webhookToken
        : `Bearer ${webhookToken}`;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        id: item.id,
        clientId: item.clientId,
        clientName: item.clientName,
        clientCpf: item.clientCpf,
        phone: item.phone,
        phoneDigits: item.phoneDigits,
        number: item.phoneDigits,
        message: item.message,
        text: item.message,
        situacao: item.situacao,
        parcelaNumero: item.parcelaNumero,
        dataVencimento: item.dataVencimento,
        valor: item.valor,
        valorDivida: item.valorDivida,
        dias: item.dias,
        dateISO: item.dateISO,
      }),
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return {
        ok: false,
        error: `HTTP ${resp.status}${txt ? `: ${txt.slice(0, 140)}` : ""}`,
      };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Falha na requisição do Webhook" };
  }
};

let isSchedulerRunning = false;

const runAutoWhatsAppSchedule = async (options: {
  trigger: "automatic" | "manual";
  dateISO?: string;
}) => {
  if (isSchedulerRunning) {
    return { alreadyRunning: true, generated: 0, sent: 0, pending: 0, errors: 0, dateISO: options.dateISO || getBrazilTodayISO() };
  }
  isSchedulerRunning = true;
  const targetDateISO = options.dateISO || getBrazilTodayISO();
  try {
    const settings = await loadServerSettings();
    const config = normalizeAutoScheduleConfig(settings.autoScheduleConfig);
    const clients = await loadAllClientsForSchedule();
    const existingLogs = await loadScheduleLogsFromStore();
    const existingMap = new Map(existingLogs.map((l) => [l.id, l]));

    const candidates = evaluateAutoScheduleNotifications(clients, settings, targetDateISO);

    let generated = 0;
    let sent = 0;
    let pending = 0;
    let errors = 0;
    const processedItems: ScheduledWhatsAppNotification[] = [];

    for (const candidate of candidates) {
      const existing = existingMap.get(candidate.id);
      if (existing && (existing.status === "enviado" || existing.status === "ignorado")) {
        continue;
      }

      let itemToSave: ScheduledWhatsAppNotification = existing
        ? {
            ...existing,
            phone: candidate.phone,
            phoneDigits: candidate.phoneDigits,
            hasCustomPhone: candidate.hasCustomPhone,
            valor: candidate.valor,
            valorDivida: candidate.valorDivida,
            dias: candidate.dias,
            message: candidate.message,
          }
        : { ...candidate };

      if (!existing) generated++;

      if (config.modoEnvio === "webhook_api") {
        if (config.webhookUrl) {
          const result = await sendNotificationViaWebhook(
            itemToSave,
            config.webhookUrl,
            config.webhookToken,
          );
          if (result.ok) {
            itemToSave = {
              ...itemToSave,
              status: "enviado",
              sentAt: new Date().toISOString(),
              deliveryMethod: "webhook_api",
              errorMessage: "",
            };
            sent++;
          } else {
            itemToSave = {
              ...itemToSave,
              status: "erro",
              deliveryMethod: "webhook_api",
              errorMessage: result.error || "Erro ao enviar via Webhook",
            };
            errors++;
          }
        } else {
          itemToSave = {
            ...itemToSave,
            status: "erro",
            deliveryMethod: "webhook_api",
            errorMessage: "URL do Webhook/API não configurada nas Configurações.",
          };
          errors++;
        }
      } else {
        itemToSave = {
          ...itemToSave,
          status: "pendente",
          deliveryMethod: "whatsapp_business",
          errorMessage: !itemToSave.phoneDigits || itemToSave.phoneDigits.length < 10
            ? "Cliente sem celular válido cadastrado"
            : "",
        };
        pending++;
      }

      await saveScheduleLogToStore(itemToSave);
      processedItems.push(itemToSave);
    }

    const updatedAutoConfig = {
      ...config,
      lastRunDate: targetDateISO,
      lastRunAt: new Date().toISOString(),
    };
    if (!db) {
      mockSettings = { ...(mockSettings || {}), autoScheduleConfig: updatedAutoConfig };
      syncData();
    } else {
      await setDoc(
        doc(db, "admin_settings", "1"),
        sanitizeForFirestore({ autoScheduleConfig: updatedAutoConfig }),
        { merge: true },
      );
      invalidateSettingsCache();
    }

    broadcastUpdate("AUTO_SCHEDULE_RUN", {
      dateISO: targetDateISO,
      trigger: options.trigger,
      totalEvaluated: candidates.length,
      generated,
      sent,
      pending,
      errors,
      modoEnvio: config.modoEnvio,
      timestamp: updatedAutoConfig.lastRunAt,
    });

    if (candidates.length > 0) {
      void runPaymentReminderPushCheck({
        trigger: "schedule",
        dateISO: targetDateISO,
      });
    }

    return {
      alreadyRunning: false,
      dateISO: targetDateISO,
      totalEvaluated: candidates.length,
      generated,
      sent,
      pending,
      errors,
      items: processedItems,
    };
  } finally {
    isSchedulerRunning = false;
  }
};

// --- WEB PUSH NOTIFICATIONS ENGINE (SERVICE WORKERS + VAPID) ---

interface StoredPushSubscription {
  id: string;
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceLabel: string;
  createdAt: string;
  lastSuccessAt?: string;
}

let cachedVapidKeys: { publicKey: string; privateKey: string; subject: string } | null = null;

const getEndpointHashId = (endpoint: string) =>
  crypto.createHash("sha256").update(String(endpoint || "")).digest("hex").slice(0, 32);

const ensureVapidKeys = async (): Promise<{ publicKey: string; privateKey: string; subject: string }> => {
  if (cachedVapidKeys) {
    return cachedVapidKeys;
  }

  const subject = process.env.VAPID_SUBJECT || "mailto:gmprestadoradeservicos.10@gmail.com";

  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    cachedVapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY.trim(),
      privateKey: process.env.VAPID_PRIVATE_KEY.trim(),
      subject,
    };
    webpush.setVapidDetails(cachedVapidKeys.subject, cachedVapidKeys.publicKey, cachedVapidKeys.privateKey);
    return cachedVapidKeys;
  }

  if (!db) {
    if (mockVapidKeys?.publicKey && mockVapidKeys?.privateKey) {
      cachedVapidKeys = { ...mockVapidKeys, subject: mockVapidKeys.subject || subject };
    } else {
      const generated = webpush.generateVAPIDKeys();
      cachedVapidKeys = {
        publicKey: generated.publicKey,
        privateKey: generated.privateKey,
        subject,
      };
      mockVapidKeys = cachedVapidKeys;
      syncData();
    }
    webpush.setVapidDetails(cachedVapidKeys.subject, cachedVapidKeys.publicKey, cachedVapidKeys.privateKey);
    return cachedVapidKeys;
  }

  const vapidDocRef = doc(db, "admin_settings", "push_vapid");
  const vapidSnap = await getDoc(vapidDocRef);
  if (vapidSnap.exists()) {
    const existing = vapidSnap.data();
    if (existing?.publicKey && existing?.privateKey) {
      cachedVapidKeys = {
        publicKey: String(existing.publicKey),
        privateKey: String(existing.privateKey),
        subject: String(existing.subject || subject),
      };
      webpush.setVapidDetails(cachedVapidKeys.subject, cachedVapidKeys.publicKey, cachedVapidKeys.privateKey);
      return cachedVapidKeys;
    }
  }

  const generated = webpush.generateVAPIDKeys();
  cachedVapidKeys = {
    publicKey: generated.publicKey,
    privateKey: generated.privateKey,
    subject,
  };
  await setDoc(vapidDocRef, {
    ...cachedVapidKeys,
    createdAt: new Date().toISOString(),
  });
  webpush.setVapidDetails(cachedVapidKeys.subject, cachedVapidKeys.publicKey, cachedVapidKeys.privateKey);
  return cachedVapidKeys;
};

const PUSH_SUBS_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedPushSubscriptions: StoredPushSubscription[] | null = null;
let lastPushSubsFetchTime = 0;

function invalidatePushSubscriptionsCache() {
  cachedPushSubscriptions = null;
  lastPushSubsFetchTime = 0;
}

const loadPushSubscriptionsFromStore = async (): Promise<StoredPushSubscription[]> => {
  if (!db) {
    return [...mockPushSubscriptions];
  }
  const now = Date.now();
  if (cachedPushSubscriptions && now - lastPushSubsFetchTime < PUSH_SUBS_CACHE_TTL_MS) {
    return cachedPushSubscriptions;
  }
  const snap = await db.collection("push_subscriptions").get();
  const list = snap.docs.map((d: any) => ({ ...d.data(), id: d.id } as StoredPushSubscription));
  cachedPushSubscriptions = list;
  lastPushSubsFetchTime = now;
  return list;
};

const upsertPushSubscriptionToStore = async (
  subscription: { endpoint: string; expirationTime?: number | null; keys: { p256dh: string; auth: string } },
  deviceLabel: string,
): Promise<StoredPushSubscription> => {
  const id = getEndpointHashId(subscription.endpoint);
  const nowISO = new Date().toISOString();
  const record: StoredPushSubscription = {
    id,
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    deviceLabel: deviceLabel || "Navegador",
    createdAt: nowISO,
    lastSuccessAt: nowISO,
  };

  if (!db) {
    const idx = mockPushSubscriptions.findIndex((s) => s.id === id || s.endpoint === record.endpoint);
    if (idx >= 0) {
      record.createdAt = mockPushSubscriptions[idx].createdAt || nowISO;
      mockPushSubscriptions[idx] = record;
    } else {
      mockPushSubscriptions.push(record);
    }
    syncData();
    return record;
  }

  const existingSnap = await getDoc(doc(db, "push_subscriptions", id));
  if (existingSnap.exists()) {
    record.createdAt = existingSnap.data()?.createdAt || nowISO;
  }
  await setDoc(doc(db, "push_subscriptions", id), sanitizeForFirestore(record), { merge: true });
  invalidatePushSubscriptionsCache();
  return record;
};

const deletePushSubscriptionFromStore = async (criteria: { id?: string; endpoint?: string }) => {
  const targetId = criteria.id || (criteria.endpoint ? getEndpointHashId(criteria.endpoint) : "");
  if (!targetId && !criteria.endpoint) return;

  if (!db) {
    mockPushSubscriptions = mockPushSubscriptions.filter(
      (s) => s.id !== targetId && (!criteria.endpoint || s.endpoint !== criteria.endpoint),
    );
    syncData();
    return;
  }

  if (targetId) {
    await deleteDoc(doc(db, "push_subscriptions", targetId));
    invalidatePushSubscriptionsCache();
  }
};

const loadPushSentKeysForDate = async (dateISO: string): Promise<Set<string>> => {
  if (!db) {
    return new Set(mockPushSentKeys.filter((k) => k.dateISO === dateISO).map((k) => k.id));
  }
  const snap = await db
    .collection("push_sent_logs")
    .where("dateISO", "==", dateISO)
    .get();
  return new Set(snap.docs.map((d: any) => d.id));
};

const markPushKeysAsSent = async (keys: string[], dateISO: string) => {
  if (keys.length === 0) return;
  const sentAt = new Date().toISOString();
  if (!db) {
    const existingSet = new Set(mockPushSentKeys.map((k) => k.id));
    for (const id of keys) {
      if (!existingSet.has(id)) {
        mockPushSentKeys.unshift({ id, dateISO, sentAt });
      }
    }
    if (mockPushSentKeys.length > 1000) {
      mockPushSentKeys = mockPushSentKeys.slice(0, 1000);
    }
    syncData();
    return;
  }
  const batch = writeBatch(db);
  for (const id of keys) {
    batch.set(doc(db, "push_sent_logs", id), { id, dateISO, sentAt }, { merge: true });
  }
  await batch.commit();
};

const sendAdminWebPushNotification = async (
  payload: {
    title: string;
    body: string;
    tag?: string;
    url?: string;
    type?: "new_client" | "payment_reminder" | "test" | "info";
    clientId?: string;
    tab?: string;
    requireInteraction?: boolean;
    data?: Record<string, any>;
  },
  onlyEndpoint?: string,
  options?: { bypassQuietHours?: boolean },
): Promise<{
  total: number;
  sent: number;
  failed: number;
  removed: number;
  suppressedByQuietHours?: boolean;
}> => {
  if (!options?.bypassQuietHours) {
    try {
      const settings = await loadServerSettings();
      const quietCfg = normalizeQuietHoursConfig(settings.quietHoursConfig);
      if (isTimeInQuietWindow(quietCfg, getBrazilTimeHHMM())) {
        return {
          total: 0,
          sent: 0,
          failed: 0,
          removed: 0,
          suppressedByQuietHours: true,
        };
      }
    } catch {}
  }

  await ensureVapidKeys();
  const allSubs = await loadPushSubscriptionsFromStore();
  const targets = onlyEndpoint
    ? allSubs.filter((s) => s.endpoint === onlyEndpoint)
    : allSubs;

  if (targets.length === 0) {
    return { total: 0, sent: 0, failed: 0, removed: 0 };
  }

  const serializedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: payload.tag || "gm-emprestimo-push",
    url: payload.url || "/?view=admin",
    type: payload.type || "info",
    clientId: payload.clientId || "",
    tab: payload.tab || "",
    requireInteraction: payload.requireInteraction !== false,
    data: {
      ...(payload.data || {}),
      url: payload.url || "/?view=admin",
      type: payload.type || "info",
      clientId: payload.clientId || "",
      tab: payload.tab || "",
    },
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  await Promise.allSettled(
    targets.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            expirationTime: sub.expirationTime ?? null,
            keys: sub.keys,
          },
          serializedPayload,
          { TTL: 60 * 60 * 12 },
        );
        sent++;
        if (!db) {
          const idx = mockPushSubscriptions.findIndex((s) => s.id === sub.id);
          if (idx >= 0) mockPushSubscriptions[idx].lastSuccessAt = new Date().toISOString();
        } else {
          await setDoc(
            doc(db, "push_subscriptions", sub.id),
            { lastSuccessAt: new Date().toISOString() },
            { merge: true },
          );
        }
      } catch (err: any) {
        const statusCode = Number(err?.statusCode || err?.status || 0);
        if (statusCode === 404 || statusCode === 410) {
          removed++;
          await deletePushSubscriptionFromStore({ id: sub.id, endpoint: sub.endpoint });
        } else {
          failed++;
          console.error(`[WebPush] Falha ao enviar para ${sub.deviceLabel} (${statusCode}):`, err?.message || err);
        }
      }
    }),
  );

  if (!db && (sent > 0 || removed > 0)) {
    syncData();
  }

  return { total: targets.length, sent, failed, removed };
};

const notifyNewClientPush = async (client: {
  id: string;
  nomeCompleto?: string;
  cpf?: string;
  valorSolicitado?: string | number | null;
}) => {
  try {
    const settings = await loadServerSettings();
    const pushCfg = normalizePushConfig(settings.pushConfig);
    if (!pushCfg.enabled || !pushCfg.notifyNewClients) return;

    const quietCfg = normalizeQuietHoursConfig(settings.quietHoursConfig);
    if (isTimeInQuietWindow(quietCfg, getBrazilTimeHHMM())) {
      console.log(
        `[WebPush] Notificação de novo cadastro suprimida pela janela de silêncio (${quietCfg.startTime} - ${quietCfg.endTime}).`,
      );
      return;
    }

    const valorNum = Number(client.valorSolicitado);
    const valorLabel =
      client.valorSolicitado && Number.isFinite(valorNum) && valorNum > 0
        ? ` • Valor: R$ ${valorNum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "";

    await sendAdminWebPushNotification({
      title: "📋 Novo Cadastro Recebido!",
      body: `${client.nomeCompleto || "Novo Cliente"}${client.cpf ? ` • CPF: ${client.cpf}` : ""}${valorLabel}`,
      tag: `gm-new-client-${client.id}`,
      type: "new_client",
      clientId: client.id,
      tab: "clientes",
      url: `/?view=admin&tab=clientes&clientId=${encodeURIComponent(client.id)}`,
      requireInteraction: true,
    });
  } catch (err) {
    console.error("[WebPush] Erro ao notificar novo cadastro:", err);
  }
};

let isPushReminderRunning = false;

const runPaymentReminderPushCheck = async (options: {
  trigger: "automatic" | "manual" | "schedule";
  dateISO?: string;
  force?: boolean;
}) => {
  if (isPushReminderRunning) {
    return { alreadyRunning: true, evaluated: 0, dispatched: 0, sent: 0, dateISO: options.dateISO || getBrazilTodayISO() };
  }
  isPushReminderRunning = true;
  const targetDateISO = options.dateISO || getBrazilTodayISO();

  try {
    const settings = await loadServerSettings();
    const pushCfg = normalizePushConfig(settings.pushConfig);
    const quietCfg = normalizeQuietHoursConfig(settings.quietHoursConfig);

    if (!options.force && (!pushCfg.enabled || !pushCfg.notifyPaymentReminders)) {
      return { alreadyRunning: false, evaluated: 0, dispatched: 0, sent: 0, dateISO: targetDateISO, skipped: "disabled" };
    }

    if (!options.force && isTimeInQuietWindow(quietCfg, getBrazilTimeHHMM())) {
      return { alreadyRunning: false, evaluated: 0, dispatched: 0, sent: 0, dateISO: targetDateISO, skipped: "quiet_hours" };
    }

    const subs = await loadPushSubscriptionsFromStore();
    if (subs.length === 0) {
      return { alreadyRunning: false, evaluated: 0, dispatched: 0, sent: 0, dateISO: targetDateISO, skipped: "no_subscriptions" };
    }

    const clients = await loadAllClientsForSchedule();
    const evalSettings = {
      ...settings,
      autoScheduleConfig: {
        ...normalizeAutoScheduleConfig(settings.autoScheduleConfig),
        enabled: true,
        enviarPreVencimento: pushCfg.incluirPreVencimento,
        preVencimentoModo: "janela" as const,
        enviarVenceHoje: pushCfg.incluirVenceHoje,
        enviarVencido: pushCfg.incluirVencido,
        frequenciaVencidoDias: "1",
        enviarCongelado: pushCfg.incluirCongelado7Dias,
        frequenciaCongeladoDias: "1",
        incluirEmprestimos: true,
        incluirLembretesAbater: true,
      },
    };

    const candidates = evaluateAutoScheduleNotifications(clients, evalSettings, targetDateISO);
    const sentKeysForDate = options.force ? new Set<string>() : await loadPushSentKeysForDate(targetDateISO);

    const pendingToPush = candidates.filter((item) => !sentKeysForDate.has(`push::${targetDateISO}::${item.id}`));
    if (pendingToPush.length === 0) {
      return { alreadyRunning: false, evaluated: candidates.length, dispatched: 0, sent: 0, dateISO: targetDateISO };
    }

    const situacaoLabels: Record<string, string> = {
      vence_hoje: "Vence Hoje",
      pre_vencimento: "Vencimento Próximo",
      vencido: "Parcela em Atraso",
      congelado: "Juros Congelados (Prazo 7 dias)",
    };

    const priorityOrder = (s: string) =>
      s === "vence_hoje" ? 0 : s === "congelado" ? 1 : s === "vencido" ? 2 : 3;
    const sorted = [...pendingToPush].sort((a, b) => priorityOrder(a.situacao) - priorityOrder(b.situacao));

    const individualSlice = sorted.slice(0, 3);
    let totalSentDeliveries = 0;

    for (const item of individualSlice) {
      const sitLabel = situacaoLabels[item.situacao] || "Lembrete de Pagamento";
      const refText = item.parcelaNumero > 0 ? `Parcela ${item.parcelaNumero}` : "Lembrete (Abater)";
      const res = await sendAdminWebPushNotification(
        {
          title: `⏰ ${sitLabel}: ${item.clientName}`,
          body: `${refText} • Venc.: ${item.dataVencimento} • Valor: ${item.valor}`,
          tag: `gm-reminder-${targetDateISO}-${item.id}`,
          type: "payment_reminder",
          clientId: item.clientId,
          tab: "lembretes",
          url: `/?view=admin&tab=lembretes&clientId=${encodeURIComponent(item.clientId)}`,
          requireInteraction: item.situacao === "vence_hoje" || item.situacao === "congelado",
        },
        undefined,
        { bypassQuietHours: Boolean(options.force) },
      );
      totalSentDeliveries += res.sent;
    }

    if (sorted.length > 3) {
      const extraCount = sorted.length - 3;
      const venceHojeCount = sorted.filter((i) => i.situacao === "vence_hoje").length;
      const vencidoCount = sorted.filter((i) => i.situacao === "vencido").length;
      const congeladoCount = sorted.filter((i) => i.situacao === "congelado").length;
      const parts = [
        venceHojeCount > 0 ? `${venceHojeCount} vence hoje` : "",
        congeladoCount > 0 ? `${congeladoCount} congelado(s)` : "",
        vencidoCount > 0 ? `${vencidoCount} em atraso` : "",
      ].filter(Boolean);

      const sumRes = await sendAdminWebPushNotification(
        {
          title: `💰 ${sorted.length} Lembretes de Pagamento Pendentes`,
          body: `Mais ${extraCount} cobrança(s) hoje${parts.length > 0 ? ` (${parts.join(" • ")})` : ""}. Toque para abrir a fila.`,
          tag: `gm-reminder-summary-${targetDateISO}`,
          type: "payment_reminder",
          tab: "lembretes",
          url: "/?view=admin&tab=lembretes",
          requireInteraction: true,
        },
        undefined,
        { bypassQuietHours: Boolean(options.force) },
      );
      totalSentDeliveries += sumRes.sent;
    }

    await markPushKeysAsSent(
      sorted.map((item) => `push::${targetDateISO}::${item.id}`),
      targetDateISO,
    );

    const updatedPushConfig: PushNotificationConfig = {
      ...pushCfg,
      lastReminderPushDate: targetDateISO,
      lastReminderPushAt: new Date().toISOString(),
    };
    if (!db) {
      mockSettings = { ...(mockSettings || {}), pushConfig: updatedPushConfig };
      syncData();
    } else {
      await setDoc(
        doc(db, "admin_settings", "1"),
        sanitizeForFirestore({ pushConfig: updatedPushConfig }),
        { merge: true },
      );
      invalidateSettingsCache();
    }

    return {
      alreadyRunning: false,
      dateISO: targetDateISO,
      evaluated: candidates.length,
      dispatched: sorted.length,
      sent: totalSentDeliveries,
    };
  } finally {
    isPushReminderRunning = false;
  }
};

app.get("/api/push/status", requireAdmin, async (req, res) => {
  try {
    const vapid = await ensureVapidKeys();
    const settings = await loadServerSettings();
    const subs = await loadPushSubscriptionsFromStore();
    const quietHoursConfig = normalizeQuietHoursConfig(settings.quietHoursConfig);
    res.json({
      supported: true,
      publicKey: vapid.publicKey,
      config: normalizePushConfig(settings.pushConfig),
      quietHoursConfig,
      quietHoursActive: isTimeInQuietWindow(quietHoursConfig, getBrazilTimeHHMM()),
      subscriptionCount: subs.length,
      subscriptions: subs.map((s) => ({
        id: s.id,
        endpoint: s.endpoint,
        deviceLabel: s.deviceLabel,
        createdAt: s.createdAt,
        lastSuccessAt: s.lastSuccessAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching push status:", error);
    res.status(500).json({ error: "Falha ao carregar status das notificações push" });
  }
});

app.post("/api/push/subscribe", requireAdmin, async (req, res) => {
  try {
    const { subscription, deviceLabel } = req.body || {};
    if (
      !subscription ||
      typeof subscription.endpoint !== "string" ||
      !subscription.endpoint.startsWith("http") ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return res.status(400).json({ error: "Assinatura Web Push inválida." });
    }
    const saved = await upsertPushSubscriptionToStore(subscription, String(deviceLabel || "Navegador"));
    res.json({
      success: true,
      subscription: {
        id: saved.id,
        endpoint: saved.endpoint,
        deviceLabel: saved.deviceLabel,
        createdAt: saved.createdAt,
        lastSuccessAt: saved.lastSuccessAt,
      },
    });
  } catch (error: any) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ error: "Falha ao registrar dispositivo para notificações push" });
  }
});

app.delete("/api/push/subscribe", requireAdmin, async (req, res) => {
  try {
    const endpoint = typeof req.body?.endpoint === "string"
      ? req.body.endpoint
      : typeof req.query?.endpoint === "string"
        ? req.query.endpoint
        : undefined;
    const id = typeof req.body?.id === "string"
      ? req.body.id
      : typeof req.query?.id === "string"
        ? req.query.id
        : undefined;

    await deletePushSubscriptionFromStore({ id, endpoint });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting push subscription:", error);
    res.status(500).json({ error: "Falha ao remover dispositivo push" });
  }
});

app.put("/api/push/config", requireAdmin, async (req, res) => {
  try {
    const currentSettings = await loadServerSettings();
    const merged = normalizePushConfig({
      ...currentSettings.pushConfig,
      ...(req.body || {}),
      lastReminderPushDate: currentSettings.pushConfig?.lastReminderPushDate || "",
      lastReminderPushAt: currentSettings.pushConfig?.lastReminderPushAt || "",
    });
    if (!db) {
      mockSettings = { ...(mockSettings || {}), pushConfig: merged };
      syncData();
    } else {
      await setDoc(
        doc(db, "admin_settings", "1"),
        sanitizeForFirestore({ pushConfig: merged }),
        { merge: true },
      );
      invalidateSettingsCache();
    }
    broadcastUpdate("UPDATE_SETTINGS");
    res.json({ success: true, config: merged });
  } catch (error: any) {
    console.error("Error updating push config:", error);
    res.status(500).json({ error: "Falha ao salvar preferências de push" });
  }
});

app.post("/api/push/test", requireAdmin, async (req, res) => {
  try {
    const onlyEndpoint = typeof req.body?.endpoint === "string" ? req.body.endpoint : undefined;
    const scenario = req.body?.scenario === "new_client" ? "new_client" : "general";

    const settings = await loadServerSettings();
    const quietHoursActive = isTimeInQuietWindow(
      normalizeQuietHoursConfig(settings.quietHoursConfig),
      getBrazilTimeHHMM(),
    );
    const bypassQuietHours = req.body?.bypassQuietHours !== false;

    if (scenario === "new_client") {
      const sampleName =
        typeof req.body?.clientName === "string" && req.body.clientName.trim()
          ? req.body.clientName.trim()
          : "Cliente Exemplo (Teste)";
      const sampleCpf =
        typeof req.body?.cpf === "string" && req.body.cpf.trim()
          ? req.body.cpf.trim()
          : "123.456.789-00";
      const sampleVal = Number(req.body?.valorSolicitado);
      const valorLabel =
        Number.isFinite(sampleVal) && sampleVal > 0
          ? ` • Valor: R$ ${sampleVal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : " • Valor: R$ 1.500,00";

      const result = await sendAdminWebPushNotification(
        {
          title: "📋 Novo Cadastro Recebido! (Teste)",
          body: `${sampleName} • CPF: ${sampleCpf}${valorLabel}`,
          tag: `gm-push-test-new-client-${Date.now()}`,
          type: "new_client",
          tab: "clientes",
          url: "/?view=admin&tab=clientes",
          requireInteraction: true,
        },
        onlyEndpoint,
        { bypassQuietHours },
      );
      return res.json({ success: true, scenario, quietHoursActive, ...result });
    }

    const result = await sendAdminWebPushNotification(
      {
        title: "🔔 Notificação Push Ativa — GM-Empréstimo",
        body: "Teste concluído! Você receberá novos cadastros e lembretes de pagamento em tempo real, mesmo em segundo plano.",
        tag: `gm-push-test-${Date.now()}`,
        type: "test",
        tab: "configuracoes",
        url: "/?view=admin&tab=configuracoes",
        requireInteraction: false,
      },
      onlyEndpoint,
      { bypassQuietHours },
    );
    res.json({ success: true, scenario, quietHoursActive, ...result });
  } catch (error: any) {
    console.error("Error sending test push:", error);
    res.status(500).json({ error: error?.message || "Falha ao enviar notificação push de teste" });
  }
});

app.post("/api/push/send-reminders-now", requireAdmin, async (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const result = await runPaymentReminderPushCheck({
      trigger: "manual",
      dateISO: getBrazilTodayISO(),
      force,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error triggering payment reminder push:", error);
    res.status(500).json({ error: error?.message || "Falha ao disparar lembretes push" });
  }
});

app.get("/api/whatsapp-schedule", requireAdmin, async (req, res) => {
  try {
    const settings = await loadServerSettings();
    const logs = await loadScheduleLogsFromStore();
    const todayISO = getBrazilTodayISO();
    const currentTimeSP = getBrazilTimeHHMM();
    const filterDate = typeof req.query.date === "string" ? req.query.date : "";
    const filteredLogs = filterDate
      ? logs.filter((l) => l.dateISO === filterDate)
      : logs;

    const todayLogs = logs.filter((l) => l.dateISO === todayISO);
    const summary = {
      todayTotal: todayLogs.length,
      todayPending: todayLogs.filter((l) => l.status === "pendente").length,
      todaySent: todayLogs.filter((l) => l.status === "enviado").length,
      todayErrors: todayLogs.filter((l) => l.status === "erro").length,
      todayIgnored: todayLogs.filter((l) => l.status === "ignorado").length,
    };

    res.json({
      logs: filteredLogs,
      config: settings.autoScheduleConfig,
      todayISO,
      currentTimeSP,
      summary,
    });
  } catch (error: any) {
    console.error("Error fetching whatsapp schedule:", error);
    res.status(500).json({ error: "Falha ao buscar fila de agendamentos" });
  }
});

app.post("/api/whatsapp-schedule/run", requireAdmin, async (req, res) => {
  try {
    const dateISO =
      typeof req.body?.dateISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.body.dateISO)
        ? req.body.dateISO
        : getBrazilTodayISO();
    const result = await runAutoWhatsAppSchedule({
      trigger: "manual",
      dateISO,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error running manual whatsapp schedule:", error);
    res.status(500).json({ error: error?.message || "Falha ao executar agendamento" });
  }
});

app.patch("/api/whatsapp-schedule/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, phone, message, deliveryMethod, errorMessage } = req.body || {};
    const logs = await loadScheduleLogsFromStore();
    const existing = logs.find((l) => l.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    const updatedPhone = phone !== undefined ? String(phone) : existing.phone;
    const updatedDigits = updatedPhone.replace(/\D/g, "");
    const normalizedDigits =
      updatedDigits.length > 11 && updatedDigits.startsWith("55")
        ? updatedDigits
        : updatedDigits
          ? `55${updatedDigits}`
          : "";

    const updated: ScheduledWhatsAppNotification = {
      ...existing,
      ...(status ? { status } : {}),
      ...(message !== undefined ? { message: String(message) } : {}),
      ...(phone !== undefined ? { phone: updatedPhone, phoneDigits: normalizedDigits } : {}),
      ...(deliveryMethod ? { deliveryMethod } : {}),
      ...(errorMessage !== undefined ? { errorMessage: String(errorMessage) } : {}),
      ...(status === "enviado" ? { sentAt: new Date().toISOString(), errorMessage: "" } : {}),
    };

    await saveScheduleLogToStore(updated);
    res.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("Error updating schedule log:", error);
    res.status(500).json({ error: "Falha ao atualizar agendamento" });
  }
});

app.post("/api/whatsapp-schedule/:id/resend", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await loadScheduleLogsFromStore();
    const existing = logs.find((l) => l.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    const settings = await loadServerSettings();
    const config = normalizeAutoScheduleConfig(settings.autoScheduleConfig);
    if (config.modoEnvio === "webhook_api" && config.webhookUrl) {
      const result = await sendNotificationViaWebhook(
        existing,
        config.webhookUrl,
        config.webhookToken,
      );
      const updated: ScheduledWhatsAppNotification = result.ok
        ? {
            ...existing,
            status: "enviado",
            sentAt: new Date().toISOString(),
            deliveryMethod: "webhook_api",
            errorMessage: "",
          }
        : {
            ...existing,
            status: "erro",
            deliveryMethod: "webhook_api",
            errorMessage: result.error || "Erro ao reenviar",
          };
      await saveScheduleLogToStore(updated);
      return res.json({ success: result.ok, item: updated, error: result.error });
    }
    const resetItem: ScheduledWhatsAppNotification = {
      ...existing,
      status: "pendente",
      errorMessage: "",
    };
    await saveScheduleLogToStore(resetItem);
    res.json({ success: true, item: resetItem });
  } catch (error: any) {
    console.error("Error resending schedule item:", error);
    res.status(500).json({ error: "Falha ao reenviar agendamento" });
  }
});

app.delete("/api/whatsapp-schedule/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) {
      mockScheduleLogs = mockScheduleLogs.filter((l) => l.id !== id);
      syncData();
      return res.json({ success: true });
    }
    await deleteDoc(doc(db, "whatsapp_schedule_logs", id));
    invalidateScheduleLogsCache();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule log:", error);
    res.status(500).json({ error: "Falha ao excluir registro de agendamento" });
  }
});

const startAutoScheduleCron = () => {
  let lastAutoPushAttemptDate = "";
  let lastAutoPushAttemptAt = 0;

  const checkAndRun = async () => {
    try {
      const settings = await loadServerSettings();
      const todayISO = getBrazilTodayISO();
      const nowTime = getBrazilTimeHHMM();

      const config = normalizeAutoScheduleConfig(settings.autoScheduleConfig);
      if (config.enabled && config.lastRunDate !== todayISO && nowTime >= config.horarioExecucao) {
        console.log(`[AutoSchedule] Executando agendamento automático (${todayISO} ${nowTime} >= ${config.horarioExecucao})`);
        await runAutoWhatsAppSchedule({ trigger: "automatic", dateISO: todayISO });
      }

      const pushCfg = normalizePushConfig(settings.pushConfig);
      const nowMs = Date.now();
      const alreadyAttemptedRecently =
        lastAutoPushAttemptDate === todayISO && nowMs - lastAutoPushAttemptAt < 15 * 60 * 1000;

      if (
        pushCfg.enabled &&
        pushCfg.notifyPaymentReminders &&
        pushCfg.lastReminderPushDate !== todayISO &&
        nowTime >= pushCfg.horarioLembretePush &&
        !alreadyAttemptedRecently
      ) {
        lastAutoPushAttemptDate = todayISO;
        lastAutoPushAttemptAt = nowMs;
        await runPaymentReminderPushCheck({ trigger: "automatic", dateISO: todayISO });
      }
    } catch (err: any) {
      if (!isFirestoreQuotaError(err)) {
        console.error("[AutoSchedule] Erro no ciclo automático:", err);
      }
    }
  };

  // Run initial check 12s after server start, then every 60 seconds
  setTimeout(checkAndRun, 12000);
  setInterval(checkAndRun, 60000);
};

// Ensure unmatched /api/* requests always return JSON 404 in all environments
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    method: req.method,
    path: req.originalUrl,
  });
});

// Error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: "Payload muito grande. Os arquivos enviados são muito pesados." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erro interno do servidor", details: err.message });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  async function startVite() {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      startAutoScheduleCron();
    });
  }
  startVite();
} else if (!process.env.VERCEL) {
  // Serve static files in production (non-Vercel)
  const distDir = path.join(process.cwd(), "dist");
  app.use(
    express.static(distDir, {
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");
        if (
          normalized.endsWith("/index.html") ||
          normalized.endsWith("/sw.js") ||
          normalized.endsWith("/push-sw.js") ||
          normalized.endsWith("/registerSW.js") ||
          normalized.endsWith("/manifest.webmanifest")
        ) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (normalized.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // Never serve HTML fallback for missing JS/CSS files (prevents MIME-type crashes on mobile)
  app.use("/assets", (_req, res) => {
    res.status(404).type("text/plain").send("Asset not found");
  });

  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(distDir, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startAutoScheduleCron();
  });
}

export default app;
