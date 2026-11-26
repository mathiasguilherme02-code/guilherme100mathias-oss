import React, { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  LayoutList,
  MessageSquare,
  PanelLeft,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  CustomWhatsAppTemplate,
  DEFAULT_WHATSAPP_TEMPLATES,
  WaSituacaoType,
  WaTemplateKey,
} from "../utils/whatsappReminders";

export interface WaTemplateOptionItem {
  key: WaTemplateKey;
  label: string;
  hint: string;
}

export interface WaDynamicTagItem {
  tag: string;
  desc: string;
  primary?: boolean;
}

interface WhatsAppTemplatesControlPanelProps {
  templateOptions: WaTemplateOptionItem[];
  dynamicTags: WaDynamicTagItem[];
  activeKey: string;
  onSelectKey: (key: string) => void;
  templateRef: React.RefObject<HTMLTextAreaElement | null>;
  values: Record<WaTemplateKey, string>;
  telefones: Record<string, string>;
  customTemplates: CustomWhatsAppTemplate[];
  whatsappAppMode: "business" | "padrao";
  diasLembreteAntecipado: string;
  onChangeWhatsappAppMode: (mode: "business" | "padrao") => void;
  onChangeDiasAntecipado: (dias: string) => void;
  onBlurDiasAntecipado?: () => void;
  onChangeBuiltInText: (key: WaTemplateKey, text: string) => void;
  onChangeBuiltInPhone: (key: WaTemplateKey, phone: string) => void;
  onRestoreBuiltInDefault: (key: WaTemplateKey) => void;
  onRestoreAllDefaults: () => void;
  onAddCustomTemplate: () => void;
  onUpdateCustomTemplate: (
    id: string,
    patch: Partial<CustomWhatsAppTemplate>,
  ) => void;
  onDeleteCustomTemplate: (id: string) => void;
  onSaveAll: () => void;
  isSaving: boolean;
  previewClientId: string;
  onChangePreviewClientId: (clientId: string) => void;
  clients: any[];
  previewClienteName: string;
  previewText: string;
  renderTemplatePreview: (key: WaTemplateKey, text: string) => string;
  autoOpenWaOnPhone: boolean;
  onChangeAutoOpenWaOnPhone: (checked: boolean) => void;
  onTriggerPhoneEntryOpen: (
    prevVal: string,
    nextVal: string,
    effectiveKey: string,
    textToSend: string,
  ) => void;
  onTriggerPhonePasteOpen: (
    pasted: string,
    effectiveKey: string,
    textToSend: string,
  ) => void;
  onLaunchWhatsApp: (phone: string, text: string) => void;
  formatWhatsAppHref: (phone: string, text: string) => string;
  hasUnsavedChanges?: boolean;
  overridingCustomByKey?: Partial<Record<WaTemplateKey, CustomWhatsAppTemplate>>;
  onUnlinkCustomOverride?: (customId: string) => void;
}

const EDITABLE_VENCIDO_STARTER =
  "Olá {cliente}, a GM-Empréstimo informa que {referencia} no valor atualizado de {valor} está vencida há {dias} dia(s) (vencimento em {data}). Por favor, entre em contato para regularizar.";

export const WhatsAppTemplatesControlPanel: React.FC<
  WhatsAppTemplatesControlPanelProps
> = ({
  templateOptions,
  dynamicTags,
  activeKey,
  onSelectKey,
  templateRef,
  values,
  telefones,
  customTemplates,
  whatsappAppMode,
  diasLembreteAntecipado,
  onChangeWhatsappAppMode,
  onChangeDiasAntecipado,
  onBlurDiasAntecipado,
  onChangeBuiltInText,
  onChangeBuiltInPhone,
  onRestoreBuiltInDefault,
  onRestoreAllDefaults,
  onAddCustomTemplate,
  onUpdateCustomTemplate,
  onDeleteCustomTemplate,
  onSaveAll,
  isSaving,
  previewClientId,
  onChangePreviewClientId,
  clients,
  previewClienteName,
  previewText,
  renderTemplatePreview,
  autoOpenWaOnPhone,
  onChangeAutoOpenWaOnPhone,
  onTriggerPhoneEntryOpen,
  onTriggerPhonePasteOpen,
  onLaunchWhatsApp,
  formatWhatsAppHref,
  hasUnsavedChanges = false,
  overridingCustomByKey = {},
  onUnlinkCustomOverride,
}) => {
  const [viewMode, setViewMode] = useState<"focused" | "all">("focused");

  const builtInOption = templateOptions.find((o) => o.key === activeKey);
  const activeCustomTemplate = !builtInOption
    ? customTemplates.find((c) => c.id === activeKey)
    : undefined;
  const resolvedBuiltIn =
    builtInOption || (!activeCustomTemplate ? templateOptions[0] : undefined);
  const effectiveKey = activeCustomTemplate
    ? activeCustomTemplate.id
    : resolvedBuiltIn!.key;

  const currentTemplateValue = activeCustomTemplate
    ? activeCustomTemplate.text
    : values[resolvedBuiltIn!.key] ?? "";

  const activeLabel = activeCustomTemplate
    ? activeCustomTemplate.label || "Modelo Personalizado"
    : resolvedBuiltIn!.label;

  const activeHint = activeCustomTemplate
    ? activeCustomTemplate.situacao === "personalizado"
      ? "Modelo adicional disponível no menu rápido de envio via WhatsApp."
      : "Substitui o texto automático sempre que ocorrer a situação vinculada."
    : resolvedBuiltIn!.hint;

  const insertTagAtCursor = (tag: string) => {
    const el = templateRef.current;
    const applyUpdate = (nextVal: string) => {
      if (activeCustomTemplate) {
        onUpdateCustomTemplate(activeCustomTemplate.id, { text: nextVal });
      } else if (resolvedBuiltIn) {
        onChangeBuiltInText(resolvedBuiltIn.key, nextVal);
      }
    };

    if (!el) {
      applyUpdate(currentTemplateValue + tag);
      return;
    }

    const start = el.selectionStart ?? currentTemplateValue.length;
    const end = el.selectionEnd ?? currentTemplateValue.length;
    const nextVal =
      currentTemplateValue.slice(0, start) +
      tag +
      currentTemplateValue.slice(end);
    applyUpdate(nextVal);

    setTimeout(() => {
      el.focus();
      const pos = start + tag.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertTagIntoBuiltIn = (key: WaTemplateKey, tag: string) => {
    const cur = values[key] ?? "";
    const sep = cur.length > 0 && !cur.endsWith(" ") && !cur.endsWith("\n") ? " " : "";
    onChangeBuiltInText(key, `${cur}${sep}${tag}`);
  };

  const insertTagIntoCustom = (custom: CustomWhatsAppTemplate, tag: string) => {
    const cur = custom.text ?? "";
    const sep = cur.length > 0 && !cur.endsWith(" ") && !cur.endsWith("\n") ? " " : "";
    onUpdateCustomTemplate(custom.id, { text: `${cur}${sep}${tag}` });
  };

  const activeOverrideCustom = !activeCustomTemplate && resolvedBuiltIn
    ? overridingCustomByKey[resolvedBuiltIn.key]
    : undefined;

  const currentPhoneVal = activeCustomTemplate
    ? activeCustomTemplate.telefone || ""
    : telefones[resolvedBuiltIn!.key] || "";
  const currentPhoneDigits = currentPhoneVal.replace(/\D/g, "");
  const isManualPhoneValid = currentPhoneDigits.length >= 10;

  const updateCurrentPhone = (rawVal: string) => {
    if (activeCustomTemplate) {
      onUpdateCustomTemplate(activeCustomTemplate.id, { telefone: rawVal });
    } else if (resolvedBuiltIn) {
      onChangeBuiltInPhone(resolvedBuiltIn.key, rawVal);
    }
  };

  const detectedUsedTags = dynamicTags.filter((item) =>
    currentTemplateValue.toLowerCase().includes(item.tag.toLowerCase()),
  );

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-600" />
            Painel de Mensagens Padrão do WhatsApp
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina o texto padrão de cada tipo de lembrete usando tags dinâmicas como{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">
              {"{cliente}"}
            </code>
            ,{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">
              {"{valor}"}
            </code>{" "}
            e{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">
              {"{data}"}
            </code>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("focused")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "focused"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PanelLeft size={13} />
              Editor com Prévia
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutList size={13} />
              Ver Todos
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
              App:
            </label>
            <select
              value={whatsappAppMode}
              onChange={(e) =>
                onChangeWhatsappAppMode(
                  e.target.value === "padrao" ? "padrao" : "business",
                )
              }
              className="px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="business">WhatsApp Business</option>
              <option value="padrao">WhatsApp Padrão / Web</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Pré-notificar:
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={diasLembreteAntecipado ?? "3"}
              onChange={(e) => onChangeDiasAntecipado(e.target.value)}
              onBlur={() => onBlurDiasAntecipado?.()}
              className="w-14 px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-yellow-500 tabular-nums"
            />
            <span className="text-xs text-slate-500">dia(s)</span>
          </div>

          <button
            type="button"
            onClick={onRestoreAllDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Restaurar todos os tipos de lembrete para o texto original do sistema"
          >
            <RotateCcw size={13} />
            Restaurar Todos
          </button>

          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Alterações não salvas
            </span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveAll}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 rounded-lg shadow-xs transition-colors ${
              hasUnsavedChanges
                ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <Save size={14} />
            {isSaving ? "Salvando..." : hasUnsavedChanges ? "Salvar Alterações" : "Salvar Mensagens"}
          </button>
        </div>
      </div>

      {viewMode === "all" ? (
        /* Modo Simples: Todos os tipos visíveis em uma única tela */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-medium text-slate-700">
              Clique em uma tag dentro de qualquer cartão para inserir no texto padrão correspondente e depois clique em{" "}
              <strong>Salvar Mensagens</strong>.
            </span>
            <button
              type="button"
              onClick={() => {
                onAddCustomTemplate();
                setViewMode("focused");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-emerald-400 text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
            >
              <Plus size={14} />
              Novo Modelo Personalizado
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templateOptions.map((opt) => {
              const currentText = values[opt.key] ?? "";
              const isCustomized =
                currentText.trim() !==
                (DEFAULT_WHATSAPP_TEMPLATES[opt.key] || "").trim();
              const overridingCustom = overridingCustomByKey[opt.key];
              const previewSample = renderTemplatePreview(opt.key, currentText);

              return (
                <div
                  key={opt.key}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-800">
                          {opt.label}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            opt.key === "msgLembreteVencido" &&
                            !currentText.trim()
                              ? "bg-slate-100 text-slate-600"
                              : isCustomized
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {opt.key === "msgLembreteVencido" &&
                          !currentText.trim()
                            ? "Automático"
                            : isCustomized
                              ? "Personalizado"
                              : "Padrão"}
                        </span>
                        {overridingCustom && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800">
                            Substituído por: {overridingCustom.label}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {opt.hint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRestoreBuiltInDefault(opt.key)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title="Restaurar padrão deste tipo"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  {overridingCustom && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        O modelo extra <strong>{overridingCustom.label}</strong> está vinculado a esta situação e será enviado no lugar deste campo.
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectKey(overridingCustom.id);
                            setViewMode("focused");
                          }}
                          className="px-2 py-1 rounded bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          Ver modelo extra
                        </button>
                        {onUnlinkCustomOverride && (
                          <button
                            type="button"
                            onClick={() => onUnlinkCustomOverride(overridingCustom.id)}
                            className="px-2 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700"
                          >
                            Usar este padrão
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1">
                    {dynamicTags.map((t) => (
                      <button
                        key={`${opt.key}-${t.tag}`}
                        type="button"
                        onClick={() => insertTagIntoBuiltIn(opt.key, t.tag)}
                        title={t.desc}
                        className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded border transition-colors ${
                          t.primary
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-yellow-50"
                        }`}
                      >
                        + {t.tag}
                      </button>
                    ))}
                    {opt.key === "msgLembreteVencido" && !currentText.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeBuiltInText(opt.key, EDITABLE_VENCIDO_STARTER)
                        }
                        className="px-2 py-0.5 text-[11px] font-semibold bg-yellow-100 text-yellow-900 border border-yellow-300 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Usar modelo editável
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={currentText}
                    placeholder={
                      opt.key === "msgLembreteVencido"
                        ? "Em branco = usa o detalhamento automático completo. Digite aqui para definir um texto padrão fixo..."
                        : "Digite a mensagem padrão usando as tags (em branco = usa o padrão do sistema)..."
                    }
                    onChange={(e) =>
                      onChangeBuiltInText(opt.key, e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-3 py-2 text-[11px] text-slate-700 whitespace-pre-wrap">
                    <span className="font-semibold text-emerald-900 block mb-0.5">
                      Prévia ({previewClienteName.split(" ")[0]}):
                    </span>
                    {previewSample}
                  </div>
                </div>
              );
            })}
          </div>

          {customTemplates.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Modelos Extras Personalizados ({customTemplates.length})
                </h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {customTemplates.map((ct) => {
                  const previewSample = renderTemplatePreview(
                    (ct.situacao === "personalizado"
                      ? ct.id
                      : ct.situacao) as WaTemplateKey,
                    ct.text || "",
                  );
                  return (
                    <div
                      key={ct.id}
                      className="bg-white border border-emerald-200 rounded-xl p-4 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h5 className="text-sm font-bold text-slate-800 truncate">
                            {ct.label || "Modelo Personalizado"}
                          </h5>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                            {ct.situacao === "personalizado" ? "Menu rápido" : `Substitui: ${ct.situacao}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteCustomTemplate(ct.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Excluir modelo personalizado"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        {dynamicTags.map((t) => (
                          <button
                            key={`${ct.id}-${t.tag}`}
                            type="button"
                            onClick={() => insertTagIntoCustom(ct, t.tag)}
                            title={t.desc}
                            className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded border transition-colors ${
                              t.primary
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-yellow-50"
                            }`}
                          >
                            + {t.tag}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={ct.text}
                        onChange={(e) =>
                          onUpdateCustomTemplate(ct.id, { text: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      />

                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-3 py-2 text-[11px] text-slate-700 whitespace-pre-wrap">
                        <span className="font-semibold text-emerald-900 block mb-0.5">
                          Prévia ({previewClienteName.split(" ")[0]}):
                        </span>
                        {previewSample}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Modo Focado: Lista de Tipos à Esquerda + Editor Simples, Tags e Prévia à Direita */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Coluna Esquerda: Lista dos Tipos de Lembrete */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">
              Tipos de Lembrete ({templateOptions.length})
            </div>
            <div className="space-y-1.5">
              {templateOptions.map((opt) => {
                const isActive = effectiveKey === opt.key;
                const val = values[opt.key] ?? "";
                const isAutomatic =
                  opt.key === "msgLembreteVencido" && !val.trim();
                const isModified =
                  val.trim() !==
                  (DEFAULT_WHATSAPP_TEMPLATES[opt.key] || "").trim();

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onSelectKey(opt.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold truncate">
                        {opt.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          isActive
                            ? "bg-white/15 text-yellow-300"
                            : isAutomatic
                              ? "bg-slate-100 text-slate-500"
                              : isModified
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isAutomatic
                          ? "Automático"
                          : isModified
                            ? "Editado"
                            : "Padrão"}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-1 truncate ${
                        isActive ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {val.trim()
                        ? val.replace(/\s+/g, " ")
                        : "Detalhamento automático do sistema (40% e abatimentos)"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Modelos Adicionais Personalizados */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Modelos Extras ({customTemplates.length})
                </span>
                <button
                  type="button"
                  onClick={onAddCustomTemplate}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <Plus size={13} />
                  Novo Campo
                </button>
              </div>
              {customTemplates.length > 0 && (
                <div className="space-y-1.5">
                  {customTemplates.map((ct) => {
                    const isActive = effectiveKey === ct.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => onSelectKey(ct.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${
                          isActive
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        <span className="truncate">
                          {ct.label || "Campo Personalizado"}
                        </span>
                        <span className="text-[10px] opacity-80 shrink-0">
                          {ct.situacao === "personalizado"
                            ? "Manual"
                            : ct.situacao}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Editor Simples + Tags Dinâmicas + Prévia ao Vivo */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {activeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{activeHint}</p>
                  {activeOverrideCustom && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Aviso: o modelo extra <strong>{activeOverrideCustom.label}</strong> está vinculado a esta situação e será enviado no lugar deste padrão.
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectKey(activeOverrideCustom.id)}
                          className="px-2.5 py-1 rounded bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          Abrir modelo extra
                        </button>
                        {onUnlinkCustomOverride && (
                          <button
                            type="button"
                            onClick={() => onUnlinkCustomOverride(activeOverrideCustom.id)}
                            className="px-2.5 py-1 rounded bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700"
                          >
                            Usar este texto padrão
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!activeCustomTemplate &&
                    resolvedBuiltIn?.key === "msgLembreteVencido" &&
                    !currentTemplateValue.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeBuiltInText(
                            resolvedBuiltIn.key,
                            EDITABLE_VENCIDO_STARTER,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg transition-colors"
                      >
                        <Sparkles size={13} />
                        Usar Modelo Editável
                      </button>
                    )}

                  {activeCustomTemplate ? (
                    <button
                      type="button"
                      onClick={() =>
                        onDeleteCustomTemplate(activeCustomTemplate.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                      Excluir Modelo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        resolvedBuiltIn &&
                        onRestoreBuiltInDefault(resolvedBuiltIn.key)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                    >
                      <RotateCcw size={13} />
                      Restaurar Padrão
                    </button>
                  )}
                </div>
              </div>

              {activeCustomTemplate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nome do Modelo
                    </label>
                    <input
                      type="text"
                      value={activeCustomTemplate.label}
                      onChange={(e) =>
                        onUpdateCustomTemplate(activeCustomTemplate.id, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Ex: Cobrança Amigável, Aviso Feriado..."
                      className="w-full px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Situação Vinculada
                    </label>
                    <select
                      value={activeCustomTemplate.situacao}
                      onChange={(e) =>
                        onUpdateCustomTemplate(activeCustomTemplate.id, {
                          situacao: e.target.value as WaSituacaoType,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    >
                      <option value="personalizado">
                        Menu rápido (Envio manual)
                      </option>
                      <option value="a_vencer">Padrão para: A Vencer</option>
                      <option value="pre_vencimento">
                        Padrão para: Pré-Vencimento
                      </option>
                      <option value="vence_hoje">
                        Padrão para: Vence Hoje
                      </option>
                      <option value="congelado">
                        Padrão para: Juros Congelados
                      </option>
                      <option value="vencido">
                        Padrão para: Vencido (Em Atraso)
                      </option>
                      <option value="confirmacao">
                        Padrão para: Confirmação de Pagamento
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* Barra de Tags Dinâmicas */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={12} className="text-emerald-600" />
                    Clique para adicionar tags dinâmicas ao texto:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {dynamicTags.map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      title={item.desc}
                      onClick={() => insertTagAtCursor(item.tag)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                        item.primary
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-slate-50 hover:bg-yellow-100 text-slate-700 hover:text-yellow-900 border-slate-200"
                      }`}
                    >
                      + {item.tag}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-500 pt-1">
                  {dynamicTags.map((item) => (
                    <div key={`desc-${item.tag}`} className="truncate">
                      <span className="font-mono font-semibold text-slate-700">
                        {item.tag}
                      </span>{" "}
                      — {item.desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor de Texto Padrão */}
              <div>
                <textarea
                  ref={templateRef}
                  rows={5}
                  value={currentTemplateValue}
                  placeholder={
                    !activeCustomTemplate &&
                    resolvedBuiltIn?.key === "msgLembreteVencido"
                      ? "Em branco = usa o detalhamento automático de juros, 40% e abatimentos. Digite aqui ou clique em 'Usar Modelo Editável' caso queira substituir por um texto fixo..."
                      : "Digite o modelo padrão da mensagem usando as tags {cliente}, {valor} e {data}..."
                  }
                  onChange={(e) => {
                    if (activeCustomTemplate) {
                      onUpdateCustomTemplate(activeCustomTemplate.id, {
                        text: e.target.value,
                      });
                    } else if (resolvedBuiltIn) {
                      onChangeBuiltInText(resolvedBuiltIn.key, e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-3 text-sm text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white leading-relaxed"
                />
                {detectedUsedTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                    <span>Tags ativas neste texto:</span>
                    {detectedUsedTags.map((t) => (
                      <span
                        key={`used-${t.tag}`}
                        className="font-mono font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded"
                      >
                        {t.tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pré-visualização Dinâmica ao Vivo */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-600" />
                    Pré-visualização no WhatsApp
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={previewClientId}
                      onChange={(e) => onChangePreviewClientId(e.target.value)}
                      className="px-2.5 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 max-w-[240px]"
                    >
                      <option value="">
                        Exemplo fictício (Patricia / Maria)
                      </option>
                      {clients
                        .filter((c: any) => c.id !== "admin-transactions")
                        .map((c: any) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.nomeCompleto}
                            {c.telefone ? ` (${c.telefone})` : ""}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(previewText || "")
                          .then(() => toast.success("Prévia copiada!"))
                          .catch(() => {});
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Copy size={12} />
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {previewText || (
                    <span className="text-slate-400 italic">
                      Nenhuma mensagem digitada.
                    </span>
                  )}
                </div>

                {/* Envio Manual Avulso (Recolhível para manter o painel limpo) */}
                <details className="pt-1">
                  <summary className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none flex items-center gap-1.5">
                    <Phone size={12} className="text-emerald-600" />
                    Envio rápido / número manual opcional para este modelo
                    {isManualPhoneValid && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 ml-1">
                        <Check size={10} />
                        {currentPhoneVal}
                      </span>
                    )}
                  </summary>
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="tel"
                        value={currentPhoneVal}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const prevVal = currentPhoneVal;
                          updateCurrentPhone(rawVal);
                          onTriggerPhoneEntryOpen(
                            prevVal,
                            rawVal,
                            effectiveKey,
                            previewText || "",
                          );
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          onTriggerPhonePasteOpen(
                            pasted,
                            effectiveKey,
                            previewText || "",
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isManualPhoneValid) {
                            e.preventDefault();
                            onLaunchWhatsApp(
                              currentPhoneVal,
                              previewText || "",
                            );
                          }
                        }}
                        placeholder="(31) 99999-9999 — deixe vazio para usar o celular da ficha do cliente"
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none tabular-nums"
                      />
                      {isManualPhoneValid ? (
                        <a
                          href={formatWhatsAppHref(
                            currentPhoneVal,
                            previewText || "",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#128C7E] rounded-lg transition-colors shrink-0"
                        >
                          <Send size={12} />
                          Enviar Agora
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-300 rounded-lg cursor-not-allowed shrink-0"
                        >
                          <Send size={12} />
                          Enviar Agora
                        </button>
                      )}
                      {currentPhoneVal && (
                        <button
                          type="button"
                          onClick={() => updateCurrentPhone("")}
                          className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors shrink-0"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoOpenWaOnPhone}
                        onChange={(e) =>
                          onChangeAutoOpenWaOnPhone(e.target.checked)
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Abrir o WhatsApp automaticamente ao terminar de digitar o celular (ou Enter)
                    </label>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-amber-900">
            Você tem alterações não salvas nos modelos de mensagem do WhatsApp. Clique em Salvar para aplicá-las aos envios e à fila automática.
          </span>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors"
          >
            <Save size={14} />
            {isSaving ? "Salvando..." : "Salvar Alterações Agora"}
          </button>
        </div>
      )}
    </div>
  );
};
