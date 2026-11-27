import React from "react";
import { FileText, RotateCcw, Save, Sparkles, Tag } from "lucide-react";
import {
  CustomWhatsAppTemplate,
  DEFAULT_WHATSAPP_TEMPLATES,
  WaTemplateKey,
} from "../utils/whatsappReminders";
import { DEFAULT_DATA_UPDATE_TEMPLATE } from "../utils/clientDataUpdateReminders";

export type CentralizedReminderTemplateKey =
  | WaTemplateKey
  | "msgLembreteRecadastro";

interface ReminderTemplateFieldMeta {
  key: CentralizedReminderTemplateKey;
  label: string;
  description: string;
  defaultText: string;
  tags: string[];
  isAutoWhenEmpty?: boolean;
}

const REMINDER_TEMPLATE_FIELDS: ReminderTemplateFieldMeta[] = [
  {
    key: "msgLembreteAVencer",
    label: "Lembrete: A Vencer",
    description:
      "Enviado para parcelas e lembretes futuros antes do prazo de pré-vencimento.",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembreteAVencer,
    tags: ["{cliente}", "{referencia}", "{valor}", "{data}"],
  },
  {
    key: "msgLembretePreVencimento",
    label: "Lembrete: Pré-Vencimento",
    description:
      "Enviado alguns dias antes do vencimento (conforme dias configurados).",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembretePreVencimento,
    tags: ["{cliente}", "{referencia}", "{valor}", "{dias}", "{data}"],
  },
  {
    key: "msgLembreteVenceHoje",
    label: "Lembrete: Vence Hoje",
    description: "Enviado no dia exato do vencimento da parcela ou lembrete.",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembreteVenceHoje,
    tags: ["{cliente}", "{referencia}", "{valor}", "{data}"],
  },
  {
    key: "msgLembreteVencido",
    label: "Lembrete: Vencido (Em Atraso)",
    description:
      "Em branco usa o cálculo automático detalhado (juros, 40% e abatimentos); preenchido usa este texto.",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembreteVencido,
    tags: ["{cliente}", "{referencia}", "{valor}", "{dias}", "{data}"],
    isAutoWhenEmpty: true,
  },
  {
    key: "msgLembreteCongelado",
    label: "Lembrete: Juros Congelados",
    description:
      "Enviado quando há acordo de congelamento de juros e abatimentos.",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembreteCongelado,
    tags: [
      "{cliente}",
      "{valor_divida}",
      "{data}",
      "{abatimentos}",
      "{valor}",
      "{prazo_congelamento}",
    ],
  },
  {
    key: "msgLembreteConfirmacao",
    label: "Confirmação de Pagamento",
    description: "Enviada após marcar a parcela ou lembrete como pago.",
    defaultText: DEFAULT_WHATSAPP_TEMPLATES.msgLembreteConfirmacao,
    tags: ["{cliente}", "{referencia}", "{valor}", "{data}"],
  },
  {
    key: "msgLembreteRecadastro",
    label: "Atualização Cadastral (Recadastro)",
    description:
      "Enviado ao cliente quando completar o ciclo de meses configurado desde o cadastro.",
    defaultText: DEFAULT_DATA_UPDATE_TEMPLATE,
    tags: ["{cliente}", "{meses}", "{referencia}", "{data_ref}"],
  },
];

const EDITABLE_VENCIDO_STARTER =
  "Olá {cliente}, a GM-Empréstimo informa que {referencia} no valor atualizado de {valor} está vencida há {dias} dia(s) (vencimento em {data}). Por favor, entre em contato para regularizar.";

interface CentralizedReminderTemplatesSectionProps {
  values: Record<CentralizedReminderTemplateKey, string>;
  customTemplates: CustomWhatsAppTemplate[];
  overridingCustomByKey?: Partial<Record<WaTemplateKey, CustomWhatsAppTemplate>>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onChangeTemplate: (key: CentralizedReminderTemplateKey, text: string) => void;
  onChangeCustomTemplateText: (id: string, text: string) => void;
  onRestoreDefault: (key: CentralizedReminderTemplateKey) => void;
  onRestoreAllDefaults: () => void;
  onSaveAll: () => void;
}

export const CentralizedReminderTemplatesSection: React.FC<
  CentralizedReminderTemplatesSectionProps
> = ({
  values,
  customTemplates,
  overridingCustomByKey = {},
  hasUnsavedChanges,
  isSaving,
  onChangeTemplate,
  onChangeCustomTemplateText,
  onRestoreDefault,
  onRestoreAllDefaults,
  onSaveAll,
}) => {
  const appendTag = (key: CentralizedReminderTemplateKey, tag: string) => {
    const rawCurrent = values[key] ?? "";
    const meta = REMINDER_TEMPLATE_FIELDS.find((f) => f.key === key);
    const effectiveCurrent =
      !rawCurrent.trim() && meta && !meta.isAutoWhenEmpty
        ? meta.defaultText
        : rawCurrent;
    const sep =
      effectiveCurrent.length > 0 &&
      !effectiveCurrent.endsWith(" ") &&
      !effectiveCurrent.endsWith("\n")
        ? " "
        : "";
    onChangeTemplate(key, `${effectiveCurrent}${sep}${tag}`);
  };

  const appendTagToCustom = (custom: CustomWhatsAppTemplate, tag: string) => {
    const cur = custom.text ?? "";
    const sep =
      cur.length > 0 && !cur.endsWith(" ") && !cur.endsWith("\n") ? " " : "";
    onChangeCustomTemplateText(custom.id, `${cur}${sep}${tag}`);
  };

  return (
    <div
      id="section-centralized-reminder-templates"
      className="mt-6 pt-6 border-t border-slate-200"
    >
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText size={19} className="text-yellow-600" />
              Modelos de Texto de Lembretes (Edição Centralizada)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Visualize e edite diretamente os textos atuais de todos os lembretes em um único lugar, fora do painel avançado de controle do WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasUnsavedChanges && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Alterações não salvas
              </span>
            )}
            <button
              type="button"
              onClick={onRestoreAllDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <RotateCcw size={13} />
              Restaurar Padrões
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveAll}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              <Save size={14} />
              {isSaving ? "Salvando..." : "Salvar Modelos de Texto"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {REMINDER_TEMPLATE_FIELDS.map((field) => {
            const rawVal = values[field.key] ?? "";
            const displayValue =
              !rawVal.trim() && !field.isAutoWhenEmpty
                ? field.defaultText
                : rawVal;
            const isAutomaticMode =
              Boolean(field.isAutoWhenEmpty) && !displayValue.trim();
            const isEdited =
              !isAutomaticMode &&
              displayValue.trim() !== field.defaultText.trim();
            const overridingCustom =
              field.key !== "msgLembreteRecadastro"
                ? overridingCustomByKey[field.key]
                : undefined;

            return (
              <div
                key={field.key}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={`central-tpl-${field.key}`}
                        className="text-sm font-bold text-slate-800"
                      >
                        {field.label}
                      </label>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          isAutomaticMode
                            ? "bg-slate-100 text-slate-600"
                            : isEdited
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isAutomaticMode
                          ? "Automático"
                          : isEdited
                            ? "Editado"
                            : "Padrão"}
                      </span>
                      {overridingCustom && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800">
                          Substituído por: {overridingCustom.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {field.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRestoreDefault(field.key)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                    title="Restaurar texto padrão deste modelo"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {overridingCustom && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                    O modelo extra <strong>{overridingCustom.label}</strong> está vinculado a esta situação e tem prioridade sobre este campo padrão.
                  </div>
                )}

                <textarea
                  id={`central-tpl-${field.key}`}
                  rows={field.key === "msgLembreteRecadastro" || field.key === "msgLembreteCongelado" ? 4 : 3}
                  value={displayValue}
                  placeholder={
                    field.isAutoWhenEmpty
                      ? "Em branco = detalhamento automático de juros, 40% e abatimentos. Digite aqui caso deseje substituir por um texto fixo..."
                      : "Digite o texto do lembrete..."
                  }
                  onChange={(e) => onChangeTemplate(field.key, e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white leading-relaxed"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mr-0.5">
                    <Tag size={10} />
                    Tags:
                  </span>
                  {field.tags.map((tag) => (
                    <button
                      key={`${field.key}-${tag}`}
                      type="button"
                      onClick={() => appendTag(field.key, tag)}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-yellow-100 text-slate-700 hover:text-yellow-900 border border-slate-200 rounded transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                  {isAutomaticMode && (
                    <button
                      type="button"
                      onClick={() =>
                        onChangeTemplate(field.key, EDITABLE_VENCIDO_STARTER)
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-300 rounded transition-colors ml-auto"
                    >
                      <Sparkles size={10} />
                      Carregar texto editável
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {customTemplates.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Modelos Extras Personalizados ({customTemplates.length})
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {customTemplates.map((ct) => (
                <div
                  key={`central-custom-${ct.id}`}
                  className="bg-white border border-indigo-200 rounded-xl p-4 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`central-custom-${ct.id}`}
                      className="text-sm font-bold text-slate-800 truncate"
                    >
                      {ct.label || "Modelo Personalizado"}
                    </label>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-100 text-indigo-800 shrink-0">
                      {ct.situacao === "personalizado"
                        ? "Envio manual"
                        : `Vinculado a: ${ct.situacao}`}
                    </span>
                  </div>

                  <textarea
                    id={`central-custom-${ct.id}`}
                    rows={3}
                    value={ct.text || ""}
                    onChange={(e) =>
                      onChangeCustomTemplateText(ct.id, e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mr-0.5">
                      <Tag size={10} />
                      Tags:
                    </span>
                    {["{cliente}", "{referencia}", "{valor}", "{data}", "{dias}"].map(
                      (tag) => (
                        <button
                          key={`central-custom-${ct.id}-${tag}`}
                          type="button"
                          onClick={() => appendTagToCustom(ct, tag)}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 border border-slate-200 rounded transition-colors"
                        >
                          + {tag}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
