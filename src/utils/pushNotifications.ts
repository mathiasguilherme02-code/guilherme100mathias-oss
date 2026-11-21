export interface PushNotificationConfig {
  enabled: boolean;
  notifyNewClients: boolean;
  notifyPaymentReminders: boolean;
  horarioLembretePush: string;
  incluirPreVencimento: boolean;
  incluirVenceHoje: boolean;
  incluirVencido: boolean;
  incluirCongelado7Dias: boolean;
  lastReminderPushDate: string;
  lastReminderPushAt: string;
}

export const DEFAULT_PUSH_CONFIG: PushNotificationConfig = {
  enabled: true,
  notifyNewClients: true,
  notifyPaymentReminders: true,
  horarioLembretePush: "09:00",
  incluirPreVencimento: true,
  incluirVenceHoje: true,
  incluirVencido: true,
  incluirCongelado7Dias: true,
  lastReminderPushDate: "",
  lastReminderPushAt: "",
};

export function normalizePushConfig(raw: any): PushNotificationConfig {
  const src = raw && typeof raw === "object" ? raw : {};
  const horario =
    typeof src.horarioLembretePush === "string" &&
    /^\d{2}:\d{2}$/.test(src.horarioLembretePush)
      ? src.horarioLembretePush
      : DEFAULT_PUSH_CONFIG.horarioLembretePush;
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
  };
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
