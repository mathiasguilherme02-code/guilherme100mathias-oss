export interface PushNotificationConfig {
  enabled: boolean;
  notifyNewClients: boolean;
  notifyPaymentReminders: boolean;
  notifyClientDataUpdateReminders: boolean;
  clientDataUpdateMonths: number;
  horarioLembretePush: string;
  incluirPreVencimento: boolean;
  incluirVenceHoje: boolean;
  incluirVencido: boolean;
  incluirCongelado7Dias: boolean;
  lastReminderPushDate: string;
  lastReminderPushAt: string;
  lastDataUpdatePushDate: string;
}

export const DEFAULT_PUSH_CONFIG: PushNotificationConfig = {
  enabled: true,
  notifyNewClients: true,
  notifyPaymentReminders: true,
  notifyClientDataUpdateReminders: true,
  clientDataUpdateMonths: 3,
  horarioLembretePush: "09:00",
  incluirPreVencimento: true,
  incluirVenceHoje: true,
  incluirVencido: true,
  incluirCongelado7Dias: true,
  lastReminderPushDate: "",
  lastReminderPushAt: "",
  lastDataUpdatePushDate: "",
};

export function normalizePushConfig(raw: any): PushNotificationConfig {
  const src = raw && typeof raw === "object" ? raw : {};
  const horario =
    typeof src.horarioLembretePush === "string" &&
    /^\d{2}:\d{2}$/.test(src.horarioLembretePush)
      ? src.horarioLembretePush
      : DEFAULT_PUSH_CONFIG.horarioLembretePush;
  const parsedMonths = parseInt(String(src.clientDataUpdateMonths ?? ""), 10);
  const clientDataUpdateMonths =
    Number.isFinite(parsedMonths) && parsedMonths >= 1 && parsedMonths <= 24
      ? parsedMonths
      : DEFAULT_PUSH_CONFIG.clientDataUpdateMonths;
  return {
    enabled:
      src.enabled !== undefined
        ? Boolean(src.enabled)
        : DEFAULT_PUSH_CONFIG.enabled,
    notifyNewClients:
      src.notifyNewClients !== undefined
        ? Boolean(src.notifyNewClients)
        : DEFAULT_PUSH_CONFIG.notifyNewClients,
    notifyPaymentReminders:
      src.notifyPaymentReminders !== undefined
        ? Boolean(src.notifyPaymentReminders)
        : DEFAULT_PUSH_CONFIG.notifyPaymentReminders,
    notifyClientDataUpdateReminders:
      src.notifyClientDataUpdateReminders !== undefined
        ? Boolean(src.notifyClientDataUpdateReminders)
        : DEFAULT_PUSH_CONFIG.notifyClientDataUpdateReminders,
    clientDataUpdateMonths,
    horarioLembretePush: horario,
    incluirPreVencimento:
      src.incluirPreVencimento !== undefined
        ? Boolean(src.incluirPreVencimento)
        : DEFAULT_PUSH_CONFIG.incluirPreVencimento,
    incluirVenceHoje:
      src.incluirVenceHoje !== undefined
        ? Boolean(src.incluirVenceHoje)
        : DEFAULT_PUSH_CONFIG.incluirVenceHoje,
    incluirVencido:
      src.incluirVencido !== undefined
        ? Boolean(src.incluirVencido)
        : DEFAULT_PUSH_CONFIG.incluirVencido,
    incluirCongelado7Dias:
      src.incluirCongelado7Dias !== undefined
        ? Boolean(src.incluirCongelado7Dias)
        : DEFAULT_PUSH_CONFIG.incluirCongelado7Dias,
    lastReminderPushDate:
      typeof src.lastReminderPushDate === "string"
        ? src.lastReminderPushDate
        : "",
    lastReminderPushAt:
      typeof src.lastReminderPushAt === "string"
        ? src.lastReminderPushAt
        : "",
    lastDataUpdatePushDate:
      typeof src.lastDataUpdatePushDate === "string"
        ? src.lastDataUpdatePushDate
        : "",
  };
}

export interface NewClientAlertConfig {
  soundEnabled: boolean;
  nativeNotificationEnabled: boolean;
}

export const DEFAULT_NEW_CLIENT_ALERT_CONFIG: NewClientAlertConfig = {
  soundEnabled: true,
  nativeNotificationEnabled: true,
};

export function normalizeNewClientAlertConfig(raw: any): NewClientAlertConfig {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    soundEnabled:
      src.soundEnabled !== undefined
        ? Boolean(src.soundEnabled)
        : DEFAULT_NEW_CLIENT_ALERT_CONFIG.soundEnabled,
    nativeNotificationEnabled:
      src.nativeNotificationEnabled !== undefined
        ? Boolean(src.nativeNotificationEnabled)
        : DEFAULT_NEW_CLIENT_ALERT_CONFIG.nativeNotificationEnabled,
  };
}

export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export const DEFAULT_QUIET_HOURS_CONFIG: QuietHoursConfig = {
  enabled: false,
  startTime: "22:00",
  endTime: "08:00",
};

export function normalizeQuietHoursConfig(raw: any): QuietHoursConfig {
  const src = raw && typeof raw === "object" ? raw : {};
  const validTime = (val: any, fallback: string): string => {
    if (typeof val !== "string") return fallback;
    const trimmed = val.trim();
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed) ? trimmed : fallback;
  };
  return {
    enabled:
      src.enabled !== undefined
        ? Boolean(src.enabled)
        : DEFAULT_QUIET_HOURS_CONFIG.enabled,
    startTime: validTime(src.startTime, DEFAULT_QUIET_HOURS_CONFIG.startTime),
    endTime: validTime(src.endTime, DEFAULT_QUIET_HOURS_CONFIG.endTime),
  };
}

export function isTimeInQuietWindow(
  config: QuietHoursConfig | null | undefined,
  currentHHMM: string,
): boolean {
  const cfg = normalizeQuietHoursConfig(config);
  if (!cfg.enabled) return false;

  const toMinutes = (hhmm: string): number | null => {
    const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm || "").trim());
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (hh === 24) hh = 0;
    if (
      !Number.isFinite(hh) ||
      !Number.isFinite(mm) ||
      hh < 0 ||
      hh > 23 ||
      mm < 0 ||
      mm > 59
    ) {
      return null;
    }
    return hh * 60 + mm;
  };

  const start = toMinutes(cfg.startTime);
  const end = toMinutes(cfg.endTime);
  const current = toMinutes(currentHHMM);
  if (start === null || end === null || current === null) return false;
  if (start === end) return false;

  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

export interface PushDeviceSummary {
  id: string;
  endpoint: string;
  deviceLabel: string;
  createdAt: string;
  lastSuccessAt?: string;
}

export function isPushSupportedInBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getBrowserDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Navegador";
  const ua = navigator.userAgent;
  let browser = "Navegador";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";

  let os = "Desktop";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "Mac";
  else if (/Linux/i.test(ua)) os = "Linux";

  return `${browser} (${os})`;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function ensurePushServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker não suportado neste navegador.");
  }

  let registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) {
    const swUrl = import.meta.env.DEV ? "/dev-sw.js?dev-sw" : "/sw.js";
    try {
      registration = await navigator.serviceWorker.register(swUrl, {
        scope: "/",
      });
    } catch {
      registration = await navigator.serviceWorker.register("/push-sw.js", {
        scope: "/",
      });
    }
  }

  const readyReg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(
        () => reject(new Error("Tempo esgotado aguardando o Service Worker.")),
        8000,
      ),
    ),
  ]);
  return readyReg;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupportedInBrowser()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    if (!reg || !reg.pushManager) return null;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeBrowserPush(
  vapidPublicKey: string,
): Promise<PushSubscription> {
  if (!isPushSupportedInBrowser()) {
    throw new Error("Este navegador não suporta Notificações Push.");
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Permissão bloqueada pelo navegador. Libere as notificações nas configurações do site."
        : "Permissão de notificação não concedida.",
    );
  }

  const registration = await ensurePushServiceWorkerRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as BufferSource,
  });
}

export async function unsubscribeBrowserPush(): Promise<string | null> {
  const existing = await getCurrentPushSubscription();
  if (!existing) return null;
  const endpoint = existing.endpoint;
  await existing.unsubscribe();
  return endpoint;
}

export interface BrowserPushDiagnostics {
  notificationSupported: boolean;
  serviceWorkerSupported: boolean;
  pushManagerSupported: boolean;
  pushSupported: boolean;
  permission: NotificationPermission | "unsupported";
  serviceWorkerRegistered: boolean;
  serviceWorkerActive: boolean;
  hasSubscription: boolean;
  endpoint: string | null;
  checkedAt: string;
}

export async function checkBrowserPushDiagnostics(): Promise<BrowserPushDiagnostics> {
  const checkedAt = new Date().toISOString();
  if (typeof window === "undefined") {
    return {
      notificationSupported: false,
      serviceWorkerSupported: false,
      pushManagerSupported: false,
      pushSupported: false,
      permission: "unsupported",
      serviceWorkerRegistered: false,
      serviceWorkerActive: false,
      hasSubscription: false,
      endpoint: null,
      checkedAt,
    };
  }

  const notificationSupported = "Notification" in window;
  const serviceWorkerSupported = "serviceWorker" in navigator;
  const pushManagerSupported = "PushManager" in window;
  const pushSupported =
    notificationSupported && serviceWorkerSupported && pushManagerSupported;
  const permission: NotificationPermission | "unsupported" =
    notificationSupported ? Notification.permission : "unsupported";

  let serviceWorkerRegistered = false;
  let serviceWorkerActive = false;
  let hasSubscription = false;
  let endpoint: string | null = null;

  if (serviceWorkerSupported) {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg) {
        serviceWorkerRegistered = true;
        serviceWorkerActive = Boolean(reg.active);
        if (reg.pushManager) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            hasSubscription = true;
            endpoint = sub.endpoint;
          }
        }
      }
    } catch {}
  }

  return {
    notificationSupported,
    serviceWorkerSupported,
    pushManagerSupported,
    pushSupported,
    permission,
    serviceWorkerRegistered,
    serviceWorkerActive,
    hasSubscription,
    endpoint,
    checkedAt,
  };
}

