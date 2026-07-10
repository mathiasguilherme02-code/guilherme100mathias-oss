const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newFunc = `  const handleAddParcela = async (simIndex: number) => {
    if (!newParcela.dataVencimento || !newParcela.valor) {
      toast.error("Preencha a data e o valor da parcela.");
      return;
    }

    const valorNum = parseFloat(newParcela.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    if (!selectedClient) return;

    try {
      const res = await fetch(\`/api/clients/\${selectedClient.id}\`, {
        headers: { Authorization: \`Bearer \${adminToken}\` },
      });
      if (!res.ok) throw new Error("Failed to fetch latest client data");
      const latestClient = await res.json();

      const clientSimulacoes =
        latestClient.simulacoes ||
        (latestClient.simulacao ? [latestClient.simulacao] : []);
      const updatedSimulacoes = [...clientSimulacoes];
      const novasParcelas = [...(updatedSimulacoes[simIndex].parcelas || [])];

      const maxNumero = novasParcelas.length > 0 
        ? Math.max(...novasParcelas.map(p => p.numero)) 
        : 0;

      novasParcelas.push({
        numero: maxNumero + 1,
        dataVencimento: newParcela.dataVencimento,
        valor: valorNum,
        paga: false,
      });

      updatedSimulacoes[simIndex].parcelas = novasParcelas;
      
      // Also update quantidade
      updatedSimulacoes[simIndex].quantidade = novasParcelas.length.toString();

      const updatedClient = {
        ...latestClient,
        simulacoes: updatedSimulacoes,
      };

      const updateRes = await fetch(\`/api/clients/\${selectedClient.id}\`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${adminToken}\`,
        },
        body: JSON.stringify(updatedClient),
      });

      if (updateRes.ok) {
        setClients((prev) =>
          prev.map((c) => (c.id === selectedClient.id ? updatedClient : c)),
        );
        setSelectedClient(updatedClient);
        setAddingParcela(null);
        setNewParcela({ dataVencimento: "", valor: "" });
        toast.success("Parcela adicionada com sucesso!");
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Error adding parcela:", error);
      toast.error("Erro ao adicionar parcela");
    }
  };
`;

code = code.replace('  const handleRemoveAbatimento = async (', newFunc + '\n  const handleRemoveAbatimento = async (');

fs.writeFileSync('src/App.tsx', code);
