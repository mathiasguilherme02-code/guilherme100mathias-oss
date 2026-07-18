import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";

const serviceAccountPath = './serviceAccountKey.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('clients').orderBy('dataCadastro', 'desc').get();
  console.log("Found " + snapshot.size + " clients with orderBy.");
}
run();
