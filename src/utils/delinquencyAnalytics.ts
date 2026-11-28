import {
  calculateParcelaDetails,
  parseMonetaryNumber,
  toISODateOnly,
} from "./installmentMath";
import {
  getBrazilTodayISO,
  isSimulacaoAtivaShared,
} from "./whatsappReminders";

export interface MonthlyDelinquencyPoint {
  monthKey: string; // "YYYY-MM"
  monthLabel: string; // "Jan/26"
  monthFullLabel: string; // "Janeiro/2026"
  overdueCount: number;
  overdueClientsCount: number;
  overdueOriginalTotal: number;
  overdueUpdatedTotal: number;
  frozenOverdueCount: number;
  totalDueCount: number;
  totalDueOriginal: number;
  delinquencyRatePct: number;
}

export interface DelinquencySummary {
  totalOverdueCount: number;
  uniqueOverdueClients: number;
  totalOverdueOriginal: number;
  totalOverdueUpdated: number;
  totalDueCount: number;
  totalDueOriginal: number;
  overallRatePct: number;
  peakMonth: MonthlyDelinquencyPoint | null;
}

export interface DelinquencySeriesResult {
  points: MonthlyDelinquencyPoint[];
  summary: DelinquencySummary;
  availableYears: string[];
  todayISO: string;
}

export type DelinquencyPeriodOption = "6m" | "12m" | "all" | `year:${string}`;

const MONTH_SHORT_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const MONTH_FULL_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const formatMonthShortLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split("-");
  const idx = parseInt(m, 10) - 1;
  if (!y || idx < 0 || idx > 11) return monthKey;
  return `${MONTH_SHORT_PT[idx]}/${y.slice(-2)}`;
};

export const formatMonthFullLabel = (monthKey: string): string => {
  const [y, m] = monthKey.split("-");
  const idx = parseInt(m, 10) - 1;
  if (!y || idx < 0 || idx > 11) return monthKey;
  return `${MONTH_FULL_PT[idx]}/${y}`;
};

const shiftMonthKey = (monthKey: string, deltaMonths: number): string => {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + deltaMonths, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
};

const enumerateMonths = (startMonthKey: string, endMonthKey: string): string[] => {
  if (!startMonthKey || !endMonthKey || startMonthKey > endMonthKey) return [];
  const keys: string[] = [];
  let cursor = startMonthKey;
  let guard = 0;
  while (cursor <= endMonthKey && guard < 240) {
    keys.push(cursor);
    cursor = shiftMonthKey(cursor, 1);
    guard++;
  }
  return keys;
};

interface BucketAccumulator {
  overdueCount: number;
  overdueClientIds: Set<string>;
  overdueOriginalTotal: number;
  overdueUpdatedTotal: number;
  frozenOverdueCount: number;
  totalDueCount: number;
  totalDueOriginal: number;
}

const createEmptyBucket = (): BucketAccumulator => ({
  overdueCount: 0,
  overdueClientIds: new Set<string>(),
  overdueOriginalTotal: 0,
  overdueUpdatedTotal: 0,
  frozenOverdueCount: 0,
  totalDueCount: 0,
  totalDueOriginal: 0,
});

const roundCurrency = (n: number): number =>
  Math.round((Number(n) || 0) * 100) / 100;

export const computeMonthlyDelinquencySeries = (
  clients: any[],
  options?: {
    taxaAtrasoDia?: string | number;
    todayISO?: string;
    period?: DelinquencyPeriodOption;
    includeFrozen?: boolean;
  },
): DelinquencySeriesResult => {
  const todayISO =
    toISODateOnly(options?.todayISO) || getBrazilTodayISO();
  const currentMonthKey = todayISO.slice(0, 7);
  const currentYear = todayISO.slice(0, 4);
  const period: DelinquencyPeriodOption = options?.period || "12m";
  const includeFrozen = options?.includeFrozen ?? true;
  const taxaGlobal = options?.taxaAtrasoDia ?? "8";

  const buckets = new Map<string, BucketAccumulator>();
  const yearsSet = new Set<string>([currentYear]);
  const allPeriodClientIdsByMonth = new Map<string, Set<string>>();

  for (const client of clients || []) {
    if (!client || client.id === "admin-transactions") continue;
    const clientId = String(client.id || client.cpf || client.nomeCompleto || "");
    const sims = Array.isArray(client.simulacoes)
      ? client.simulacoes
      : client.simulacao
        ? [client.simulacao]
        : [];

    for (const sim of sims) {
      if (!isSimulacaoAtivaShared(sim)) continue;
      const parcelas = Array.isArray(sim.parcelas) ? sim.parcelas : [];

      for (const p of parcelas) {
        const vencISO = toISODateOnly(p?.dataVencimento);
        if (!vencISO || vencISO.length < 7) continue;

        const monthKey = vencISO.slice(0, 7);
        const year = vencISO.slice(0, 4);
        yearsSet.add(year);

        const calc = calculateParcelaDetails(p, {
          sim,
          taxaGlobal,
          hoje: todayISO,
        });

        let bucket = buckets.get(monthKey);
        if (!bucket) {
          bucket = createEmptyBucket();
          buckets.set(monthKey, bucket);
        }

        const netOriginal = Math.max(
          0,
          parseMonetaryNumber(calc.valorOriginal) -
            parseMonetaryNumber(calc.abatimentosTotal),
        );

        // Only count installments whose due date is on or before today for due-base comparison,
        // or if paid already, count toward that due month's base.
        if (vencISO <= todayISO || calc.isPago) {
          bucket.totalDueCount += 1;
          bucket.totalDueOriginal += netOriginal;
        }

        const isPastDue = !calc.isPago && vencISO < todayISO;
        if (!isPastDue) continue;

        if (calc.isCongeladoEfetivo) {
          bucket.frozenOverdueCount += 1;
          if (!includeFrozen) continue;
        }

        bucket.overdueCount += 1;
        if (clientId) {
          bucket.overdueClientIds.add(clientId);
          let mSet = allPeriodClientIdsByMonth.get(monthKey);
          if (!mSet) {
            mSet = new Set<string>();
            allPeriodClientIdsByMonth.set(monthKey, mSet);
          }
          mSet.add(clientId);
        }
        bucket.overdueOriginalTotal += netOriginal;
        bucket.overdueUpdatedTotal += Math.max(
          0,
          parseMonetaryNumber(calc.valorAtualizado),
        );
      }
    }
  }

  let targetMonthKeys: string[] = [];
  if (period === "6m") {
    targetMonthKeys = enumerateMonths(
      shiftMonthKey(currentMonthKey, -5),
      currentMonthKey,
    );
  } else if (period === "12m") {
    targetMonthKeys = enumerateMonths(
      shiftMonthKey(currentMonthKey, -11),
      currentMonthKey,
    );
  } else if (period.startsWith("year:")) {
    const year = period.slice(5);
    const maxMonth = year === currentYear ? currentMonthKey : `${year}-12`;
    targetMonthKeys = enumerateMonths(`${year}-01`, maxMonth);
    if (targetMonthKeys.length === 0) {
      targetMonthKeys = enumerateMonths(`${year}-01`, `${year}-12`);
    }
  } else {
    // "all": span from earliest month with overdue (or earliest bucket <= currentMonthKey) to currentMonthKey
    const relevantKeys = Array.from(buckets.keys())
      .filter((k) => {
        const b = buckets.get(k);
        return b && (b.overdueCount > 0 || k <= currentMonthKey);
      })
      .sort();
    if (relevantKeys.length === 0) {
      targetMonthKeys = enumerateMonths(
        shiftMonthKey(currentMonthKey, -5),
        currentMonthKey,
      );
    } else {
      const startKey = relevantKeys[0];
      const endKey =
        relevantKeys[relevantKeys.length - 1] > currentMonthKey
          ? relevantKeys[relevantKeys.length - 1]
          : currentMonthKey;
      targetMonthKeys = enumerateMonths(startKey, endKey);
    }
  }

  const periodUniqueClients = new Set<string>();
  let totalOverdueCount = 0;
  let totalOverdueOriginal = 0;
  let totalOverdueUpdated = 0;
  let totalDueCount = 0;
  let totalDueOriginal = 0;
  let peakMonth: MonthlyDelinquencyPoint | null = null;

  const points: MonthlyDelinquencyPoint[] = targetMonthKeys.map((monthKey) => {
    const b = buckets.get(monthKey) || createEmptyBucket();
    const overdueOriginalTotal = roundCurrency(b.overdueOriginalTotal);
    const overdueUpdatedTotal = roundCurrency(b.overdueUpdatedTotal);
    const monthTotalDueOriginal = roundCurrency(b.totalDueOriginal);
    const rate =
      monthTotalDueOriginal > 0
        ? Math.min(
            100,
            Math.round((overdueOriginalTotal / monthTotalDueOriginal) * 1000) /
              10,
          )
        : 0;

    for (const cid of b.overdueClientIds) {
      periodUniqueClients.add(cid);
    }

    totalOverdueCount += b.overdueCount;
    totalOverdueOriginal += overdueOriginalTotal;
    totalOverdueUpdated += overdueUpdatedTotal;
    totalDueCount += b.totalDueCount;
    totalDueOriginal += monthTotalDueOriginal;

    const point: MonthlyDelinquencyPoint = {
      monthKey,
      monthLabel: formatMonthShortLabel(monthKey),
      monthFullLabel: formatMonthFullLabel(monthKey),
      overdueCount: b.overdueCount,
      overdueClientsCount: b.overdueClientIds.size,
      overdueOriginalTotal,
      overdueUpdatedTotal,
      frozenOverdueCount: b.frozenOverdueCount,
      totalDueCount: b.totalDueCount,
      totalDueOriginal: monthTotalDueOriginal,
      delinquencyRatePct: rate,
    };

    if (
      point.overdueUpdatedTotal > 0 &&
      (!peakMonth ||
        point.overdueUpdatedTotal > peakMonth.overdueUpdatedTotal)
    ) {
      peakMonth = point;
    }

    return point;
  });

  const roundedOriginal = roundCurrency(totalOverdueOriginal);
  const roundedUpdated = roundCurrency(totalOverdueUpdated);
  const roundedTotalDue = roundCurrency(totalDueOriginal);
  const overallRatePct =
    roundedTotalDue > 0
      ? Math.min(100, Math.round((roundedOriginal / roundedTotalDue) * 1000) / 10)
      : 0;

  return {
    points,
    summary: {
      totalOverdueCount,
      uniqueOverdueClients: periodUniqueClients.size,
      totalOverdueOriginal: roundedOriginal,
      totalOverdueUpdated: roundedUpdated,
      totalDueCount,
      totalDueOriginal: roundedTotalDue,
      overallRatePct,
      peakMonth,
    },
    availableYears: Array.from(yearsSet).sort((a, b) => b.localeCompare(a)),
    todayISO,
  };
};
