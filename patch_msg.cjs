const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `  const generateVencidaMessage = (nomeCompleto: string, p: any, diasAtraso: number, valorAtualizado: number) => {
    const nome = nomeCompleto ? nomeCompleto.split(" ")[0] : "Cliente";
    const dataStrVencimento = p.dataVencimento ? p.dataVencimento.split('T')[0].split('-').reverse().join('/') : "";
    const valor40Porcento = formatCurrency(valorAtualizado * 0.4);

    let mensagem = \`Olá, \${nome}. A GM-Empréstimo informa que sua Parcela \${p.numero} está VENCIDA desde \${dataStrVencimento}.\\nNossa política de trabalho, permite congelar seus juros diários por até 7 dias, para isso precisa efetuar o pagamento de 40% do valor da parcela, que hoje é \${valor40Porcento}. Porém, se vencer esse prazo de 7 dias, seus juros serão atualizados e será abatido o que foi enviado.\\n\\n\`;

    if (p.abatimentos && p.abatimentos.length > 0) {
      mensagem += \`Você realizou os seguintes pagamentos/abatimentos nesta parcela:\\n\`;
      const hoje = parseLocalDate(getLocalISODate());
      p.abatimentos.forEach((a: any) => {
        const dataA = parseLocalDate(a.data);
        const diff = Math.max(0, hoje.getTime() - dataA.getTime());
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const dataStr = a.data ? a.data.split('-').reverse().join('/') : "";
        mensagem += \`- \${dataStr}: \${formatCurrency(a.valor)} (há \${dias} dia\${dias !== 1 ? 's' : ''})\\n\`;
      });
      mensagem += \`\\n\`;
    }

    if (p.jurosCongelados) {
      mensagem += \`O valor restante para pagamento é de \${formatCurrency(valorAtualizado)}.\\n\`;
    } else {
      mensagem += \`O valor restante, atualizado com juros de atraso (\${diasAtraso} dias) é de \${formatCurrency(valorAtualizado)}.\\n\`;
    }

    mensagem += \`Por favor, regularize o quanto antes para evitar maiores encargos.\`;
    
    return mensagem;
  };`;

const replFunc = `  const generateVencidaMessage = (nomeCompleto: string, p: any, diasAtraso: number, valorAtualizado: number, prazo?: string) => {
    const nome = nomeCompleto ? nomeCompleto.split(" ")[0] : "Cliente";
    const dataStrVencimento = p.dataVencimento ? p.dataVencimento.split('T')[0].split('-').reverse().join('/') : "";

    if (prazo === "abater") {
      let mensagem = \`Olá, \${nome}. A GM-Empréstimo informa que hoje é dia de abater parte ou total da sua dívida que está VENCIDA desde \${dataStrVencimento}.\\n\`;
      mensagem += \`O valor restante da sua dívida vencida há (\${diasAtraso} dias) é de \${formatCurrency(valorAtualizado)}.\\n\\n\`;

      if (p.abatimentos && p.abatimentos.length > 0) {
        mensagem += \`Constam os seguintes pagamentos dessa dívida:\\n\\n\`;
        p.abatimentos.forEach((a: any) => {
          const dataStr = a.data ? a.data.split('-').reverse().join('/') : "";
          mensagem += \`Dia: [\${dataStr}] valor: [\${formatCurrency(a.valor)}]\\n\`;
        });
        mensagem += \`\\nRestando ainda o valor: [\${formatCurrency(valorAtualizado)}].\\n\`;
      }
      
      mensagem += \`Por favor, regularize o quanto antes.\`;
      return mensagem;
    }

    const valor40Porcento = formatCurrency(valorAtualizado * 0.4);
    let mensagem = \`Olá, \${nome}. A GM-Empréstimo informa que sua Parcela \${p.numero} está VENCIDA desde \${dataStrVencimento}.\\nNossa política de trabalho, permite congelar seus juros diários por até 7 dias, para isso precisa efetuar o pagamento de 40% do valor da parcela, que hoje é \${valor40Porcento}. Porém, se vencer esse prazo de 7 dias, seus juros serão atualizados e será abatido o que foi enviado.\\n\\n\`;

    if (p.abatimentos && p.abatimentos.length > 0) {
      mensagem += \`Você realizou os seguintes pagamentos/abatimentos nesta parcela:\\n\`;
      const hoje = parseLocalDate(getLocalISODate());
      p.abatimentos.forEach((a: any) => {
        const dataA = parseLocalDate(a.data);
        const diff = Math.max(0, hoje.getTime() - dataA.getTime());
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const dataStr = a.data ? a.data.split('-').reverse().join('/') : "";
        mensagem += \`- \${dataStr}: \${formatCurrency(a.valor)} (há \${dias} dia\${dias !== 1 ? 's' : ''})\\n\`;
      });
      mensagem += \`\\n\`;
    }

    if (p.jurosCongelados) {
      mensagem += \`O valor restante para pagamento é de \${formatCurrency(valorAtualizado)}.\\n\`;
    } else {
      mensagem += \`O valor restante, atualizado com juros de atraso (\${diasAtraso} dias) é de \${formatCurrency(valorAtualizado)}.\\n\`;
    }

    mensagem += \`Por favor, regularize o quanto antes para evitar maiores encargos.\`;
    
    return mensagem;
  };`;

code = code.replace(targetFunc, replFunc);

code = code.replace(
  /generateVencidaMessage\(selectedClient\.nomeCompleto, p, diasAtraso, valorAtualizado\)/g,
  'generateVencidaMessage(selectedClient.nomeCompleto, p, diasAtraso, valorAtualizado, sim.prazo)'
);

code = code.replace(
  /generateVencidaMessage\(p\.clientName, p, diasAtraso, valorAtualizado\)/g,
  'generateVencidaMessage(p.clientName, p, diasAtraso, valorAtualizado, p.prazo)'
);

code = code.replace(
  /Adicionar Nova Parcela/g,
  'Adicionar Lembrete de Pagamento'
);

code = code.replace(
  /Adicionar Parcela \(Restante\)/g,
  'Adicionar Lembrete de Pagamento'
);

code = code.replace(
  /Salvar Parcela/g,
  'Salvar Lembrete'
);

fs.writeFileSync('src/App.tsx', code);
