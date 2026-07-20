const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const serviceAccount = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'serviceAccountKey.json'), 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gmemprestimo-69965.appspot.com"
});
const bucket = admin.storage().bucket();
const fileRef = bucket.file("test_signed_url.txt");
async function test() {
  await fileRef.save("hello world");
  const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '03-01-2500' });
  console.log("Signed URL:", url);
}
test().catch(console.error);
