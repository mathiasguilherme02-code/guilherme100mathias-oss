import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const addPdfHeaderAndFooters = (
  doc: jsPDF,
  title: string,
  subtitle: string,
  extraLine?: string,
) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top accent bar
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.rect(0, 0, pageWidth, 3, "F");

  // Brand + title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(subtitle, 14, 21);

  let nextY = 25;
  if (extraLine) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(extraLine, 14, nextY);
    nextY += 4;
  }

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(14, nextY, pageWidth - 14, nextY);

  return nextY + 5;
};

const addPageFooters = (doc: jsPDF, footerLeft: string) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(footerLeft, 14, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, {
      align: "right",
    });
  }
};

const getNowFormatted = () => {
  const now = new Date();
  return `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case "aporte":
      return "Aporte";
    case "entrada":
      return "Entrada";
    case "entrada_prevista":
      return "Previsto";
    case "saida":
      return "Saída";
    case "renegociado":
      return "Renegociado";
    case "despesa_fixa":
      return "Despesa Fixa";
    case "despesa_prevista":
      return "Despesa Prevista";
    default:
      return "Retirada";
  }
};

export interface FluxoPdfSummary {
  saldo: number;
  fundoDeCaixa: number;
  monthEntradas: number;
  monthPendentes: number;
  monthInadimplencia: number;
  monthSaidas: number;
  monthRetiradas: number;
  monthDespesasPrevistas: number;
  monthAportes: number;
  monthRenegociados: number;
}

export interface ExportFluxoCaixaPDFParams {
  periodLabel: string;
  filePeriod: string;
  typeFilterLabel: string;
  summary: FluxoPdfSummary;
  transactions: any[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

export const exportFluxoCaixaPDF = ({
  periodLabel,
  filePeriod,
  typeFilterLabel,
  summary,
  transactions,
  formatCurrency,
  formatDate,
}: ExportFluxoCaixaPDFParams) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let cursorY = addPdfHeaderAndFooters(
    doc,
    "GM-Empréstimo · Resumo Financeiro (Fluxo de Caixa)",
    `Período: ${periodLabel}  |  Filtro: ${typeFilterLabel}  |  Emitido em: ${getNowFormatted()}`,
  );

  // Section 1: Summary KPIs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Resumo Financeiro Consolidado", 14, cursorY);
  cursorY += 3;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 14, right: 14 },
    head: [["Indicador Financeiro", "Valor", "Indicador Financeiro", "Valor"]],
    body: [
      [
        "Fundo de Caixa (Saldo do Período)",
        formatCurrency(summary.saldo),
        "Fundo de Caixa Acumulado",
        formatCurrency(summary.fundoDeCaixa),
      ],
      [
        "Entradas Efetivadas",
        formatCurrency(summary.monthEntradas),
        "Aportes no Período",
        formatCurrency(summary.monthAportes),
      ],
      [
        "Entradas Pendentes (A Receber)",
        formatCurrency(summary.monthPendentes),
        "Inadimplências no Período",
        formatCurrency(summary.monthInadimplencia),
      ],
      [
        "Saídas de Empréstimos",
        formatCurrency(summary.monthSaidas),
        "Despesas Efetivadas (Retiradas)",
        formatCurrency(summary.monthRetiradas),
      ],
      [
        "Despesas Previstas",
        formatCurrency(summary.monthDespesasPrevistas),
        "Renegociados / Abater (Sem saída)",
        formatCurrency(summary.monthRenegociados),
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 53, fontStyle: "bold", fillColor: [248, 250, 252] },
      1: { cellWidth: 38, halign: "right", fontStyle: "bold" },
      2: { cellWidth: 53, fontStyle: "bold", fillColor: [248, 250, 252] },
      3: { cellWidth: 38, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.textColor =
          summary.saldo >= 0 ? [29, 78, 216] : [190, 18, 60];
      }
    },
  });

  cursorY = ((doc as any).lastAutoTable?.finalY || cursorY + 40) + 8;

  // Section 2: Detailed Transactions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Histórico de Movimentações (${transactions.length} ${transactions.length === 1 ? "registro" : "registros"})`,
    14,
    cursorY,
  );
  cursorY += 3;

  const txRows =
    transactions.length > 0
      ? transactions.map((t: any) => {
          const dateClean = (t.data || "").split("T")[0];
          const formattedDate = dateClean ? formatDate(dateClean) : "-";
          const isPositive = ["entrada", "aporte", "entrada_prevista"].includes(
            t.tipo,
          );
          const isRenegociado = t.tipo === "renegociado";
          const valorStr = `${isPositive ? "+ " : isRenegociado ? "" : "- "}${formatCurrency(Number(t.valor || 0))}`;
          const saldoStr =
            t.tipo === "entrada_prevista" || isRenegociado
              ? "-"
              : formatCurrency(Number(t.saldoApos || 0));
          const descFull = t.detalhes
            ? `${t.descricao || ""}\n${t.detalhes}`
            : t.descricao || "-";

          return [formattedDate, getTipoLabel(t.tipo), descFull, valorStr, saldoStr];
        })
      : [
          [
            "-",
            "-",
            "Nenhuma movimentação registrada para o período e filtro selecionados.",
            "-",
            "-",
          ],
        ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 14, right: 14, bottom: 18 },
    head: [["Data", "Tipo", "Descrição Detalhada", "Valor", "Saldo Após"]],
    body: txRows,
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 26, fontStyle: "bold" },
      2: { cellWidth: 68 },
      3: { cellWidth: 27, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 27, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && transactions.length > 0 && data.column.index === 3) {
        const text = String(data.cell.raw || "");
        if (text.startsWith("+")) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (text.startsWith("-")) {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [79, 70, 229];
        }
      }
    },
  });

  addPageFooters(doc, `GM-Empréstimo · Fluxo de Caixa (${periodLabel})`);
  doc.save(`fluxo-caixa-${filePeriod}.pdf`);
};

export interface LembretesPdfSummary {
  totalCount: number;
  totalValor: number;
  pendentesCount: number;
  pendentesValor: number;
  vencidosCount: number;
  vencidosValor: number;
  pagosCount: number;
  pagosValor: number;
}

export interface ExportLembretesPDFParams {
  scopeLabel: string;
  periodLabel: string;
  statusLabel: string;
  clientFilterLabel: string;
  summary: LembretesPdfSummary;
  items: any[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  getPrazoLabel: (prazo: string) => string;
}

export const exportLembretesPDF = ({
  scopeLabel,
  periodLabel,
  statusLabel,
  clientFilterLabel,
  summary,
  items,
  formatCurrency,
  formatDate,
  getPrazoLabel,
}: ExportLembretesPDFParams) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let cursorY = addPdfHeaderAndFooters(
    doc,
    "GM-Empréstimo · Lembretes Agendados",
    `Escopo: ${scopeLabel}  |  Período: ${periodLabel}  |  Status: ${statusLabel}`,
    `Cliente: ${clientFilterLabel}  |  Emitido em: ${getNowFormatted()}`,
  );

  // Section 1: Summary Strip
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Resumo Consolidado", 14, cursorY);
  cursorY += 3;

  const filteredTotalValor = items.reduce(
    (acc: number, item: any) => acc + Number(item.valorRestante || 0),
    0,
  );

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 14, right: 14 },
    head: [
      [
        "Total no Período",
        "Pendentes (A Receber)",
        "Vencidos (Em Atraso)",
        "Pagos",
      ],
    ],
    body: [
      [
        `${formatCurrency(summary.totalValor)}\n(${summary.totalCount} ${summary.totalCount === 1 ? "item" : "itens"})`,
        `${formatCurrency(summary.pendentesValor)}\n(${summary.pendentesCount} ${summary.pendentesCount === 1 ? "pendente" : "pendentes"})`,
        `${formatCurrency(summary.vencidosValor)}\n(${summary.vencidosCount} ${summary.vencidosCount === 1 ? "vencido" : "vencidos"})`,
        `${formatCurrency(summary.pagosValor)}\n(${summary.pagosCount} ${summary.pagosCount === 1 ? "pago" : "pagos"})`,
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
      fontStyle: "bold",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 45.5 },
      1: { cellWidth: 45.5, textColor: [180, 83, 9] },
      2: { cellWidth: 45.5, textColor: [185, 28, 28] },
      3: { cellWidth: 45.5, textColor: [4, 120, 87] },
    },
  });

  cursorY = ((doc as any).lastAutoTable?.finalY || cursorY + 25) + 8;

  // Section 2: Filtered Reminders Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Lista de Lembretes Filtrados (${items.length} ${items.length === 1 ? "registro" : "registros"} · ${formatCurrency(filteredTotalValor)})`,
    14,
    cursorY,
  );
  cursorY += 3;

  const getReminderStatusText = (item: any) => {
    if (item.statusKey === "pago") return "Pago";
    if (item.statusKey === "congelado") {
      return item.dataCongelamento
        ? `Congelado\nAté ${formatDate(item.dataCongelamento)}`
        : "Congelado";
    }
    if (item.statusKey === "hoje") return "Vence Hoje";
    if (item.statusKey === "vencido") {
      return `Vencido\n${item.diasAtraso} ${item.diasAtraso === 1 ? "dia" : "dias"} de atraso`;
    }
    return item.isPreVencimento
      ? `A Vencer\nEm ${item.diasParaVencimento} ${item.diasParaVencimento === 1 ? "dia" : "dias"}`
      : "A Vencer";
  };

  const rows =
    items.length > 0
      ? items.map((item: any) => {
          const subVenc =
            item.isPago && item.dataPagamento
              ? `Pago em ${formatDate(item.dataPagamento)}`
              : item.modoLembrete === "quinto_dia_util" ||
                  item.prazo === "quinto_dia_util"
                ? "5º Dia Útil"
                : "Vencimento agendado";
          const vencCell = `${formatDate(item.dataVencimentoClean)}\n${subVenc}`;

          const clientSub = [item.clientCpf, item.clientPhone]
            .filter(Boolean)
            .join(" · ");
          const clientCell = clientSub
            ? `${item.clientName}\n${clientSub}`
            : item.clientName;

          const refTitle =
            item.prazo === "abater"
              ? `Lembrete #${item.numero}`
              : `Parcela #${item.numero}`;
          const refSub = `${getPrazoLabel(item.prazo)}${item.isRenegociacao ? " · Renegociação" : ""}`;
          const refCell = `${refTitle}\n${refSub}`;

          const statusCell = getReminderStatusText(item);
          const valorCell = formatCurrency(Number(item.valorRestante || 0));

          return [vencCell, clientCell, refCell, statusCell, valorCell];
        })
      : [
          [
            "-",
            "Nenhum lembrete encontrado para os filtros selecionados.",
            "-",
            "-",
            "-",
          ],
        ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 14, right: 14, bottom: 18 },
    head: [["Vencimento", "Cliente", "Referência", "Status", "Valor"]],
    body: rows,
    foot:
      items.length > 0
        ? [
            [
              `Total Filtrado (${items.length} ${items.length === 1 ? "item" : "itens"})`,
              "",
              "",
              "",
              formatCurrency(filteredTotalValor),
            ],
          ]
        : undefined,
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      valign: "middle",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 52 },
      2: { cellWidth: 36 },
      3: { cellWidth: 32, fontStyle: "bold" },
      4: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "foot" && data.column.index === 4) {
        data.cell.styles.halign = "right";
      }
      if (data.section === "body" && items.length > 0 && data.column.index === 3) {
        const status = items[data.row.index]?.statusKey;
        if (status === "pago") data.cell.styles.textColor = [4, 120, 87];
        else if (status === "vencido") data.cell.styles.textColor = [185, 28, 28];
        else if (status === "hoje") data.cell.styles.textColor = [180, 83, 9];
        else if (status === "congelado") data.cell.styles.textColor = [29, 78, 216];
      }
    },
  });

  addPageFooters(doc, `GM-Empréstimo · Lembretes Agendados (${periodLabel})`);
  const dateStamp = new Date().toISOString().split("T")[0];
  doc.save(`lembretes-agendados-${dateStamp}.pdf`);
};
