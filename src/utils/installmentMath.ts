export interface AbatimentoEntry {
  data: string;
  valor: number;
}

export interface AbatimentoTimelineStep {
  dataISO: string;
  valorAbatido: number;
  saldoAntesAbatimento: number;
  saldoAposAbatimento: number;
  diasJurosAteData: number;
  jurosAteData: number;
  percentualParcela: number;
  percentualSaldo: number;
  qualifica40Porcento: boolean;
  dataFimCongelamentoISO: string | null;
}

export interface ParcelaCalculationResult {
  isPago: boolean;
  valorOriginal: number;
  abatimentosTotal: number;
  taxaDia: number;
  hasDailyInterest: boolean;
  vencimentoISO: string;
  hojeISO: string;
  diasAtrasoCalendario: number;
  diasJurosAntesAbatimentos: number;
  diasJurosAposCongelamento: number;
  diasJurosCobrados: number;
  jurosAntesAbatimentos: number;
  jurosAposCongelamento: number;
  jurosTotal: number;
  valorTotalSemAbatimentos: number;
  valorAtualizado: number;
  saldoAposUltimoAbatimento: number;
  isManualFrozen: boolean;
  isCongelado7DiasAtivo: boolean;
  isCongeladoEfetivo: boolean;
  isPrazo7DiasVencido: boolean;
  freezeStartDateISO: string | null;
  freezeEndDateISO: string | null;
  diasRestantesCongelamento: number;
  valorMinimo40PorcentoHoje: number;
  steps: AbatimentoTimelineStep[];
}

export const parseMonetaryNumber = (val: any): number => {
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

export const toISODateOnly = (dateInput: any): string => {
  if (!dateInput) return "";
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return "";
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, "0");
    const d = String(dateInput.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const str = String(dateInput).trim();
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(str)) {
    const [d, m, y] = str.split(/[\/\-]/);
    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const match = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (match) {
    let y = parseInt(match[1], 10);
    if (y < 1900) y += 2000 - (y % 100);
    return `${String(y).padStart(4, "0")}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }
  return "";
};

const isoToUTCTimestamp = (iso: string): number => {
  const clean = toISODateOnly(iso);
  if (!clean) return NaN;
  const [y, m, d] = clean.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const addDaysISO = (dateInput: any, days: number): string => {
  const clean = toISODateOnly(dateInput);
  if (!clean) return "";
  const [y, m, d] = clean.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

export const diffDaysISO = (later: any, earlier: any): number => {
  const tsLater = isoToUTCTimestamp(toISODateOnly(later));
  const tsEarlier = isoToUTCTimestamp(toISODateOnly(earlier));
  if (isNaN(tsLater) || isNaN(tsEarlier)) return 0;
  return Math.round((tsLater - tsEarlier) / (1000 * 60 * 60 * 24));
};

const maxISO = (...dates: (string | null | undefined)[]): string => {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return "";
  return valid.reduce((a, b) => (a >= b ? a : b));
};

const minISO = (...dates: (string | null | undefined)[]): string => {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return "";
  return valid.reduce((a, b) => (a <= b ? a : b));
};

export const formatISOToBR = (iso: string | null | undefined): string => {
  const clean = toISODateOnly(iso);
  if (!clean) return "";
  const [y, m, d] = clean.split("-");
  return `${d}/${m}/${y}`;
};

export const resolveParcelaDailyRate = (
  p: any,
  sim?: any,
  taxaGlobal: string | number = "1",
): { hasDailyInterest: boolean; taxaDia: number } => {
  const prazo = sim?.prazo ?? p?.prazo;
  const aplicarJurosDiarios = sim?.aplicarJurosDiarios ?? p?.aplicarJurosDiarios;
  const simTaxa = sim?.taxaAtrasoDia ?? p?.taxaAtrasoDia;

  const hasDailyInterest =
    prazo === "abater"
      ? Boolean(aplicarJurosDiarios) ||
        (aplicarJurosDiarios !== false && parseFloat(String(simTaxa || "0")) > 0)
      : true;

  const taxaDia = hasDailyInterest
    ? parseFloat(String(simTaxa || "")) ||
      parseFloat(String(taxaGlobal || "0")) ||
      1
    : 0;

  return { hasDailyInterest, taxaDia };
};

export const calculateParcelaDetails = (
  p: any,
  options?: {
    sim?: any;
    taxaGlobal?: string | number;
    hoje?: Date | string;
  },
): ParcelaCalculationResult => {
  const hojeISO = toISODateOnly(options?.hoje || new Date()) || toISODateOnly(new Date());
  const vencimentoISO = toISODateOnly(p?.dataVencimento) || hojeISO;
  const valorOriginal = Math.max(0, parseMonetaryNumber(p?.valor || 0));
  const isPago = Boolean(p?.paga || p?.status === "pago");
  const { hasDailyInterest, taxaDia } = resolveParcelaDailyRate(
    p,
    options?.sim,
    options?.taxaGlobal ?? "1",
  );

  const rawAbatimentos: AbatimentoEntry[] = (
    Array.isArray(p?.abatimentos) ? p.abatimentos : []
  )
    .map((a: any) => ({
      data: toISODateOnly(a?.data || a?.dataPagamento || a?.date) || vencimentoISO,
      valor: Math.max(0, parseMonetaryNumber(a?.valor ?? a?.value ?? 0)),
    }))
    .filter((a) => a.valor > 0);

  rawAbatimentos.sort((a, b) => a.data.localeCompare(b.data));

  const abatimentosTotal = rawAbatimentos.reduce((acc, a) => acc + a.valor, 0);

  // Agrupar abatimentos feitos na mesma data para avaliacao justa dos 40%
  const groupedByDateMap = new Map<string, number>();
  for (const a of rawAbatimentos) {
    groupedByDateMap.set(a.data, (groupedByDateMap.get(a.data) || 0) + a.valor);
  }
  const events = Array.from(groupedByDateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dataISO, valor]) => ({ dataISO, valor }));

  const diasAtrasoCalendario =
    !isPago && hojeISO > vencimentoISO
      ? Math.max(0, diffDaysISO(hojeISO, vencimentoISO))
      : 0;

  if (isPago) {
    return {
      isPago: true,
      valorOriginal,
      abatimentosTotal,
      taxaDia,
      hasDailyInterest,
      vencimentoISO,
      hojeISO,
      diasAtrasoCalendario: 0,
      diasJurosAntesAbatimentos: 0,
      diasJurosAposCongelamento: 0,
      diasJurosCobrados: 0,
      jurosAntesAbatimentos: 0,
      jurosAposCongelamento: 0,
      jurosTotal: 0,
      valorTotalSemAbatimentos: valorOriginal,
      valorAtualizado: valorOriginal,
      saldoAposUltimoAbatimento: Math.max(0, valorOriginal - abatimentosTotal),
      isManualFrozen: false,
      isCongelado7DiasAtivo: false,
      isCongeladoEfetivo: false,
      isPrazo7DiasVencido: false,
      freezeStartDateISO: null,
      freezeEndDateISO: null,
      diasRestantesCongelamento: 0,
      valorMinimo40PorcentoHoje: valorOriginal * 0.4,
      steps: [],
    };
  }

  const isManualFrozen = Boolean(p?.jurosCongelados || p?.isCongelamento);

  // Modo congelamento manual explicito pelo admin (preserva congelamento indeterminado na dataCongelamento)
  if (isManualFrozen) {
    const manualCeilingISO = p?.dataCongelamento
      ? toISODateOnly(p.dataCongelamento) || vencimentoISO
      : vencimentoISO;
    const effectiveEndISO = maxISO(vencimentoISO, minISO(hojeISO, manualCeilingISO));

    let saldo = valorOriginal;
    let cursorISO = vencimentoISO;
    let diasAntes = 0;
    let jurosAntes = 0;
    const steps: AbatimentoTimelineStep[] = [];

    for (const ev of events) {
      const targetForInterest = minISO(ev.dataISO, effectiveEndISO);
      const diasEntre =
        saldo > 0 && targetForInterest > cursorISO
          ? Math.max(0, diffDaysISO(targetForInterest, cursorISO))
          : 0;
      const jurosPeriodo =
        diasEntre > 0 && taxaDia > 0 ? saldo * (taxaDia / 100) * diasEntre : 0;
      const saldoAntes = saldo + jurosPeriodo;
      jurosAntes += jurosPeriodo;
      diasAntes += diasEntre;

      const percParcela = valorOriginal > 0 ? (ev.valor / valorOriginal) * 100 : 0;
      const percSaldo = saldoAntes > 0 ? (ev.valor / saldoAntes) * 100 : 0;
      const qualifica40 =
        ev.valor > 0 &&
        saldoAntes > 0 &&
        ev.valor >= Math.min(valorOriginal, saldoAntes) * 0.4 - 0.01;

      saldo = Math.max(0, saldoAntes - ev.valor);
      if (targetForInterest > cursorISO) {
        cursorISO = targetForInterest;
      }

      steps.push({
        dataISO: ev.dataISO,
        valorAbatido: ev.valor,
        saldoAntesAbatimento: saldoAntes,
        saldoAposAbatimento: saldo,
        diasJurosAteData: diasEntre,
        jurosAteData: jurosPeriodo,
        percentualParcela: percParcela,
        percentualSaldo: percSaldo,
        qualifica40Porcento: qualifica40,
        dataFimCongelamentoISO: null,
      });
    }

    const diasRestantesAteCeiling =
      saldo > 0 && effectiveEndISO > cursorISO
        ? Math.max(0, diffDaysISO(effectiveEndISO, cursorISO))
        : 0;
    const jurosRestantesAteCeiling =
      diasRestantesAteCeiling > 0 && taxaDia > 0
        ? saldo * (taxaDia / 100) * diasRestantesAteCeiling
        : 0;

    jurosAntes += jurosRestantesAteCeiling;
    diasAntes += diasRestantesAteCeiling;
    const valorAtualizado = Math.max(0, saldo + jurosRestantesAteCeiling);
    const valorTotalSemAbatimentos = valorAtualizado + abatimentosTotal;

    return {
      isPago: false,
      valorOriginal,
      abatimentosTotal,
      taxaDia,
      hasDailyInterest,
      vencimentoISO,
      hojeISO,
      diasAtrasoCalendario,
      diasJurosAntesAbatimentos: diasAntes,
      diasJurosAposCongelamento: 0,
      diasJurosCobrados: diasAntes,
      jurosAntesAbatimentos: jurosAntes,
      jurosAposCongelamento: 0,
      jurosTotal: jurosAntes,
      valorTotalSemAbatimentos,
      valorAtualizado,
      saldoAposUltimoAbatimento: valorAtualizado,
      isManualFrozen: true,
      isCongelado7DiasAtivo: false,
      isCongeladoEfetivo: true,
      isPrazo7DiasVencido: false,
      freezeStartDateISO: p?.dataCongelamento
        ? toISODateOnly(p.dataCongelamento)
        : vencimentoISO,
      freezeEndDateISO: null,
      diasRestantesCongelamento: 0,
      valorMinimo40PorcentoHoje: valorAtualizado * 0.4,
      steps,
    };
  }

  // Modo automatico: regra GM de 40% / congelamento por 7 dias corridos e retomada apos 7 dias sobre saldo restante
  let saldo = valorOriginal;
  let cursorISO = vencimentoISO;
  let jurosAntesAbatimentos = 0;
  let diasJurosAntesAbatimentos = 0;
  let last40FreezeStartISO: string | null = null;
  let last40FreezeEndISO: string | null = null;
  const steps: AbatimentoTimelineStep[] = [];

  for (const ev of events) {
    const interestEvalDate = minISO(ev.dataISO, hojeISO);
    const diasEntre =
      saldo > 0 && interestEvalDate > cursorISO
        ? Math.max(0, diffDaysISO(interestEvalDate, cursorISO))
        : 0;
    const jurosPeriodo =
      diasEntre > 0 && taxaDia > 0 ? saldo * (taxaDia / 100) * diasEntre : 0;
    const saldoAntesAbatimento = saldo + jurosPeriodo;
    jurosAntesAbatimentos += jurosPeriodo;
    diasJurosAntesAbatimentos += diasEntre;

    const base40 = Math.min(valorOriginal, saldoAntesAbatimento);
    const qualifica40Porcento =
      ev.valor > 0 &&
      saldoAntesAbatimento > 0 &&
      ev.valor >= base40 * 0.4 - 0.01;

    const percParcela =
      valorOriginal > 0 ? (ev.valor / valorOriginal) * 100 : 0;
    const percSaldo =
      saldoAntesAbatimento > 0 ? (ev.valor / saldoAntesAbatimento) * 100 : 0;

    const saldoAposAbatimento = Math.max(0, saldoAntesAbatimento - ev.valor);
    saldo = saldoAposAbatimento;

    let stepFreezeEndISO: string | null = null;
    if (qualifica40Porcento && saldoAposAbatimento > 0) {
      stepFreezeEndISO = addDaysISO(ev.dataISO, 7);
      last40FreezeStartISO = ev.dataISO;
      last40FreezeEndISO = maxISO(last40FreezeEndISO, stepFreezeEndISO);
      cursorISO = maxISO(vencimentoISO, cursorISO, stepFreezeEndISO);
    } else {
      cursorISO = maxISO(vencimentoISO, cursorISO, interestEvalDate);
    }

    steps.push({
      dataISO: ev.dataISO,
      valorAbatido: ev.valor,
      saldoAntesAbatimento,
      saldoAposAbatimento,
      diasJurosAteData: diasEntre,
      jurosAteData: jurosPeriodo,
      percentualParcela: percParcela,
      percentualSaldo: percSaldo,
      qualifica40Porcento,
      dataFimCongelamentoISO: stepFreezeEndISO,
    });
  }

  const saldoAposUltimoAbatimento = saldo;

  const isCongelado7DiasAtivo = Boolean(
    last40FreezeStartISO &&
      last40FreezeEndISO &&
      last40FreezeEndISO > vencimentoISO &&
      saldo > 0 &&
      hasDailyInterest &&
      taxaDia > 0 &&
      hojeISO >= last40FreezeStartISO &&
      hojeISO <= last40FreezeEndISO,
  );

  const isPrazo7DiasVencido = Boolean(
    last40FreezeEndISO &&
      saldo > 0 &&
      hasDailyInterest &&
      taxaDia > 0 &&
      hojeISO > maxISO(vencimentoISO, last40FreezeEndISO),
  );

  const diasAposCursor =
    saldo > 0 && hojeISO > cursorISO
      ? Math.max(0, diffDaysISO(hojeISO, cursorISO))
      : 0;

  const jurosAposCursor =
    diasAposCursor > 0 && taxaDia > 0
      ? saldo * (taxaDia / 100) * diasAposCursor
      : 0;

  const diasJurosAposCongelamento = last40FreezeEndISO ? diasAposCursor : 0;
  const jurosAposCongelamento = last40FreezeEndISO ? jurosAposCursor : 0;
  const diasJurosCobrados = diasJurosAntesAbatimentos + diasAposCursor;
  const jurosTotal = jurosAntesAbatimentos + jurosAposCursor;
  const valorAtualizado = Math.max(0, saldo + jurosAposCursor);
  const valorTotalSemAbatimentos = valorAtualizado + abatimentosTotal;

  const diasRestantesCongelamento =
    isCongelado7DiasAtivo && last40FreezeEndISO
      ? Math.max(0, diffDaysISO(last40FreezeEndISO, hojeISO))
      : 0;

  return {
    isPago: false,
    valorOriginal,
    abatimentosTotal,
    taxaDia,
    hasDailyInterest,
    vencimentoISO,
    hojeISO,
    diasAtrasoCalendario,
    diasJurosAntesAbatimentos,
    diasJurosAposCongelamento,
    diasJurosCobrados,
    jurosAntesAbatimentos,
    jurosAposCongelamento,
    jurosTotal,
    valorTotalSemAbatimentos,
    valorAtualizado,
    saldoAposUltimoAbatimento,
    isManualFrozen: false,
    isCongelado7DiasAtivo,
    isCongeladoEfetivo: isCongelado7DiasAtivo,
    isPrazo7DiasVencido,
    freezeStartDateISO: last40FreezeStartISO,
    freezeEndDateISO: last40FreezeEndISO,
    diasRestantesCongelamento,
    valorMinimo40PorcentoHoje: valorAtualizado * 0.4,
    steps,
  };
};
