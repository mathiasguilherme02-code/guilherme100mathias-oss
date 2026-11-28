import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AlertTriangle, BarChart3, Users, Calendar, Percent } from "lucide-react";
import {
  computeMonthlyDelinquencySeries,
  DelinquencyPeriodOption,
  MonthlyDelinquencyPoint,
} from "../utils/delinquencyAnalytics";

interface DelinquencyEvolutionChartProps {
  clients: any[];
  taxaAtrasoDia?: string | number;
  initialPeriod?: DelinquencyPeriodOption;
}

type ChartMetricMode = "valor" | "quantidade";

const formatBRL = (value: number): string =>
  (Number(value) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatCompactBRL = (value: number): string => {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1000) {
    return `R$ ${(num / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })}k`;
  }
  return `R$ ${Math.round(num)}`;
};

interface DelinquencyTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: MonthlyDelinquencyPoint }>;
}

const DelinquencyTooltip: React.FC<DelinquencyTooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-3.5 text-xs min-w-[230px]">
      <p className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-100 pb-1.5">
        {point.monthFullLabel}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Valor Atualizado:</span>
          <span className="font-bold text-rose-600 tabular-nums">
            {formatBRL(point.overdueUpdatedTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Valor Original (Líquido):</span>
          <span className="font-semibold text-amber-700 tabular-nums">
            {formatBRL(point.overdueOriginalTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <span className="text-slate-600">Parcelas Vencidas:</span>
          <span className="font-bold text-slate-800 tabular-nums">
            {point.overdueCount}
            {point.totalDueCount > 0 ? ` / ${point.totalDueCount}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Clientes Inadimplentes:</span>
          <span className="font-bold text-indigo-700 tabular-nums">
            {point.overdueClientsCount}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Taxa de Inadimplência:</span>
          <span className="font-bold text-rose-700 tabular-nums">
            {point.delinquencyRatePct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const DelinquencyEvolutionChart: React.FC<
  DelinquencyEvolutionChartProps
> = ({ clients, taxaAtrasoDia = "8", initialPeriod = "12m" }) => {
  const [period, setPeriod] = useState<DelinquencyPeriodOption>(initialPeriod);
  const [metricMode, setMetricMode] = useState<ChartMetricMode>("valor");
  const [includeFrozen, setIncludeFrozen] = useState<boolean>(true);

  const analytics = useMemo(
    () =>
      computeMonthlyDelinquencySeries(clients, {
        taxaAtrasoDia,
        period,
        includeFrozen,
      }),
    [clients, taxaAtrasoDia, period, includeFrozen],
  );

  const { points, summary, availableYears } = analytics;
  const hasAnyOverdue = summary.totalOverdueCount > 0;

  return (
    <div
      data-testid="delinquency-evolution-chart"
      className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={22} className="text-rose-500 shrink-0" />
            Evolução da Inadimplência por Mês
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Parcelas não pagas vencidas até hoje agrupadas pelo mês de vencimento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setMetricMode("valor")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                metricMode === "valor"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Valores (R$)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("quantidade")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                metricMode === "quantidade"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Parcelas &amp; Clientes
            </button>
          </div>

          <select
            aria-label="Período da evolução de inadimplência"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as DelinquencyPeriodOption)
            }
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700 focus:ring-2 focus:ring-rose-400 outline-none"
          >
            <option value="6m">Últimos 6 meses</option>
            <option value="12m">Últimos 12 meses</option>
            <option value="all">Todo o histórico</option>
            {availableYears.map((yr) => (
              <option key={yr} value={`year:${yr}`}>
                Ano {yr}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeFrozen}
              onChange={(e) => setIncludeFrozen(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Incluir congeladas</span>
          </label>
        </div>
      </div>

      {/* KPIs do Período */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            <AlertTriangle size={14} />
            <span>Total Atualizado em Atraso</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-700 mt-1 tabular-nums">
            {formatBRL(summary.totalOverdueUpdated)}
          </p>
          <p className="text-[11px] text-rose-500 mt-0.5 tabular-nums">
            Original líquido: {formatBRL(summary.totalOverdueOriginal)}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            <Calendar size={14} />
            <span>Parcelas Vencidas</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-800 mt-1 tabular-nums">
            {summary.totalOverdueCount}
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5 tabular-nums">
            de {summary.totalDueCount} vencida(s)/prevista(s) no período
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            <Users size={14} />
            <span>Clientes Inadimplentes</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-indigo-700 mt-1 tabular-nums">
            {summary.uniqueOverdueClients}
          </p>
          <p className="text-[11px] text-indigo-500 mt-0.5">
            cliente(s) único(s) no período
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <Percent size={14} />
            <span>Taxa &amp; Mês de Pico</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-800 mt-1 tabular-nums">
            {summary.overallRatePct.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {summary.peakMonth
              ? `Pico: ${summary.peakMonth.monthLabel} (${formatBRL(summary.peakMonth.overdueUpdatedTotal)})`
              : "Sem inadimplência no período"}
          </p>
        </div>
      </div>

      {/* Área do Gráfico Recharts */}
      {!hasAnyOverdue && points.every((p) => p.totalDueCount === 0) ? (
        <div className="h-72 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center p-6">
          <BarChart3 size={32} className="text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Nenhuma parcela encontrada para o período selecionado
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Selecione outro intervalo ou cadastre simulações ativas para acompanhar a evolução mensal.
          </p>
        </div>
      ) : (
        <div className="w-full h-80 min-w-0">
          <ResponsiveContainer width="100%" height={320}>
            {metricMode === "valor" ? (
              <ComposedChart
                data={points}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatCompactBRL}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<DelinquencyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="overdueOriginalTotal"
                  name="Valor Original Vencido"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  yAxisId="left"
                  dataKey="overdueUpdatedTotal"
                  name="Valor Atualizado c/ Juros"
                  fill="#e11d48"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="delinquencyRatePct"
                  name="Taxa de Inadimplência (%)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#4f46e5" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            ) : (
              <AreaChart
                data={points}
                margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient
                    id="overdueCountFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient
                    id="overdueClientsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip content={<DelinquencyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="overdueCount"
                  name="Parcelas Vencidas"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fill="url(#overdueCountFill)"
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="overdueClientsCount"
                  name="Clientes Inadimplentes"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#overdueClientsFill)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
