import type { ReactNode } from "react";

interface AnalyticsStatCardProps {
  label: string;
  value: string;
  helper?: string;
  trend?: number;
  icon?: ReactNode;
}

const AnalyticsStatCard = ({
  label,
  value,
  helper,
  trend,
  icon,
}: AnalyticsStatCardProps) => {
  const trendText =
    trend === undefined
      ? null
      : `${trend >= 0 ? "+" : ""}${trend.toFixed(2)}%`;

  return (
    <article className="rounded-3xl border border-amber-200/20 bg-zinc-950/80 p-5 shadow-[0_20px_60px_-35px_rgba(245,158,11,0.65)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        {icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
            {icon}
          </div>
        ) : null}
      </div>

      {(helper || trendText) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendText ? (
            <span
              className={
                trend !== undefined && trend >= 0
                  ? "rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-300"
                  : "rounded-full bg-rose-500/10 px-2.5 py-1 font-medium text-rose-300"
              }
            >
              {trendText}
            </span>
          ) : null}

          {helper ? <span className="text-zinc-500">{helper}</span> : null}
        </div>
      )}
    </article>
  );
};

export default AnalyticsStatCard;
