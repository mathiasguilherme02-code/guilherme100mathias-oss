const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `    if (prazo === "abater") {
      let mensagem = \`Olá, \${nome}. A GM-Empréstimo informa que hoje é dia de abater parte/ou total da sua dívida que está VENCIDA desde \${dataStrVencimento}.\\n\`;
      mensagem += \`O valor restante, sua dívida vencida há (\${diasAtraso} dias) é de \${formatCurrency(valorAtualizado)}.\\n\\n\`;

      if (p.abatimentos && p.abatimentos.length > 0) {
        mensagem += \`Constam os seguintes pagamentos dessa dívida:\\n\\n\`;
        p.abatimentos.forEach((a: any) => {
          const dataStr = a.data ? a.data.split('-').reverse().join('/') : "";
          mensagem += \`Dia: [\${dataStr}] valor: [\${formatCurrency(a.valor)}]\\n\`;
        });
        mensagem += \`\\nRestando ainda o valor: [\${formatCurrency(valorAtualizado)}].\\n\`;
      } else {
        mensagem += \`Restando ainda o valor: [\${formatCurrency(valorAtualizado)}].\\n\`;
      }
      
      mensagem += \`Por favor, regularize o quanto antes.\\n\`;
      return mensagem;
    }`;

const replFunc = `    if (prazo === "abater") {
      let mensagem = \`Olá, \${nome}. A GM-Empréstimo informa que hoje é dia de abater parte ou o total da sua dívida, que está VENCIDA desde \${dataStrVencimento}.\\n\\n\`;
      
      if (p.abatimentos && p.abatimentos.length > 0) {
        mensagem += \`Sua dívida (vencida há \${diasAtraso} dias) está no valor atualizado de \${formatCurrency(valorAtualizado)}.\\n\\n\`;
        mensagem += \`Constam os seguintes pagamentos recentes abatidos dessa dívida:\\n\\n\`;
        p.abatimentos.forEach((a: any) => {
          const dataStr = a.data ? a.data.split('-').reverse().join('/') : "";
          mensagem += \`• Dia: \${dataStr} | Valor: \${formatCurrency(a.valor)}\\n\`;
        });
        mensagem += \`\\nRestando ainda o saldo de: \${formatCurrency(valorAtualizado)}.\\n\`;
      } else {
        mensagem += \`O valor total da sua dívida (vencida há \${diasAtraso} dias) é de \${formatCurrency(valorAtualizado)}.\\n\`;
      }
      
      mensagem += \`\\nPor favor, regularize o quanto antes para evitar maiores encargos.\`;
      return mensagem;
    }`;

code = code.replace(targetFunc, replFunc);
fs.writeFileSync('src/App.tsx', code);
