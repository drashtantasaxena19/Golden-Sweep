import type { AnalyticsGranularity } from "../../../types/analytics";
import type { AnalyticsPreset } from "../../../services/analyticsService";

interface AnalyticsFiltersProps {
  preset: AnalyticsPreset;
  granularity: AnalyticsGranularity;
  startDate: string;
  endDate: string;
  loading?: boolean;
  onPresetChange: (preset: AnalyticsPreset) => void;
  onGranularityChange: (value: AnalyticsGranularity) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
  onRefresh: () => void;
}

const presets: Array<{
  value: AnalyticsPreset;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "7 days" },
  { value: "last_30_days", label: "30 days" },
  { value: "last_90_days", label: "90 days" },
  { value: "this_month", label: "This month" },
  { value: "this_year", label: "This year" },
];

const inputClass =
  "h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none transition focus:border-amber-400/60";

const AnalyticsFilters = ({
  preset,
  granularity,
  startDate,
  endDate,
  loading = false,
  onPresetChange,
  onGranularityChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onRefresh,
}: AnalyticsFiltersProps) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/75 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onPresetChange(item.value)}
            className={
              preset === item.value
                ? "rounded-xl bg-amber-400 px-3.5 py-2 text-sm font-semibold text-black"
                : "rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-zinc-400 hover:border-amber-300/30 hover:text-white"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_auto_auto]">
        <input
          aria-label="Analytics start date"
          type="date"
          value={startDate}
          onChange={(event) =>
            onStartDateChange(event.target.value)
          }
          className={inputClass}
        />

        <input
          aria-label="Analytics end date"
          type="date"
          value={endDate}
          onChange={(event) =>
            onEndDateChange(event.target.value)
          }
          className={inputClass}
        />

        <select
          aria-label="Analytics granularity"
          value={granularity}
          onChange={(event) =>
            onGranularityChange(
              event.target.value as AnalyticsGranularity,
            )
          }
          className={inputClass}
        >
          <option value="hour">Hourly</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>

        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="h-11 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </section>
  );
};

export default AnalyticsFilters;