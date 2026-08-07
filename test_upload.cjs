require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gmemprestimo-69965.firebasestorage.app"
});
const storage = admin.storage().bucket();
async function test() {
  try {
    const file = storage.file('test.txt');
    await file.save('hello world');
    console.log("Success");
  } catch (e) {
    console.error(e.message);
  }
}
test();
