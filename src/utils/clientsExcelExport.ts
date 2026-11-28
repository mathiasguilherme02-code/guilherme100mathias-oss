import * as XLSX from "xlsx";
import { calculateParcelaDetails } from "./installmentMath";
import {
  getBrazilTodayISO,
  isSimulacaoAtivaShared,
} from "./whatsappReminders";

export interface ExportClientsExcelOptions {
  taxaAtrasoDia?: string | number;
  getClientStatusLabel: (client: any) => string;
  getClientMaxDiasAtraso: (client: any) => number;
  filename?: string;
}

export interface ClientExcelRow {
  "Nome Completo": string;
  CPF: string;
  RG: string;
  "Data de Nascimento": string;
  Telefone: string;
  Status: string;
  "Dias de Atraso": number;
  "Valor Total a Pagar (R$)": number;
  "Empréstimos Ativos": number;
  "Parcelas em Aberto": number;
  "Parcelas Pagas": number;
  "Data de Cadastro": string;
  "Última Atualização Cadastral": string;
  "Nome da Mãe": string;
  CEP: string;
  Endereço: string;
  Número: string;
  Complemento: string;
  Bairro: string;
  Cidade: string;
  Estado: string;
  "Parente / Contato": string;
  "Grau de Parentesco": string;
  "Telefone do Parente": string;
  "Quem Indicou": string;
  "Atividade Financeira": string;
  "Redes Sociais": string;
  "Qtd. Arquivos": number;
  Observações: string;
  "Observações Admin": string;
}

const formatDateFieldForExcel = (raw: any): string => {
  if (!raw) return "";
  const str = String(raw).trim();
  const isoPart = str.includes("T") ? str.split("T")[0] : str;
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) {
    const [y, m, d] = isoPart.split("-");
    return `${d}/${m}/${y}`;
  }
  return str;
};

const safeText = (val: any): string => {
  if (val === null || val === undefined) return "";
  return String(val).trim();
};

export const buildClientsExcelRows = (
  clients: any[],
  options: ExportClientsExcelOptions,
): ClientExcelRow[] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const registeredClients = (clients || [])
    .filter((c) => c && c.id !== "admin-transactions")
    .slice()
    .sort((a, b) =>
      String(a?.nomeCompleto || "").localeCompare(
        String(b?.nomeCompleto || ""),
        "pt-BR",
      ),
    );

  return registeredClients.map((client) => {
    const allSims = Array.isArray(client.simulacoes)
      ? client.simulacoes
      : client.simulacao
        ? [client.simulacao]
        : [];
    const activeSims = allSims.filter(isSimulacaoAtivaShared);

    let totalAPagar = 0;
    let parcelasEmAberto = 0;
    let parcelasPagas = 0;

    for (const sim of activeSims) {
      const parcelas = Array.isArray(sim?.parcelas) ? sim.parcelas : [];
      for (const p of parcelas) {
        if (p?.paga || p?.status === "pago") {
          parcelasPagas += 1;
        } else {
          parcelasEmAberto += 1;
          const calc = calculateParcelaDetails(p, {
            sim,
            taxaGlobal: options.taxaAtrasoDia,
            hoje,
          });
          totalAPagar += Number(calc.valorAtualizado || 0);
        }
      }
    }

    const roundedTotal = Math.round(totalAPagar * 100) / 100;

    return {
      "Nome Completo": safeText(client.nomeCompleto),
      CPF: safeText(client.cpf),
      RG: safeText(client.rg),
      "Data de Nascimento": formatDateFieldForExcel(client.dataNascimento),
      Telefone: safeText(client.telefone),
      Status: options.getClientStatusLabel(client),
      "Dias de Atraso": Math.max(0, Number(options.getClientMaxDiasAtraso(client) || 0)),
      "Valor Total a Pagar (R$)": roundedTotal,
      "Empréstimos Ativos": activeSims.length,
      "Parcelas em Aberto": parcelasEmAberto,
      "Parcelas Pagas": parcelasPagas,
      "Data de Cadastro": formatDateFieldForExcel(client.dataCadastro),
      "Última Atualização Cadastral": formatDateFieldForExcel(
        client.ultimaAtualizacaoCadastro || client.dataAtualizacaoCadastro,
      ),
      "Nome da Mãe": safeText(client.nomeMae),
      CEP: safeText(client.cep),
      Endereço: safeText(client.endereco),
      Número: safeText(client.numero),
      Complemento: safeText(client.complemento),
      Bairro: safeText(client.bairro),
      Cidade: safeText(client.cidade),
      Estado: safeText(client.estado),
      "Parente / Contato": safeText(client.parenteNome),
      "Grau de Parentesco": safeText(client.parenteGrau),
      "Telefone do Parente": safeText(client.parenteTelefone),
      "Quem Indicou": safeText(client.quemIndicou),
      "Atividade Financeira": safeText(client.atividadeFinanceira),
      "Redes Sociais": safeText(client.redesSociais),
      "Qtd. Arquivos": Array.isArray(client.arquivos)
        ? client.arquivos.length
        : 0,
      Observações: safeText(client.observacoes),
      "Observações Admin": safeText(client.observacoesAdmin),
    };
  });
};

export const createClientsWorkbook = (rows: ClientExcelRow[]): XLSX.WorkBook => {
  const worksheet = XLSX.utils.json_to_sheet(rows);

  if (rows.length > 0) {
    const keys = Object.keys(rows[0]) as (keyof ClientExcelRow)[];
    worksheet["!cols"] = keys.map((key) => {
      let maxLen = String(key).length;
      for (const row of rows) {
        const len = String(row[key] ?? "").length;
        if (len > maxLen) maxLen = len;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 42) };
    });

    const currencyColIndex = keys.indexOf("Valor Total a Pagar (R$)");
    if (currencyColIndex >= 0) {
      for (let r = 1; r <= rows.length; r++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c: currencyColIndex });
        if (worksheet[cellAddr]) {
          worksheet[cellAddr].z = '"R$" #,##0.00';
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes Cadastrados");
  return workbook;
};

export const exportClientsToExcel = (
  clients: any[],
  options: ExportClientsExcelOptions,
): number => {
  const rows = buildClientsExcelRows(clients, options);
  if (rows.length === 0) return 0;

  const workbook = createClientsWorkbook(rows);
  const todayISO = getBrazilTodayISO();
  const filename = options.filename || `clientes_cadastrados_${todayISO}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return rows.length;
};
