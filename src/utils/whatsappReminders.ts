import {
  calculateParcelaDetails,
  formatISOToBR,
} from "./installmentMath";

export const DEFAULT_WHATSAPP_TEMPLATES = {
  msgLembreteAVencer:
    "Olá {cliente}, a GM-Empréstimo lembra que {referencia} no valor de {valor} vencerá em {data}.",
  msgLembretePreVencimento:
    "Olá {cliente}, a GM-Empréstimo informa que {referencia} no valor de {valor} vence em {dias} dia(s), no dia {data}.",
  msgLembreteVenceHoje:
    "Olá {cliente}, a GM-Empréstimo informa que {referencia} no valor de {valor} vence hoje, {data}. O pagamento deve ser realizado até as 18 horas via Pix. Nossa chave Pix: 31972323040 (Silmara).",
  msgLembreteCongelado:
    "Olá {cliente}, a GM-Empréstimo informa que sua dívida no valor {valor_divida} está com juros congelados desde {data}.\n\n{abatimentos}\n\nSeu saldo devedor é de {valor}.",
  msgLembreteConfirmacao:
    "Olá {cliente}, a GM-Empréstimo confirma o recebimento do pagamento de {referencia} no valor de {valor}, pago na data de {data}. Até a próxima.",
  msgLembreteVencido: "",
};

export type WaTemplateKey = keyof typeof DEFAULT_WHATSAPP_TEMPLATES;

export type WaSituacaoType =
  | "personalizado"
  | "a_vencer"
  | "pre_vencimento"
  | "vence_hoje"
  | "congelado"
  | "vencido"
  | "confirmacao";

export interface CustomWhatsAppTemplate {
  id: string;
  label: string;
  situacao: WaSituacaoType;
  text: string;
  telefone?: string;
}

export interface AutoScheduleConfig {
  enabled: boolean;
  horarioExecucao: string;
  enviarPreVencimento: boolean;
  preVencimentoModo: "janela" | "dia_exato";
  enviarVenceHoje: boolean;
  enviarVencido: boolean;
  frequenciaVencidoDias: string;
  enviarCongelado: boolean;
  frequenciaCongeladoDias: string;
  incluirEmprestimos: boolean;
  incluirLembretesAbater: boolean;
  modoEnvio: "fila_whatsapp_business" | "webhook_api";
  webhookUrl: string;
  webhookToken: string;
  lastRunDate?: string;
  lastRunAt?: string;
}

export const DEFAULT_AUTO_SCHEDULE_CONFIG: AutoScheduleConfig = {
  enabled: false,
  horarioExecucao: "09:00",
  enviarPreVencimento: true,
  preVencimentoModo: "janela",
  enviarVenceHoje: true,
  enviarVencido: true,
  frequenciaVencidoDias: "3",
  enviarCongelado: false,
  frequenciaCongeladoDias: "7",
  incluirEmprestimos: true,
  incluirLembretesAbater: true,
  modoEnvio: "fila_whatsapp_business",
  webhookUrl: "",
  webhookToken: "",
  lastRunDate: "",
  lastRunAt: "",
};

export interface ScheduledWhatsAppNotification {
  id: string;
  dateISO: string;
  createdAt: string;
  scheduledForTime: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  phone: string;
  phoneDigits: string;
  hasCustomPhone: boolean;
  simIndex: number;
  parcelaIndex: number;
  parcelaNumero: number;
  prazo: string;
  dataVencimento: string;
  situacao: "pre_vencimento" | "vence_hoje" | "vencido" | "congelado";
  dias: number;
  valor: number;
  valorDivida: number;
  message: string;
  status: "pendente" | "enviado" | "erro" | "ignorado";
  sentAt?: string;
  deliveryMethod?: "whatsapp_business" | "webhook_api" | "manual";
  errorMessage?: string;
}

export interface WhatsAppSettingsLike {
  taxaAtrasoDia?: string;
  diasLembreteAntecipado?: string;
  msgLembreteAVencer?: string;
  msgLembretePreVencimento?: string;
  msgLembreteVenceHoje?: string;
  msgLembreteCongelado?: string;
  msgLembreteConfirmacao?: string;
  msgLembreteVencido?: string;
  msgTelefones?: Partial<Record<WaTemplateKey, string>>;
  customWhatsAppTemplates?: CustomWhatsAppTemplate[];
  autoScheduleConfig?: Partial<AutoScheduleConfig>;
}

export const getBrazilTodayISO = (now: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch (e) {}
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getBrazilTimeHHMM = (now: Date = new Date()): string => {
  try {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const h = parts.find((p) => p.type === "hour")?.value;
    const m = parts.find((p) => p.type === "minute")?.value;
    if (h && m) return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  } catch (e) {}
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const parseLocalDateShared = (dateString: any): Date => {
  if (!dateString) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (dateString instanceof Date) {
    const d = new Date(dateString.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const str = String(dateString).trim();
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(str)) {
    const [d, m, y] = str.split(/[\/\-]/);
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 0, 0, 0, 0);
  }
  const match = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (match) {
    let y = parseInt(match[1], 10);
    if (y < 1900) y += 2000 - (y % 100);
    return new Date(y, parseInt(match[2], 10) - 1, parseInt(match[3], 10), 0, 0, 0, 0);
  }
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatCurrencyShared = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatDateShared = (dateString: string): string => {
  if (!dateString) return "";
  const dateOnly = dateString.split("T")[0];
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    const date = parseLocalDateShared(dateOnly);
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const capitalizedDayName =
      dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `(${parts[2]}/${parts[1]}/${parts[0]}) - ${capitalizedDayName}`;
  }
  return dateString;
};

export const parseMonetaryValueShared = (val: any): number => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (val === null || val === undefined) return 0;
  const s = String(val).trim().replace(/R\$\s*/gi, "");
  if (!s) return 0;
  if (s.includes(",")) {
    const cleaned = s.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

export const isParcelaCongeladaShared = (
  p: any,
  options?: { sim?: any; taxaGlobal?: string | number; hoje?: Date | string },
): boolean => {
  if (!p || p.paga || p.status === "pago") return false;
  if (p?.jurosCongelados || p?.isCongelamento) return true;
  if (!Array.isArray(p?.abatimentos) || p.abatimentos.length === 0) return false;
  return calculateParcelaDetails(p, options).isCongeladoEfetivo;
};

export const getParcelaDiasAtrasoShared = (
  p: any,
  hoje: Date = new Date(),
  sim?: any,
  taxaGlobal?: string | number,
): number => {
  return calculateParcelaDetails(p, { sim, taxaGlobal, hoje }).diasJurosCobrados;
};

export const isSimulacaoAtivaShared = (s: any): boolean => {
  if (!s || s.arquivado) return false;
  if (
    s.status === "renegociado" ||
    s.status === "reprovado" ||
    s.status === "cancelado_pelo_cliente"
  ) {
    return false;
  }
  if (s.status === "aprovado") {
    return (
      s.clientAccepted === "sim" ||
      (s.parcelas || []).some((p: any) => p.paga || p.status === "pago")
    );
  }
  return !s.status && s.clientAccepted !== "nao";
};

export const formatAbatimentosWhatsAppShared = (
  p: any,
  sim?: any,
  client?: any,
): string => {
  const normalizeEntries = (list: any[], refLabel = "") =>
    (Array.isArray(list) ? list : [])
      .map((a: any) => ({
        data: String(a?.data || a?.dataPagamento || a?.date || "").trim(),
        valor: parseMonetaryValueShared(a?.valor ?? a?.value ?? 0),
        refLabel,
      }))
      .filter((a) => a.valor > 0 || Boolean(a.data));

  let entries = normalizeEntries(p?.abatimentos);

  if (entries.length === 0 && sim) {
    const simAbat = normalizeEntries(sim?.abatimentos);
    const simParcelas = Array.isArray(sim?.parcelas) ? sim.parcelas : [];
    const fromSimParcelas = simParcelas.flatMap((par: any, idx: number) => {
      const ref =
        simParcelas.length > 1
          ? sim?.prazo === "abater"
            ? `Lembrete ${par?.numero || idx + 1}`
            : `Parcela ${par?.numero || idx + 1}`
          : "";
      return normalizeEntries(par?.abatimentos, ref);
    });
    entries = [...simAbat, ...fromSimParcelas];
  }

  if (entries.length === 0 && client) {
    const allSims =
      client.simulacoes || (client.simulacao ? [client.simulacao] : []);
    const activeSims = allSims.filter(isSimulacaoAtivaShared);
    const simsToScan = activeSims.length > 0 ? activeSims : allSims;
    entries = simsToScan.flatMap((s: any) => {
      const sAbat = normalizeEntries(s?.abatimentos);
      const sParcelas = Array.isArray(s?.parcelas) ? s.parcelas : [];
      const fromParcelas = sParcelas.flatMap((par: any, idx: number) => {
        const ref =
          sParcelas.length > 1
            ? s?.prazo === "abater"
              ? `Lembrete ${par?.numero || idx + 1}`
              : `Parcela ${par?.numero || idx + 1}`
            : "";
        return normalizeEntries(par?.abatimentos, ref);
      });
      return [...sAbat, ...fromParcelas];
    });
  }

  if (entries.length === 0) return "";

  entries.sort((a, b) => {
    const da = a.data ? a.data.split("T")[0] : "";
    const db = b.data ? b.data.split("T")[0] : "";
    return da.localeCompare(db);
  });

  let totalAbatido = 0;
  const linhas = entries.map((a) => {
    totalAbatido += a.valor;
    const dataAbat = a.data ? formatDateShared(a.data) : "Data não informada";
    const refSuffix = a.refLabel ? ` (${a.refLabel})` : "";
    return `* ${dataAbat}: ${formatCurrencyShared(a.valor)}${refSuffix}`;
  });
  return `Abatimentos registrados na ficha:\n${linhas.join("\n")}\nTotal abatido: ${formatCurrencyShared(totalAbatido)}`;
};

export const computeParcelaMenos60Tags = (valorTotalParcela: number) => {
  const safeTotal = Math.max(0, Number(valorTotalParcela) || 0);
  const valor60 = Math.round(safeTotal * 0.6 * 100) / 100;
  const resultado = Math.max(0, Number((safeTotal - valor60).toFixed(2)));
  const totalFmt = formatCurrencyShared(safeTotal);
  const valor60Fmt = formatCurrencyShared(valor60);
  const resultadoFmt = formatCurrencyShared(resultado);
  return {
    valorMenos60: resultadoFmt,
    valor60: valor60Fmt,
    calculoMenos60: `${totalFmt} - 60% (${valor60Fmt}) = ${resultadoFmt}`,
  };
};

export const renderWhatsAppTemplateShared = (
  template: string,
  vars: {
    cliente: string;
    valor: string;
    valorDivida?: string;
    valorMenos60?: string;
    valor60?: string;
    calculoMenos60?: string;
    data: string;
    referencia: string;
    dias?: string | number;
    abatimentos?: string;
    prazoCongelamento?: string;
  },
): string => {
  const firstName = vars.cliente
    ? String(vars.cliente).trim().split(" ")[0]
    : "Cliente";
  const needsMenos60Fallback =
    vars.valorMenos60 === undefined ||
    vars.valor60 === undefined ||
    vars.calculoMenos60 === undefined;
  const fallbackMenos60 = needsMenos60Fallback
    ? computeParcelaMenos60Tags(
        parseMonetaryValueShared(vars.valorDivida || vars.valor || 0),
      )
    : null;
  const resolvedValorMenos60 =
    vars.valorMenos60 ?? fallbackMenos60?.valorMenos60 ?? "";
  const resolvedValor60 = vars.valor60 ?? fallbackMenos60?.valor60 ?? "";
  const resolvedCalculoMenos60 =
    vars.calculoMenos60 ?? fallbackMenos60?.calculoMenos60 ?? "";

  return template
    .replace(/\{(?:cliente|nome)\}/gi, firstName || "Cliente")
    .replace(
      /\{(?:valor_divida|valor_total|divida)\}/gi,
      vars.valorDivida || vars.valor || "",
    )
    .replace(
      /\{(?:valor_menos_60|parcela_menos_60|resultado_menos_60|menos_60)\}/gi,
      resolvedValorMenos60,
    )
    .replace(
      /\{(?:calculo_menos_60|calculo_60)\}/gi,
      resolvedCalculoMenos60,
    )
    .replace(/\{(?:valor_60|desconto_60)\}/gi, resolvedValor60)
    .replace(/\{(?:valor|saldo_devedor|saldo)\}/gi, vars.valor || "")
    .replace(/\{data\}/gi, vars.data || "")
    .replace(/\{referencia\}/gi, vars.referencia || "")
    .replace(
      /\{dias\}/gi,
      vars.dias !== undefined && vars.dias !== null ? String(vars.dias) : "0",
    )
    .replace(/\{abatimentos\}/gi, vars.abatimentos || "")
    .replace(/\{prazo_congelamento\}/gi, vars.prazoCongelamento || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const generateVencidaMessageShared = (
  settings: WhatsAppSettingsLike,
  nomeCompleto: string,
  p: any,
  diasAtraso: number,
  valorAtualizado: number,
  prazo?: string,
  sim?: any,
  client?: any,
  valorDivida?: number,
  hojeDate: Date = new Date(),
): string => {
  const calc = calculateParcelaDetails(p, {
    sim,
    taxaGlobal: settings.taxaAtrasoDia,
    hoje: hojeDate,
  });
  const prazoCongelamentoStr = calc.freezeEndDateISO
    ? formatISOToBR(calc.freezeEndDateISO)
    : "";

  if (settings.msgLembreteVencido && settings.msgLembreteVencido.trim()) {
    const itemDesc =
      prazo === "abater"
        ? "seu Lembrete de Pagamento"
        : `sua Parcela ${p.numero}`;
    const pAbatTotal = Array.isArray(p?.abatimentos)
      ? p.abatimentos.reduce(
          (acc: number, a: any) => acc + parseMonetaryValueShared(a?.valor ?? 0),
          0,
        )
      : 0;
    const resolvedDivida =
      valorDivida !== undefined
        ? valorDivida
        : calc.valorTotalSemAbatimentos || valorAtualizado + pAbatTotal;
    const menos60 = computeParcelaMenos60Tags(resolvedDivida);
    return renderWhatsAppTemplateShared(settings.msgLembreteVencido, {
      cliente: nomeCompleto,
      valor: formatCurrencyShared(valorAtualizado),
      valorDivida: formatCurrencyShared(resolvedDivida),
      valorMenos60: menos60.valorMenos60,
      valor60: menos60.valor60,
      calculoMenos60: menos60.calculoMenos60,
      data: p.dataVencimento ? formatDateShared(p.dataVencimento) : "",
      referencia: itemDesc,
      dias: diasAtraso,
      abatimentos: formatAbatimentosWhatsAppShared(p, sim, client),
      prazoCongelamento: prazoCongelamentoStr,
    });
  }

  const nome = nomeCompleto ? nomeCompleto.split(" ")[0] : "Cliente";
  const dataStrVencimento = p.dataVencimento
    ? String(p.dataVencimento).split("T")[0].split("-").reverse().join("/")
    : "";

  if (prazo === "abater") {
    let mensagem = `Olá, ${nome}. A GM-Empréstimo informa que hoje é dia de abater parte ou o total da sua dívida, que está VENCIDA desde ${dataStrVencimento}.\n\n`;

    if (p.abatimentos && p.abatimentos.length > 0) {
      mensagem += `Sua dívida (vencida há ${diasAtraso} dias) está no valor atualizado de ${formatCurrencyShared(valorAtualizado)}.\n\n`;
      mensagem += `Constam os seguintes pagamentos recentes abatidos dessa dívida:\n\n`;
      p.abatimentos.forEach((a: any) => {
        const dataStr = a.data
          ? String(a.data).split("-").reverse().join("/")
          : "";
        mensagem += `• Dia: ${dataStr} | Valor: ${formatCurrencyShared(a.valor)}\n`;
      });
      if (calc.isPrazo7DiasVencido && calc.freezeStartDateISO && calc.freezeEndDateISO) {
        mensagem += `\nO prazo de congelamento de 7 dias (de ${formatISOToBR(calc.freezeStartDateISO)} até ${formatISOToBR(calc.freezeEndDateISO)}) encerrou. Os juros diários foram retomados sobre o saldo restante (${calc.diasJurosAposCongelamento} ${calc.diasJurosAposCongelamento === 1 ? "dia" : "dias"} após o prazo).\n`;
      }
      mensagem += `\nRestando ainda o saldo de: ${formatCurrencyShared(valorAtualizado)}.\n`;
    } else {
      mensagem += `O valor total da sua dívida (vencida há ${diasAtraso} dias) é de ${formatCurrencyShared(valorAtualizado)}.\n`;
    }

    mensagem += `\nPor favor, regularize o quanto antes para evitar maiores encargos.`;
    return mensagem;
  }

  const valor40Porcento = formatCurrencyShared(valorAtualizado * 0.4);
  let mensagem = `Olá, ${nome}. A GM-Empréstimo informa que sua Parcela ${p.numero} está VENCIDA desde ${dataStrVencimento}.\nNossa política de trabalho, permite congelar seus juros diários por até 7 dias, para isso precisa efetuar o pagamento de 40% do valor da parcela, que hoje é ${valor40Porcento}. Porém, se vencer esse prazo de 7 dias, seus juros serão atualizados e será abatido o que foi enviado.\n\n`;

  if (p.abatimentos && p.abatimentos.length > 0) {
    mensagem += `Você realizou os seguintes pagamentos/abatimentos nesta parcela:\n`;
    const hoje = parseLocalDateShared(hojeDate);
    p.abatimentos.forEach((a: any) => {
      const dataA = parseLocalDateShared(a.data);
      const diff = Math.max(0, hoje.getTime() - dataA.getTime());
      const dias = Math.round(diff / (1000 * 60 * 60 * 24));
      const dataStr = a.data
        ? String(a.data).split("-").reverse().join("/")
        : "";
      mensagem += `- ${dataStr}: ${formatCurrencyShared(a.valor)} (há ${dias} dia${dias !== 1 ? "s" : ""})\n`;
    });
    if (calc.isPrazo7DiasVencido && calc.freezeStartDateISO && calc.freezeEndDateISO) {
      mensagem += `\n⚠️ O prazo de 7 dias corridos de congelamento (${formatISOToBR(calc.freezeStartDateISO)} até ${formatISOToBR(calc.freezeEndDateISO)}) encerrou. O valor já pago foi abatido (saldo restante de ${formatCurrencyShared(calc.saldoAposUltimoAbatimento)}) e os juros diários foram retomados (${calc.diasJurosAposCongelamento} ${calc.diasJurosAposCongelamento === 1 ? "dia" : "dias"} após o prazo).\n`;
    }
    mensagem += `\n`;
  }

  if (p.jurosCongelados) {
    if (p.dataCongelamento) {
      const dataStrCongelada = String(p.dataCongelamento)
        .split("T")[0]
        .split("-")
        .reverse()
        .join("/");
      if (diasAtraso > 0) {
        mensagem += `Conforme acordo com juros congelados até ${dataStrCongelada} (${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"} de juros calculados), o valor total para pagamento é de ${formatCurrencyShared(valorAtualizado)}.\n`;
      } else {
        mensagem += `Conforme acordo com juros congelados até ${dataStrCongelada}, o valor total para pagamento é de ${formatCurrencyShared(valorAtualizado)}.\n`;
      }
    } else {
      mensagem += `O valor acordado com juros congelados para pagamento é de ${formatCurrencyShared(valorAtualizado)}.\n`;
    }
  } else {
    mensagem += `O valor restante, atualizado com juros de atraso (${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"} de juros calculados) é de ${formatCurrencyShared(valorAtualizado)}.\n`;
  }

  mensagem += `Por favor, regularize o quanto antes para evitar maiores encargos.`;
  return mensagem;
};

export const buildWhatsAppPaymentMessageShared = (
  settings: WhatsAppSettingsLike,
  params: {
    type:
      | "a_vencer"
      | "pre_vencimento"
      | "vence_hoje"
      | "congelado"
      | "vencido"
      | "confirmacao";
    cliente: string;
    p: any;
    sim?: any;
    client?: any;
    prazo?: string;
    valor: number;
    valorDivida?: number;
    dias?: number;
    dataStr?: string;
    hojeDate?: Date;
  },
): string => {
  const itemDesc =
    params.prazo === "abater"
      ? "seu Lembrete de Pagamento"
      : `sua Parcela ${params.p.numero}`;
  const formattedValor = formatCurrencyShared(params.valor);
  const pAbatTotal = Array.isArray(params.p?.abatimentos)
    ? params.p.abatimentos.reduce(
        (acc: number, a: any) => acc + parseMonetaryValueShared(a?.valor ?? 0),
        0,
      )
    : 0;
  const calc = calculateParcelaDetails(params.p, {
    sim: params.sim,
    taxaGlobal: settings.taxaAtrasoDia,
    hoje: params.hojeDate || new Date(),
  });
  const resolvedValorDivida =
    params.valorDivida !== undefined
      ? params.valorDivida
      : params.type === "confirmacao"
        ? calc.valorOriginal || params.valor
        : calc.valorTotalSemAbatimentos || params.valor + pAbatTotal;
  const formattedValorDivida = formatCurrencyShared(resolvedValorDivida);
  const menos60 = computeParcelaMenos60Tags(resolvedValorDivida);
  const formattedData = params.dataStr
    ? formatDateShared(params.dataStr)
    : params.p.dataVencimento
      ? formatDateShared(params.p.dataVencimento)
      : "";

  const abatimentosTexto = formatAbatimentosWhatsAppShared(
    params.p,
    params.sim,
    params.client,
  );
  const prazoCongelamentoStr = calc.freezeEndDateISO
    ? formatISOToBR(calc.freezeEndDateISO)
    : "";
  const isCongeladoMsg =
    params.type === "congelado" || calc.isCongeladoEfetivo;
  const finalizeCongeladoMsg = (tplText: string, rendered: string) => {
    let out = rendered;
    if (
      isCongeladoMsg &&
      abatimentosTexto &&
      !/\{abatimentos\}/i.test(tplText)
    ) {
      out = `${out}\n\n${abatimentosTexto}`;
    }
    if (
      isCongeladoMsg &&
      calc.isCongelado7DiasAtivo &&
      calc.freezeEndDateISO &&
      !/\{prazo_congelamento\}/i.test(tplText)
    ) {
      out = `${out}\n\nPrazo do congelamento (40% - 7 dias corridos): até ${formatISOToBR(calc.freezeEndDateISO)}. Após esse prazo, caso o saldo restante não seja quitado integralmente, os juros diários serão retomados sobre o saldo restante.`;
    }
    return out;
  };

  const customOverride = (settings.customWhatsAppTemplates || []).find(
    (tpl) =>
      tpl.situacao === params.type && tpl.text && tpl.text.trim().length > 0,
  );
  if (customOverride) {
    const renderedCustom = renderWhatsAppTemplateShared(customOverride.text, {
      cliente: params.cliente,
      valor: formattedValor,
      valorDivida: formattedValorDivida,
      valorMenos60: menos60.valorMenos60,
      valor60: menos60.valor60,
      calculoMenos60: menos60.calculoMenos60,
      data: formattedData,
      referencia: itemDesc,
      dias: params.dias ?? 0,
      abatimentos: abatimentosTexto,
      prazoCongelamento: prazoCongelamentoStr,
    });
    return finalizeCongeladoMsg(customOverride.text, renderedCustom);
  }

  if (params.type === "vencido") {
    return generateVencidaMessageShared(
      settings,
      params.cliente,
      params.p,
      params.dias || 0,
      params.valor,
      params.prazo,
      params.sim,
      params.client,
      resolvedValorDivida,
      params.hojeDate,
    );
  }

  const templateMap: Record<Exclude<typeof params.type, "vencido">, string> = {
    a_vencer: settings.msgLembreteAVencer?.trim()
      ? settings.msgLembreteAVencer
      : DEFAULT_WHATSAPP_TEMPLATES.msgLembreteAVencer,
    pre_vencimento: settings.msgLembretePreVencimento?.trim()
      ? settings.msgLembretePreVencimento
      : DEFAULT_WHATSAPP_TEMPLATES.msgLembretePreVencimento,
    vence_hoje: settings.msgLembreteVenceHoje?.trim()
      ? settings.msgLembreteVenceHoje
      : DEFAULT_WHATSAPP_TEMPLATES.msgLembreteVenceHoje,
    congelado: settings.msgLembreteCongelado?.trim()
      ? settings.msgLembreteCongelado
      : DEFAULT_WHATSAPP_TEMPLATES.msgLembreteCongelado,
    confirmacao: settings.msgLembreteConfirmacao?.trim()
      ? settings.msgLembreteConfirmacao
      : DEFAULT_WHATSAPP_TEMPLATES.msgLembreteConfirmacao,
  };

  const selectedTemplate = templateMap[params.type];
  const renderedMsg = renderWhatsAppTemplateShared(selectedTemplate, {
    cliente: params.cliente,
    valor: formattedValor,
    valorDivida: formattedValorDivida,
    valorMenos60: menos60.valorMenos60,
    valor60: menos60.valor60,
    calculoMenos60: menos60.calculoMenos60,
    data: formattedData,
    referencia: itemDesc,
    dias: params.dias ?? 0,
    abatimentos: abatimentosTexto,
    prazoCongelamento: prazoCongelamentoStr,
  });
  return finalizeCongeladoMsg(selectedTemplate, renderedMsg);
};

export const normalizeWhatsAppDigitsShared = (
  phone: string | undefined,
): string => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length > 11 && digits.startsWith("55")
    ? digits
    : `55${digits}`;
};

export const resolveWhatsAppTargetPhoneShared = (
  settings: WhatsAppSettingsLike,
  clientPhone: string | undefined,
  type: Exclude<WaSituacaoType, "personalizado">,
): { phone: string; hasCustomPhone: boolean } => {
  const customOverride = (settings.customWhatsAppTemplates || []).find(
    (tpl) =>
      tpl.situacao === type && tpl.text && tpl.text.trim().length > 0,
  );
  if (customOverride?.telefone && customOverride.telefone.trim()) {
    return { phone: customOverride.telefone.trim(), hasCustomPhone: true };
  }
  const situacaoToKey: Record<
    Exclude<WaSituacaoType, "personalizado">,
    WaTemplateKey
  > = {
    a_vencer: "msgLembreteAVencer",
    pre_vencimento: "msgLembretePreVencimento",
    vence_hoje: "msgLembreteVenceHoje",
    congelado: "msgLembreteCongelado",
    vencido: "msgLembreteVencido",
    confirmacao: "msgLembreteConfirmacao",
  };
  const configuredPhone =
    settings.msgTelefones?.[situacaoToKey[type]]?.trim();
  if (configuredPhone) {
    return { phone: configuredPhone, hasCustomPhone: true };
  }
  return { phone: clientPhone || "", hasCustomPhone: false };
};

export const normalizeAutoScheduleConfig = (
  raw?: Partial<AutoScheduleConfig> | null,
): AutoScheduleConfig => {
  const cfg = raw || {};
  return {
    ...DEFAULT_AUTO_SCHEDULE_CONFIG,
    ...cfg,
    enabled: Boolean(cfg.enabled),
    horarioExecucao:
      typeof cfg.horarioExecucao === "string" &&
      /^\d{2}:\d{2}$/.test(cfg.horarioExecucao)
        ? cfg.horarioExecucao
        : DEFAULT_AUTO_SCHEDULE_CONFIG.horarioExecucao,
    enviarPreVencimento:
      cfg.enviarPreVencimento !== undefined
        ? Boolean(cfg.enviarPreVencimento)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.enviarPreVencimento,
    preVencimentoModo:
      cfg.preVencimentoModo === "dia_exato" ? "dia_exato" : "janela",
    enviarVenceHoje:
      cfg.enviarVenceHoje !== undefined
        ? Boolean(cfg.enviarVenceHoje)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.enviarVenceHoje,
    enviarVencido:
      cfg.enviarVencido !== undefined
        ? Boolean(cfg.enviarVencido)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.enviarVencido,
    frequenciaVencidoDias: String(
      Math.max(
        1,
        parseInt(String(cfg.frequenciaVencidoDias || "3"), 10) || 3,
      ),
    ),
    enviarCongelado:
      cfg.enviarCongelado !== undefined
        ? Boolean(cfg.enviarCongelado)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.enviarCongelado,
    frequenciaCongeladoDias: String(
      Math.max(
        1,
        parseInt(String(cfg.frequenciaCongeladoDias || "7"), 10) || 7,
      ),
    ),
    incluirEmprestimos:
      cfg.incluirEmprestimos !== undefined
        ? Boolean(cfg.incluirEmprestimos)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.incluirEmprestimos,
    incluirLembretesAbater:
      cfg.incluirLembretesAbater !== undefined
        ? Boolean(cfg.incluirLembretesAbater)
        : DEFAULT_AUTO_SCHEDULE_CONFIG.incluirLembretesAbater,
    modoEnvio:
      cfg.modoEnvio === "webhook_api" ? "webhook_api" : "fila_whatsapp_business",
    webhookUrl: String(cfg.webhookUrl || "").trim(),
    webhookToken: String(cfg.webhookToken || "").trim(),
    lastRunDate: String(cfg.lastRunDate || ""),
    lastRunAt: String(cfg.lastRunAt || ""),
  };
};

export const evaluateAutoScheduleNotifications = (
  clients: any[],
  settings: WhatsAppSettingsLike,
  dateISO: string = getBrazilTodayISO(),
): ScheduledWhatsAppNotification[] => {
  const config = normalizeAutoScheduleConfig(settings.autoScheduleConfig);
  const hoje = parseLocalDateShared(dateISO);
  hoje.setHours(0, 0, 0, 0);
  const maxDiasAntecipado = Math.max(
    1,
    parseInt(String(settings.diasLembreteAntecipado || "3"), 10) || 3,
  );
  const freqVencido = Math.max(
    1,
    parseInt(config.frequenciaVencidoDias || "3", 10) || 3,
  );
  const freqCongelado = Math.max(
    1,
    parseInt(config.frequenciaCongeladoDias || "7", 10) || 7,
  );

  const notifications: ScheduledWhatsAppNotification[] = [];
  const nowISO = new Date().toISOString();

  for (const c of clients || []) {
    if (!c || c.id === "admin-transactions") continue;
    const sims = c.simulacoes || (c.simulacao ? [c.simulacao] : []);

    sims.forEach((s: any, sIdx: number) => {
      if (!isSimulacaoAtivaShared(s)) return;
      const isAbater = s.prazo === "abater";
      if (isAbater && !config.incluirLembretesAbater) return;
      if (!isAbater && !config.incluirEmprestimos) return;

      const parcelas = Array.isArray(s.parcelas) ? s.parcelas : [];
      parcelas.forEach((p: any, pIdx: number) => {
        const isPago = Boolean(p?.paga || p?.status === "pago");
        if (isPago) return;
        const vencDateStr = String(p?.dataVencimento || "").split("T")[0];
        if (!vencDateStr) return;

        const vencimento = parseLocalDateShared(vencDateStr);
        vencimento.setHours(0, 0, 0, 0);

        const diffMs = vencimento.getTime() - hoje.getTime();
        const diasParaVencimento = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const calc = calculateParcelaDetails(p, {
          sim: s,
          taxaGlobal: settings.taxaAtrasoDia,
          hoje,
        });
        const diasAtraso = calc.diasJurosCobrados;
        const valorComJuros = calc.valorTotalSemAbatimentos;
        const valorRestante = calc.valorAtualizado;

        const isCongelado = calc.isCongeladoEfetivo;
        const isVencendoHoje =
          !isCongelado && vencimento.getTime() === hoje.getTime();
        const isVencido = !isCongelado && !isVencendoHoje && vencimento < hoje;
        const isPreVencimento =
          !isCongelado &&
          (config.preVencimentoModo === "dia_exato"
            ? diasParaVencimento === maxDiasAntecipado
            : diasParaVencimento >= 1 &&
              diasParaVencimento <= maxDiasAntecipado);

        let situacao: ScheduledWhatsAppNotification["situacao"] | null = null;
        let diasVal = 0;
        let dataStrForTemplate = vencDateStr;

        if (isCongelado) {
          if (!config.enviarCongelado) return;
          const refDateStr =
            calc.freezeStartDateISO ||
            String(p.dataCongelamento || "").split("T")[0] ||
            vencDateStr;
          const refDate = parseLocalDateShared(refDateStr);
          const diffRefDays = Math.abs(
            Math.round(
              (hoje.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          if (diffRefDays % freqCongelado !== 0) return;
          situacao = "congelado";
          diasVal = diasAtraso;
          dataStrForTemplate = refDateStr;
        } else if (isVencendoHoje) {
          if (!config.enviarVenceHoje) return;
          situacao = "vence_hoje";
          diasVal = 0;
        } else if (isPreVencimento) {
          if (!config.enviarPreVencimento) return;
          situacao = "pre_vencimento";
          diasVal = diasParaVencimento;
        } else if (isVencido) {
          if (!config.enviarVencido) return;
          const effectiveDelay = Math.max(1, Math.abs(diasParaVencimento));
          if ((effectiveDelay - 1) % freqVencido !== 0) return;
          situacao = "vencido";
          diasVal = diasAtraso || effectiveDelay;
        } else {
          return;
        }

        const clientName = c.nomeCompleto || "Cliente";
        const message = buildWhatsAppPaymentMessageShared(settings, {
          type: situacao,
          cliente: clientName,
          p,
          sim: s,
          client: c,
          prazo: s.prazo,
          valor: valorRestante,
          valorDivida: valorComJuros,
          dias: diasVal,
          dataStr: dataStrForTemplate,
          hojeDate: hoje,
        });

        const { phone, hasCustomPhone } = resolveWhatsAppTargetPhoneShared(
          settings,
          c.telefone,
          situacao,
        );
        const phoneDigits = normalizeWhatsAppDigitsShared(phone);

        notifications.push({
          id: `${dateISO}_${c.id}_${sIdx}_${pIdx}_${situacao}`,
          dateISO,
          createdAt: nowISO,
          scheduledForTime: config.horarioExecucao,
          clientId: String(c.id),
          clientName,
          clientCpf: String(c.cpf || ""),
          phone: phone || "",
          phoneDigits,
          hasCustomPhone,
          simIndex: sIdx,
          parcelaIndex: pIdx,
          parcelaNumero: Number(p.numero || pIdx + 1),
          prazo: String(s.prazo || "mensal"),
          dataVencimento: vencDateStr,
          situacao,
          dias: diasVal,
          valor: valorRestante,
          valorDivida: valorComJuros,
          message,
          status: "pendente",
        });
      });
    });
  }

  return notifications.sort((a, b) => {
    const order = { vence_hoje: 0, vencido: 1, pre_vencimento: 2, congelado: 3 };
    const diff = order[a.situacao] - order[b.situacao];
    if (diff !== 0) return diff;
    return a.clientName.localeCompare(b.clientName);
  });
};
