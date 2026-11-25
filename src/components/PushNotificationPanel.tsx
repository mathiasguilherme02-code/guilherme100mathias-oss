import React, { useState } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  Send,
  Smartphone,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  BrowserPushDiagnostics,
  PushDeviceSummary,
  PushNotificationConfig,
} from "../utils/pushNotifications";

interface PushNotificationPanelProps {
  pushSupported: boolean;
  permissionState: NotificationPermission | "unsupported";
  browserDiagnostics: BrowserPushDiagnostics | null;
  isVerifyingPermission: boolean;
  isSubscribedThisDevice: boolean;
  isBusy: boolean;
  isSavingConfig: boolean;
  isSendingTest: boolean;
  isSendingNewClientTest: boolean;
  isSendingReminders: boolean;
  lastNewClientTestResult: {
    sent: number;
    total: number;
    failed: number;
    at: string;
  } | null;
  pushConfig: PushNotificationConfig;
  devices: PushDeviceSummary[];
  currentEndpoint: string | null;
  onUpdateConfig: (patch: Partial<PushNotificationConfig>) => void;
  onToggleNewClientsPush: (enabled: boolean) => void;
  onSaveConfig: () => void;
  onVerifyPermission: () => void;
  onSubscribeDevice: () => void;
  onUnsubscribeDevice: () => void;
  onSendTestPush: () => void;
  onSendTestNewClientPush: (sample?: {
    clientName?: string;
    valorSolicitado?: string;
  }) => void;
  onSendRemindersNow: () => void;
  onRemoveDevice: (device: PushDeviceSummary) => void;
  onRefreshStatus: () => void;
}

export const PushNotificationPanel: React.FC<PushNotificationPanelProps> = ({
  pushSupported,
  permissionState,
  browserDiagnostics,
  isVerifyingPermission,
  isSubscribedThisDevice,
  isBusy,
  isSavingConfig,
  isSendingTest,
  isSendingNewClientTest,
  isSendingReminders,
  lastNewClientTestResult,
  pushConfig,
  devices,
  currentEndpoint,
  onUpdateConfig,
  onToggleNewClientsPush,
  onSaveConfig,
  onVerifyPermission,
  onSubscribeDevice,
  onUnsubscribeDevice,
  onSendTestPush,
  onSendTestNewClientPush,
  onSendRemindersNow,
  onRemoveDevice,
  onRefreshStatus,
}) => {
  const [testClientName, setTestClientName] = useState("João Silva (Teste)");
  const [testClientValue, setTestClientValue] = useState("1500");

  const isInIframe =
    typeof window !== "undefined" && window.self !== window.top;

  const effectivePermission: NotificationPermission | "unsupported" =
    browserDiagnostics?.permission || permissionState;

  const permissionLabelMap: Record<string, string> = {
    granted: "Permitida (granted)",
    denied: "Bloqueada (denied)",
    default: "Não solicitada (default)",
    unsupported: "Não suportada neste navegador",
  };

  const permissionBadgeClass =
    effectivePermission === "granted"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : effectivePermission === "denied" || effectivePermission === "unsupported"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BellRing size={18} className="text-yellow-600" />
              Notificações Push no Navegador (Service Worker — Segundo Plano)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Receba alertas de novos cadastros e lembretes de pagamento em tempo real diretamente no sistema operacional, mesmo com a aba fechada ou em segundo plano.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pushConfig.enabled}
                onChange={(e) => onUpdateConfig({ enabled: e.target.checked })}
                className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span
                className={`text-xs font-bold ${
                  pushConfig.enabled ? "text-emerald-700" : "text-slate-600"
                }`}
              >
                {pushConfig.enabled ? "Envio Push Ativo" : "Envio Push Pausado"}
              </span>
            </label>

            <button
              type="button"
              onClick={onRefreshStatus}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              title="Atualizar status e dispositivos"
            >
              <RefreshCw size={13} className={isBusy ? "animate-spin" : ""} />
              Atualizar
            </button>

            <button
              type="button"
              disabled={isSavingConfig}
              onClick={onSaveConfig}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Save size={14} />
              {isSavingConfig ? "Salvando..." : "Salvar Preferências Push"}
            </button>
          </div>
        </div>

        {/* Diagnóstico e Verificação de Permissões do Navegador */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-slate-700" />
                  Permissões e Estado deste Navegador
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${permissionBadgeClass}`}
                >
                  {effectivePermission === "granted" ? (
                    <CheckCircle2 size={12} />
                  ) : effectivePermission === "denied" ||
                    effectivePermission === "unsupported" ? (
                    <AlertTriangle size={12} />
                  ) : (
                    <Bell size={12} />
                  )}
                  {permissionLabelMap[effectivePermission] || effectivePermission}
                </span>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  ({devices.length} dispositivo(s) conectado(s))
                </span>
              </div>

              {browserDiagnostics?.checkedAt && (
                <p className="text-[11px] text-slate-500 tabular-nums">
                  Última verificação:{" "}
                  {new Date(browserDiagnostics.checkedAt).toLocaleTimeString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="btn-verify-push-permission"
                type="button"
                disabled={isVerifyingPermission}
                onClick={onVerifyPermission}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-50 rounded-lg transition-colors"
                title="Verificar permissão de notificações, Service Worker e inscrição Push no navegador"
              >
                <ShieldCheck
                  size={14}
                  className={isVerifyingPermission ? "animate-pulse" : ""}
                />
                {isVerifyingPermission
                  ? "Verificando..."
                  : "Verificar Permissão"}
              </button>

              {pushSupported && !isSubscribedThisDevice && (
                <button
                  type="button"
                  disabled={isBusy || effectivePermission === "denied"}
                  onClick={onSubscribeDevice}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                >
                  <BellRing size={14} />
                  {isBusy ? "Ativando..." : "Ativar Push neste Dispositivo"}
                </button>
              )}

              {isSubscribedThisDevice && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={onUnsubscribeDevice}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <BellOff size={14} />
                  Desativar aqui
                </button>
              )}

              <button
                type="button"
                disabled={isSendingTest || devices.length === 0}
                onClick={onSendTestPush}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
                title="Enviar notificação push geral para os dispositivos conectados"
              >
                <Send size={13} />
                {isSendingTest ? "Enviando..." : "Testar Push Geral"}
              </button>

              <button
                type="button"
                disabled={isSendingReminders || devices.length === 0}
                onClick={onSendRemindersNow}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 rounded-lg transition-colors"
                title="Avaliar cobranças pendentes de hoje e enviar push agora"
              >
                <Clock size={13} />
                {isSendingReminders ? "Enviando..." : "Disparar Lembretes Agora"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Permissão Notification API
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {effectivePermission === "granted"
                  ? "Concedida"
                  : effectivePermission === "denied"
                    ? "Bloqueada pelo usuário"
                    : effectivePermission === "default"
                      ? "Aguardando autorização"
                      : "Não suportada"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Service Worker (Segundo Plano)
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {!browserDiagnostics?.serviceWorkerSupported &&
                !pushSupported
                  ? "Indisponível"
                  : browserDiagnostics?.serviceWorkerActive
                    ? "Ativo e pronto"
                    : browserDiagnostics?.serviceWorkerRegistered
                      ? "Registrado (ativando)"
                      : "Não registrado"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Inscrição Push deste Navegador
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {isSubscribedThisDevice
                  ? "Ativa e sincronizada"
                  : "Não inscrito"}
              </div>
            </div>
          </div>

          {effectivePermission === "denied" && (
            <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              As notificações estão bloqueadas nas configurações deste navegador. Clique no cadeado na barra de endereço, altere <strong>Notificações</strong> para &ldquo;Permitir&rdquo; e clique em <strong>Verificar Permissão</strong>.
            </p>
          )}
          {isInIframe && !isSubscribedThisDevice && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Dica: em visualizações incorporadas (iframe), alguns navegadores bloqueiam o pedido de permissão. Caso o botão não solicite permissão, abra o painel em uma nova aba ou instale o aplicativo.
            </p>
          )}
        </div>

        {/* Gerenciamento e Teste — Push de Novos Cadastros + Lembretes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Eventos que Disparam Push em Tempo Real
            </h4>

            {/* Seção dedicada para Novos Cadastros */}
            <div className="p-3.5 rounded-xl border border-yellow-300 bg-yellow-50/50 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-[200px]">
                  <input
                    id="toggle-push-new-clients"
                    type="checkbox"
                    checked={pushConfig.notifyNewClients}
                    onChange={(e) => onToggleNewClientsPush(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserPlus size={14} className="text-yellow-700" />
                      Notificações Push para Novos Cadastros
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Dispara imediatamente assim que um cliente envia a ficha cadastral (nome, CPF e valor solicitado), mesmo com o navegador em segundo plano.
                    </p>
                  </div>
                </label>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    pushConfig.enabled && pushConfig.notifyNewClients
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {pushConfig.enabled && pushConfig.notifyNewClients
                    ? "Ativo"
                    : "Pausado"}
                </span>
              </div>

              <div className="pt-2 border-t border-yellow-200/80 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Nome no teste de cadastro
                    </label>
                    <input
                      type="text"
                      value={testClientName}
                      onChange={(e) => setTestClientName(e.target.value)}
                      placeholder="Ex: João Silva (Teste)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Valor simulado (R$)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={testClientValue}
                      onChange={(e) => setTestClientValue(e.target.value)}
                      placeholder="1500"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    id="btn-test-new-client-push"
                    type="button"
                    disabled={isSendingNewClientTest || devices.length === 0}
                    onClick={() =>
                      onSendTestNewClientPush({
                        clientName: testClientName,
                        valorSolicitado: testClientValue,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                    title={
                      devices.length === 0
                        ? "Ative o Push neste dispositivo antes de testar o envio em segundo plano"
                        : "Enviar uma notificação push simulando um novo cadastro de cliente"
                    }
                  >
                    <UserPlus size={13} />
                    {isSendingNewClientTest
                      ? "Enviando teste..."
                      : "Testar Notificação de Novo Cadastro"}
                  </button>

                  {devices.length === 0 && (
                    <span className="text-[11px] text-amber-800 font-medium">
                      Ative o Push neste dispositivo para enviar o teste.
                    </span>
                  )}
                </div>

                {lastNewClientTestResult && (
                  <p className="text-[11px] text-slate-600 tabular-nums">
                    Último teste de cadastro às{" "}
                    <strong>
                      {new Date(lastNewClientTestResult.at).toLocaleTimeString(
                        "pt-BR",
                      )}
                    </strong>
                    : {lastNewClientTestResult.sent} de{" "}
                    {lastNewClientTestResult.total} dispositivo(s) notificado(s)
                    {lastNewClientTestResult.failed > 0
                      ? ` (${lastNewClientTestResult.failed} falha(s))`
                      : ""}
                    .
                  </p>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.notifyPaymentReminders}
                    onChange={(e) =>
                      onUpdateConfig({
                        notifyPaymentReminders: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Lembretes de Pagamento e Vencimentos
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Horário:</span>
                  <input
                    type="time"
                    value={pushConfig.horarioLembretePush}
                    onChange={(e) =>
                      onUpdateConfig({ horarioLembretePush: e.target.value })
                    }
                    className="px-2 py-0.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pl-6 text-xs text-slate-700">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.incluirVenceHoje}
                    onChange={(e) =>
                      onUpdateConfig({ incluirVenceHoje: e.target.checked })
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Vence Hoje</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.incluirPreVencimento}
                    onChange={(e) =>
                      onUpdateConfig({
                        incluirPreVencimento: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Pré-Vencimento</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.incluirVencido}
                    onChange={(e) =>
                      onUpdateConfig({ incluirVencido: e.target.checked })
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Em Atraso</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.incluirCongelado7Dias}
                    onChange={(e) =>
                      onUpdateConfig({
                        incluirCongelado7Dias: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>Juros Congelados (7d)</span>
                </label>
              </div>

              {pushConfig.lastReminderPushAt && (
                <p className="text-[11px] text-slate-500 pl-6 tabular-nums">
                  Último disparo de lembretes:{" "}
                  {new Date(pushConfig.lastReminderPushAt).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Dispositivos Inscritos */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone size={14} className="text-slate-600" />
                Dispositivos Registrados ({devices.length})
              </h4>
            </div>

            {devices.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Nenhum navegador registrado ainda. Clique em &ldquo;Ativar Push neste Dispositivo&rdquo; acima para começar a receber notificações em segundo plano.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {devices.map((dev) => {
                  const isCurrent =
                    Boolean(currentEndpoint) &&
                    dev.endpoint === currentEndpoint;
                  return (
                    <div
                      key={dev.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                        isCurrent
                          ? "bg-emerald-50/70 border-emerald-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 truncate">
                            {dev.deviceLabel}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Este dispositivo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate tabular-nums">
                          Ativado em{" "}
                          {new Date(dev.createdAt).toLocaleDateString("pt-BR")}
                          {dev.lastSuccessAt
                            ? ` • Último envio: ${new Date(dev.lastSuccessAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                            : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveDevice(dev)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        title="Remover dispositivo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
