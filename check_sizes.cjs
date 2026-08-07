require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
async function test() {
  const q = await db.collection('clients').get();
  let max = 0;
  q.forEach(doc => {
    const data = doc.data();
    const str = JSON.stringify(data);
    console.log(doc.id, str.length);
  });
}
test();
