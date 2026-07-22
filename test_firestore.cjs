const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  
  async function test() {
    const qs = await db.collection("clients").get();
    console.log("Clients in Firestore:", qs.docs.length);
  }
  test().catch(console.error);
}
