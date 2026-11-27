import { formatISOToBR } from "./installmentMath";
import { getBrazilTodayISO, parseLocalDateShared } from "./whatsappReminders";

export interface ClientDataUpdateStatus {
  clientId: string;
  clientName: string;
  clientCpf: string;
  phone: string;
  referenceDateISO: string;
  referenceDateBR: string;
  nextDueISO: string;
  nextDueBR: string;
  intervalMonths: number;
  isDue: boolean;
  isDueSoon: boolean;
  daysOverdue: number;
  daysUntilDue: number;
  monthsElapsed: number;
  hasExplicitUpdateDate: boolean;
  cycleKey: string;
}

const toISODateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addCalendarMonthsISO = (
  baseDateInput: any,
  monthsToAdd: number,
): string => {
  const baseDate = parseLocalDateShared(baseDateInput);
  const startYear = baseDate.getFullYear();
  const startMonth = baseDate.getMonth();
  const startDay = baseDate.getDate();

  const totalMonths = startMonth + Math.max(1, Math.round(monthsToAdd || 3));
  const targetYear = startYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(startDay, daysInTargetMonth);

  return toISODateString(new Date(targetYear, targetMonth, clampedDay));
};

export const computeElapsedFullMonths = (
  fromISO: string,
  toISO: string,
): number => {
  const from = parseLocalDateShared(fromISO);
  const to = parseLocalDateShared(toISO);
  if (to.getTime() <= from.getTime()) return 0;

  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    // Handle end-of-month clamping (e.g., Aug 31 -> Nov 30 is 3 full months)
    const daysInToMonth = new Date(
      to.getFullYear(),
      to.getMonth() + 1,
      0,
    ).getDate();
    if (!(to.getDate() === daysInToMonth && from.getDate() >= daysInToMonth)) {
      months -= 1;
    }
  }
  return Math.max(0, months);
};

export const evaluateClientDataUpdateStatus = (
  client: any,
  intervalMonths = 3,
  todayISO: string = getBrazilTodayISO(),
): ClientDataUpdateStatus | null => {
  if (!client || !client.id || client.id === "admin-transactions") return null;

  const explicitUpdateRaw = String(client.dataAtualizacaoDados || "").trim();
  const cadastroRaw = String(client.dataCadastro || "").trim();
  const rawRef = explicitUpdateRaw || cadastroRaw;
  if (!rawRef) return null;

  const parsedRef = parseLocalDateShared(rawRef);
  if (isNaN(parsedRef.getTime())) return null;

  const clampedMonths = Math.min(
    24,
    Math.max(1, parseInt(String(intervalMonths || 3), 10) || 3),
  );
  const referenceDateISO = toISODateString(parsedRef);
  const nextDueISO = addCalendarMonthsISO(referenceDateISO, clampedMonths);

  const todayDate = parseLocalDateShared(todayISO);
  const nextDueDate = parseLocalDateShared(nextDueISO);
  const diffDays = Math.round(
    (todayDate.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isDue = diffDays >= 0;
  const daysOverdue = isDue ? diffDays : 0;
  const daysUntilDue = isDue ? 0 : Math.abs(diffDays);
  const isDueSoon = !isDue && daysUntilDue <= 7;
  const monthsElapsed = computeElapsedFullMonths(referenceDateISO, todayISO);

  return {
    clientId: String(client.id),
    clientName: String(client.nomeCompleto || "Cliente").trim() || "Cliente",
    clientCpf: String(client.cpf || ""),
    phone: String(client.telefone || ""),
    referenceDateISO,
    referenceDateBR: formatISOToBR(referenceDateISO),
    nextDueISO,
    nextDueBR: formatISOToBR(nextDueISO),
    intervalMonths: clampedMonths,
    isDue,
    isDueSoon,
    daysOverdue,
    daysUntilDue,
    monthsElapsed,
    hasExplicitUpdateDate: Boolean(explicitUpdateRaw),
    cycleKey: `${referenceDateISO}_${nextDueISO}`,
  };
};

export const evaluateClientsDueForDataUpdate = (
  clients: any[],
  intervalMonths = 3,
  todayISO: string = getBrazilTodayISO(),
): ClientDataUpdateStatus[] => {
  const results: ClientDataUpdateStatus[] = [];
  for (const c of clients || []) {
    const status = evaluateClientDataUpdateStatus(c, intervalMonths, todayISO);
    if (status && status.isDue) {
      results.push(status);
    }
  }
  return results.sort((a, b) => {
    if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
    return a.clientName.localeCompare(b.clientName);
  });
};

export const buildClientDataUpdateWhatsAppMessage = (
  clientName: string,
  status: Pick<
    ClientDataUpdateStatus,
    "referenceDateBR" | "intervalMonths" | "hasExplicitUpdateDate"
  >,
): string => {
  const firstName =
    String(clientName || "")
      .trim()
      .split(/\s+/)[0] || "Cliente";
  const acaoRef = status.hasExplicitUpdateDate
    ? `última atualização cadastral em ${status.referenceDateBR}`
    : `seu cadastro realizado em ${status.referenceDateBR}`;
  return (
    `Olá, ${firstName}! A GM-Empréstimo informa que completou ${status.intervalMonths} meses desde ${acaoRef}.\n\n` +
    `Para manter seu cadastro ativo e atualizado para novas solicitações, acesse a Área do Cliente com seu CPF e clique em *"Atualizar Cadastro"*, ou envie seus dados atualizados por aqui.\n\n` +
    `*GM-Empréstimo*`
  );
};
