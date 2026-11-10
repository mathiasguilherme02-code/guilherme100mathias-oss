import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

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

let serviceAccount: any = embeddedFallbackServiceAccount;
const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } catch (e) {
    serviceAccount = embeddedFallbackServiceAccount;
  }
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

export interface RestoreOptions {
  data?: string;       // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFim?: string;    // HH:mm
}

export async function restoreDeletedSimulations(
  dryRun = false,
  options: RestoreOptions = {}
) {
  const targetDate = options.data || "2026-11-07";
  const horaInicio = options.horaInicio || "16:00";
  const horaFim = options.horaFim || "16:43";

  console.log(`=== RESTORE SCRIPT (dryRun: ${dryRun}) for Date: ${targetDate}, Range: ${horaInicio} to ${horaFim} ===`);

  const details: string[] = [];
  let restoredCount = 0;

  // 1. Check historical 07/11 range (16:00 - 16:43)
  const isHistoricalTarget =
    targetDate.includes("2026-11-07") || targetDate.includes("07/11/2026");

  const startMinutes = parseMinutes(horaInicio);
  const endMinutes = parseMinutes(horaFim);
  const histStartMinutes = parseMinutes("16:00");
  const histEndMinutes = parseMinutes("16:43");

  const overlapsHistorical =
    isHistoricalTarget &&
    startMinutes <= histEndMinutes &&
    endMinutes >= histStartMinutes;

  if (overlapsHistorical) {
    let historicalData: any = null;
    const embeddedPath = path.join(process.cwd(), 'embedded_historical_recovery.json');
    if (fs.existsSync(embeddedPath)) {
      try {
        historicalData = JSON.parse(fs.readFileSync(embeddedPath, 'utf8'));
      } catch (e) {}
    }

    if (historicalData) {
      // Historical targets from 07/11
      const targets = [
        {
          id: '61fa7e9a-3401-4963-9cdf-50ca47277cde',
          name: 'Cássia Rita de Lima',
        },
        {
          id: '7f1fde93-c262-42fa-991a-dee031a04510',
          name: 'Patricia Emanuela Ferreira Da Silva',
        },
        {
          id: 'ef166f1b-c718-434a-abb0-8affd79e4ec1',
          name: 'karla Cristina de Jesus Lorenço',
        },
        {
          id: 'df691c98-cb6a-49a8-9776-6fe0fc934b14',
          name: 'Fernando da Silva Alves Monteiro',
        }
      ];

      for (const t of targets) {
        const backupClient = historicalData[t.id];
        if (!backupClient) continue;

        const currentDocRef = db.collection('clients').doc(t.id);
        const currentDocSnap = await currentDocRef.get();
        if (!currentDocSnap.exists) continue;

        const currentData = currentDocSnap.data() || {};
        let curDados = currentData.dados;
        if (typeof curDados === 'string') {
          try { curDados = JSON.parse(curDados); } catch (e) {}
        }
        const curSims = [...(curDados?.simulacoes || currentData.simulacoes || [])];

        // For Fernando: restore specific note if needed
        if (t.id === 'df691c98-cb6a-49a8-9776-6fe0fc934b14') {
          const expectedNote = backupClient.simulacoes?.[1]?.anotacoes;
          if (expectedNote && (!curSims[1]?.anotacoes || curSims[1]?.anotacoes !== expectedNote)) {
            if (curSims[1]) {
              curSims[1].anotacoes = expectedNote;
              if (!dryRun) {
                await currentDocRef.update({ 'dados.simulacoes': curSims });
              }
              restoredCount++;
              details.push(`Anotação de Fernando da Silva Alves Monteiro restaurada com sucesso.`);
            }
          } else {
            details.push(`Fernando da Silva Alves Monteiro: Anotação já está íntegra.`);
          }
          continue;
        }

        // For Cássia, Patricia, Karla: check if simulation from backup is missing
        const expectedSims = backupClient.simulacoes || [];
        if (expectedSims.length > 0) {
          const simToRestore = expectedSims[0];
          // Check if this simulation already exists in current
          const alreadyPresent = curSims.some(
            (s: any) =>
              s.prazo === simToRestore.prazo &&
              (s.valorSolicitado === simToRestore.valorSolicitado || s.valorEmprestimo === simToRestore.valorEmprestimo) &&
              (s.parcelas?.length || 0) === (simToRestore.parcelas?.length || 0)
          );

          if (!alreadyPresent) {
            const newSims = [simToRestore, ...curSims];
            if (!dryRun) {
              await currentDocRef.update({ 'dados.simulacoes': newSims });
            }
            restoredCount++;
            details.push(`Empréstimo de ${t.name} (R$ ${simToRestore.valorSolicitado || simToRestore.valorEmprestimo}, ${simToRestore.prazo}) restaurado com sucesso.`);
          } else {
            details.push(`${t.name}: Empréstimo do período já está presente no sistema.`);
          }
        }
      }
    }
  }

  // 2. Query dynamic audit_history collection for any deletions/changes matching target window
  try {
    const auditSnap = await db.collection('audit_history').get();
    for (const doc of auditSnap.docs) {
      const entry = doc.data();
      const entryDate = entry.data || (entry.timestamp ? entry.timestamp.split('T')[0] : '');
      const entryHora = entry.hora || (entry.timestamp ? entry.timestamp.split('T')[1]?.slice(0, 5) : '');

      if (entryDate === targetDate && entryHora) {
        const entryMinutes = parseMinutes(entryHora);
        if (entryMinutes >= startMinutes && entryMinutes <= endMinutes) {
          if (entry.type === 'client_deleted' && entry.clientId && entry.clientData) {
            if (!dryRun) {
              await db.collection('clients').doc(entry.clientId).set(entry.clientData);
            }
            restoredCount++;
            details.push(`Cliente ${entry.clientData?.nomeCompleto || entry.clientId} restaurado.`);
          } else if (entry.type === 'simulation_or_note_modified' && entry.clientId && entry.previousSimulacoes) {
            if (!dryRun) {
              const cRef = db.collection('clients').doc(entry.clientId);
              const cSnap = await cRef.get();
              if (cSnap.exists) {
                await cRef.update({ 'dados.simulacoes': entry.previousSimulacoes });
              }
            }
            restoredCount++;
            details.push(`Simulações/anotações de ${entry.clientName || entry.clientId} restauradas ao estado anterior.`);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not query audit_history:", e);
  }

  // 3. Save log in restoration_logs collection
  if (!dryRun) {
    try {
      await db.collection('restoration_logs').add({
        data: targetDate,
        horaInicio,
        horaFim,
        timestamp: new Date().toISOString(),
        restoredCount,
        details,
        status: "concluido"
      });
    } catch (e) {}
  }

  const message =
    restoredCount > 0
      ? `Restauração concluída! ${restoredCount} registro(s) restaurado(s) para o período de ${targetDate} (${horaInicio} às ${horaFim}).`
      : `Verificação concluída para ${targetDate} (${horaInicio} às ${horaFim}): os dados do período já se encontram íntegros no sistema.`;

  return {
    success: true,
    message,
    restoredCount,
    details
  };
}

function parseMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

if (process.argv.includes('--execute')) {
  restoreDeletedSimulations(false).then(console.log).catch(console.error);
} else if (process.argv.includes('--run')) {
  restoreDeletedSimulations(true).then(console.log).catch(console.error);
}
