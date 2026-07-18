const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `    const isMensal = true; // Fixado mensalmente\n\n    let diasTotais = 30;`,
  `    const tipoTaxa = simulacao.prazo === "abater" ? "mensal" : (simulacao.tipoTaxa || adminSettings.tipoTaxa || "mensal");\n    let fatorDivisao = 30;\n    if (tipoTaxa === "diaria") fatorDivisao = 1;\n    else if (tipoTaxa === "semanal") fatorDivisao = 7;\n    else if (tipoTaxa === "quinzenal") fatorDivisao = 15;\n    else if (tipoTaxa === "mensal") fatorDivisao = 30;\n\n    let diasTotais = 30;`
);

code = code.replace(
  `    const fatorTempo = isMensal ? diasTotais / 30 : diasTotais;`,
  `    const fatorTempo = diasTotais / fatorDivisao;`
);

code = code.replace(
  `      const isMensal = true; // Fixado mensalmente\n\n      let diasTotais = 30;`,
  `      const tipoTaxa = editSimData.prazo === "abater" ? "mensal" : (editSimData.tipoTaxa || adminSettings.tipoTaxa || "mensal");\n      let fatorDivisao = 30;\n      if (tipoTaxa === "diaria") fatorDivisao = 1;\n      else if (tipoTaxa === "semanal") fatorDivisao = 7;\n      else if (tipoTaxa === "quinzenal") fatorDivisao = 15;\n      else if (tipoTaxa === "mensal") fatorDivisao = 30;\n\n      let diasTotais = 30;`
);

code = code.replace(
  `      const fatorTempo = isMensal ? diasTotais / 30 : diasTotais;`,
  `      const fatorTempo = diasTotais / fatorDivisao;`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
