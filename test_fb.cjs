require('dotenv').config();
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
async function test() {
  try {
    const q = await db.collection('clients').get();
    console.log("Total clients:", q.size);
    q.forEach(doc => console.log(doc.id));
  } catch (e) {
    console.error(e);
  }
}
test();
