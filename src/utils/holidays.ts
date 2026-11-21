export interface FeriadoNacionalItem {
  id: string;
  nome: string;
  tipo: "fixo" | "movel";
  mmdd?: string;
  offsetEaster?: number;
  ativo: boolean;
}

export interface FeriadoPersonalizadoItem {
  id: string;
  nome: string;
  data: string; // YYYY-MM-DD
  recorrenteAnual: boolean;
  ativo: boolean;
}

export interface FeriadosConfig {
  nacionais: FeriadoNacionalItem[];
  personalizados: FeriadoPersonalizadoItem[];
}

export const DEFAULT_FERIADOS_NACIONAIS: FeriadoNacionalItem[] = [
  { id: "01-01", nome: "Confraternização Universal", tipo: "fixo", mmdd: "01-01", ativo: true },
  { id: "carnaval_segunda", nome: "Carnaval (Segunda-feira)", tipo: "movel", offsetEaster: -48, ativo: true },
  { id: "carnaval_terca", nome: "Carnaval (Terça-feira)", tipo: "movel", offsetEaster: -47, ativo: true },
  { id: "sexta_santa", nome: "Sexta-feira Santa (Paixão de Cristo)", tipo: "movel", offsetEaster: -2, ativo: true },
  { id: "04-21", nome: "Tiradentes", tipo: "fixo", mmdd: "04-21", ativo: true },
  { id: "05-01", nome: "Dia do Trabalhador", tipo: "fixo", mmdd: "05-01", ativo: true },
  { id: "corpus_christi", nome: "Corpus Christi", tipo: "movel", offsetEaster: 60, ativo: true },
  { id: "09-07", nome: "Independência do Brasil", tipo: "fixo", mmdd: "09-07", ativo: true },
  { id: "10-12", nome: "Nossa Senhora Aparecida", tipo: "fixo", mmdd: "10-12", ativo: true },
  { id: "11-02", nome: "Finados", tipo: "fixo", mmdd: "11-02", ativo: true },
  { id: "11-15", nome: "Proclamação da República", tipo: "fixo", mmdd: "11-15", ativo: true },
  { id: "11-20", nome: "Dia da Consciência Negra", tipo: "fixo", mmdd: "11-20", ativo: true },
  { id: "12-25", nome: "Natal", tipo: "fixo", mmdd: "12-25", ativo: true },
];

export const DEFAULT_FERIADOS_CONFIG: FeriadosConfig = {
  nacionais: DEFAULT_FERIADOS_NACIONAIS.map((f) => ({ ...f })),
  personalizados: [],
};

export const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const toISODateLocal = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const resolveNacionalHolidayISOForYear = (
  item: FeriadoNacionalItem,
  year: number,
): string => {
  if (item.tipo === "fixo" && item.mmdd) {
    return `${year}-${item.mmdd}`;
  }
  if (item.tipo === "movel" && typeof item.offsetEaster === "number") {
    const easter = getEasterSunday(year);
    const target = new Date(easter.getTime());
    target.setDate(target.getDate() + item.offsetEaster);
    return toISODateLocal(target);
  }
  return "";
};

export const normalizeFeriadosConfig = (
  raw?: Partial<FeriadosConfig> | null,
): FeriadosConfig => {
  const savedNacionais = Array.isArray(raw?.nacionais) ? raw.nacionais : [];
  const savedById = new Map(savedNacionais.map((n) => [n.id, n]));

  const nacionais: FeriadoNacionalItem[] = DEFAULT_FERIADOS_NACIONAIS.map(
    (def) => {
      const saved = savedById.get(def.id);
      return saved
        ? {
            ...def,
            nome: saved.nome ? String(saved.nome) : def.nome,
            ativo: saved.ativo !== undefined ? Boolean(saved.ativo) : def.ativo,
          }
        : { ...def };
    },
  );

  // Preserve any extra national holidays manually added if ever present
  const defaultIds = new Set(DEFAULT_FERIADOS_NACIONAIS.map((d) => d.id));
  for (const extra of savedNacionais) {
    if (extra && extra.id && !defaultIds.has(extra.id)) {
      nacionais.push({
        id: String(extra.id),
        nome: String(extra.nome || "Feriado Nacional"),
        tipo: extra.tipo === "movel" ? "movel" : "fixo",
        mmdd: extra.mmdd ? String(extra.mmdd) : undefined,
        offsetEaster:
          typeof extra.offsetEaster === "number"
            ? extra.offsetEaster
            : undefined,
        ativo: extra.ativo !== undefined ? Boolean(extra.ativo) : true,
      });
    }
  }

  const personalizados: FeriadoPersonalizadoItem[] = Array.isArray(
    raw?.personalizados,
  )
    ? raw.personalizados
        .filter((p) => p && p.data)
        .map((p, idx) => ({
          id: String(p.id || `custom-feriado-${idx}-${p.data}`),
          nome: String(p.nome || "Feriado Personalizado").trim(),
          data: String(p.data).split("T")[0],
          recorrenteAnual: Boolean(p.recorrenteAnual),
          ativo: p.ativo !== undefined ? Boolean(p.ativo) : true,
        }))
    : [];

  return { nacionais, personalizados };
};

export const getHolidayMatchesForDate = (
  date: Date,
  config?: FeriadosConfig | null,
): string[] => {
  const cfg = normalizeFeriadosConfig(config);
  const year = date.getFullYear();
  const mStr = String(date.getMonth() + 1).padStart(2, "0");
  const dStr = String(date.getDate()).padStart(2, "0");
  const mmdd = `${mStr}-${dStr}`;
  const iso = `${year}-${mmdd}`;

  const matchedNames: string[] = [];

  for (const nat of cfg.nacionais) {
    if (!nat.ativo) continue;
    const natIso = resolveNacionalHolidayISOForYear(nat, year);
    if (natIso === iso) {
      matchedNames.push(nat.nome);
    }
  }

  for (const cust of cfg.personalizados) {
    if (!cust.ativo || !cust.data) continue;
    const custDate = cust.data.split("T")[0];
    if (cust.recorrenteAnual) {
      const custMmdd =
        custDate.length === 10
          ? custDate.slice(5, 10)
          : custDate.length === 5
            ? custDate
            : "";
      if (custMmdd === mmdd) {
        matchedNames.push(cust.nome || "Feriado Personalizado");
      }
    } else if (custDate === iso) {
      matchedNames.push(cust.nome || "Feriado Personalizado");
    }
  }

  return matchedNames;
};

let activeFeriadosConfig: FeriadosConfig = normalizeFeriadosConfig(null);

export const setActiveFeriadosConfig = (config?: FeriadosConfig | null) => {
  activeFeriadosConfig = normalizeFeriadosConfig(config);
};

export const getActiveFeriadosConfig = (): FeriadosConfig => activeFeriadosConfig;

export const calculateQuintoDiaUtilDetails = (
  year: number,
  month: number,
  config?: FeriadosConfig | null,
) => {
  const effectiveConfig = config ?? activeFeriadosConfig;
  const base = new Date(year, month, 1, 12, 0, 0, 0);
  const targetYear = base.getFullYear();
  const targetMonth = base.getMonth();

  let businessDaysCount = 0;
  let currentDay = 1;
  const skippedHolidays: Array<{ dateISO: string; nome: string }> = [];

  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  let resultDate = new Date(targetYear, targetMonth, 7, 12, 0, 0, 0);

  while (businessDaysCount < 5 && currentDay <= 31) {
    const candidate = new Date(targetYear, targetMonth, currentDay, 12, 0, 0, 0);
    if (candidate.getMonth() !== targetMonth) break;

    const dayOfWeek = candidate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayNames = getHolidayMatchesForDate(candidate, effectiveConfig);
    const isHoliday = holidayNames.length > 0;

    if (!isWeekend && isHoliday) {
      skippedHolidays.push({
        dateISO: toISODateLocal(candidate),
        nome: holidayNames.join(", "),
      });
    }

    if (!isWeekend && !isHoliday) {
      businessDaysCount++;
      if (businessDaysCount === 5) {
        resultDate = candidate;
        break;
      }
    }
    currentDay++;
  }

  const iso = toISODateLocal(resultDate);
  const diaStr = String(resultDate.getDate()).padStart(2, "0");
  const mesStr = String(resultDate.getMonth() + 1).padStart(2, "0");
  const anoStr = resultDate.getFullYear();
  const diaSemana = diasSemana[resultDate.getDay()];

  return {
    date: resultDate,
    iso,
    diaSemana,
    label: `${diaStr}/${mesStr}/${anoStr} (${diaSemana})`,
    skippedHolidays,
  };
};
