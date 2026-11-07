import admin from 'firebase-admin';
import fs from 'fs';

function unwrapValue(val: any): any {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(unwrapValue);
  }
  if ('mapValue' in val) {
    const res: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = unwrapValue(v);
    }
    return res;
  }
  return val;
}

const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

export async function restoreDeletedSimulations(dryRun = true) {
  const backup = JSON.parse(fs.readFileSync('backup_historical_clients_20261107_1848Z.json', 'utf8'));
  
  // Target clients that had simulations deleted
  const targets = [
    {
      id: '61fa7e9a-3401-4963-9cdf-50ca47277cde',
      name: 'Cássia Rita de Lima',
      deletedSimIndex: 0
    },
    {
      id: '7f1fde93-c262-42fa-991a-dee031a04510',
      name: 'Patricia Emanuela Ferreira Da Silva',
      deletedSimIndex: 0
    },
    {
      id: 'ef166f1b-c718-434a-abb0-8affd79e4ec1',
      name: 'karla Cristina de Jesus Lorenço',
      deletedSimIndex: 0
    }
  ];

  console.log(`=== RESTORE SCRIPT (dryRun: ${dryRun}) ===`);

  for (const t of targets) {
    const docBackup = backup.documents.find((d: any) => (unwrapValue(d.fields.id) || d.name.split('/').pop()) === t.id);
    if (!docBackup) {
      console.log(`[!] Backup for ${t.name} not found.`);
      continue;
    }
    let oldDados = unwrapValue(docBackup.fields.dados);
    if (typeof oldDados === 'string') {
      try { oldDados = JSON.parse(oldDados); } catch(e) {}
    }
    const restoredSim = oldDados.simulacoes[t.deletedSimIndex];

    const currentDocRef = db.collection('clients').doc(t.id);
    const currentDocSnap = await currentDocRef.get();
    if (!currentDocSnap.exists) {
      console.log(`[!] Current doc for ${t.name} not found.`);
      continue;
    }
    const currentData = currentDocSnap.data();
    let curDados = currentData.dados;
    if (typeof curDados === 'string') {
      try { curDados = JSON.parse(curDados); } catch(e) {}
    }
    const curSims = [...(curDados?.simulacoes || currentData.simulacoes || [])];

    // Prepend the restored simulation back to index 0
    const newSims = [restoredSim, ...curSims];

    console.log(`[+] Restoring simulation for ${t.name}:`);
    console.log(`    Prazo: ${restoredSim.prazo}, Valor: R$ ${restoredSim.valorSolicitado || restoredSim.valorEmprestimo}`);
    console.log(`    Parcelas: ${restoredSim.parcelas?.length || 0}`);
    console.log(`    Total simulations will become: ${newSims.length} (was ${curSims.length})`);

    if (!dryRun) {
      const updatedDados = {
        ...curDados,
        simulacoes: newSims
      };
      await currentDocRef.update({
        'dados.simulacoes': newSims
      });
      console.log(`    -> RESTORED SUCCESSFULLY IN FIRESTORE!`);
    }
  }

  // Also check Fernando's note
  const fernandoBackup = backup.documents.find((d: any) => (unwrapValue(d.fields.id) || d.name.split('/').pop()) === 'df691c98-cb6a-49a8-9776-6fe0fc934b14');
  if (fernandoBackup) {
    let fDados = unwrapValue(fernandoBackup.fields.dados);
    if (typeof fDados === 'string') {
      try { fDados = JSON.parse(fDados); } catch(e) {}
    }
    const originalNote = fDados.simulacoes[1]?.anotacoes;
    console.log(`[+] Fernando da Silva Alves Monteiro - Anotação original:`);
    console.log(`    "${originalNote}"`);
    if (!dryRun) {
      const fDocRef = db.collection('clients').doc('df691c98-cb6a-49a8-9776-6fe0fc934b14');
      const fDocSnap = await fDocRef.get();
      if (fDocSnap.exists) {
        const curFData = fDocSnap.data();
        let curFDados = curFData.dados;
        if (typeof curFDados === 'string') {
          try { curFDados = JSON.parse(curFDados); } catch(e) {}
        }
        if (curFDados?.simulacoes?.[1]) {
          curFDados.simulacoes[1].anotacoes = originalNote;
          await fDocRef.update({
            'dados.simulacoes': curFDados.simulacoes
          });
          console.log(`    -> RESTORED FERNANDO NOTE IN FIRESTORE!`);
        }
      }
    }
  }
}

if (process.argv.includes('--execute')) {
  restoreDeletedSimulations(false).catch(console.error);
} else {
  restoreDeletedSimulations(true).catch(console.error);
}
