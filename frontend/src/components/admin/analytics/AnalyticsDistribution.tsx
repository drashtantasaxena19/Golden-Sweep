interface DistributionItem {
  label: string;
  value: number;
  percentage: number;
}

interface AnalyticsDistributionProps {
  items: DistributionItem[];
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
}

const AnalyticsDistribution = ({
  items,
  valueFormatter = (value) => value.toLocaleString("en-US"),
  emptyMessage = "No distribution data is available.",
}: AnalyticsDistributionProps) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percentage = Math.min(Math.max(item.percentage, 0), 100);

        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="truncate font-medium text-zinc-300">
                {item.label}
              </span>
              <span className="shrink-0 text-zinc-500">
                {valueFormatter(item.value)} · {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsDistribution;
