import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";

const serviceAccountPath = './serviceAccountKey.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('clients').get();
  console.log("Found " + snapshot.size + " clients in Firebase.");
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().nomeCompleto, doc.data().cpf);
  });
}
run();
