import type { TransactionDailyTrendItem } from "../../../types/transaction";

interface Props {
  items: TransactionDailyTrendItem[];
  loading: boolean;
}

export default function TransactionTrend({ items, loading }: Props) {
  const maxValue = Math.max(
    ...items.flatMap((item) => [item.credited_coins, item.debited_coins]),
    1,
  );

  return (
    <div className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-5">
      <h2 className="text-lg font-bold text-white">Daily Coin Movement</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Credited and debited coins over the selected period
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No daily trend data available.
          </div>
        ) : (
          <div className="flex min-h-[220px] items-end gap-3 overflow-x-auto pb-3">
            {items.map((item) => (
              <div
                key={item.date}
                className="flex min-w-[56px] flex-1 flex-col items-center"
              >
                <div className="flex h-[170px] items-end gap-1">
                  <div
                    title={`${item.credited_coins.toLocaleString("en-US")} credited`}
                    className="w-4 rounded-t bg-emerald-500"
                    style={{
                      height: `${Math.max(
                        4,
                        (item.credited_coins / maxValue) * 160,
                      )}px`,
                    }}
                  />
                  <div
                    title={`${item.debited_coins.toLocaleString("en-US")} debited`}
                    className="w-4 rounded-t bg-red-500"
                    style={{
                      height: `${Math.max(
                        4,
                        (item.debited_coins / maxValue) * 160,
                      )}px`,
                    }}
                  />
                </div>

                <span className="mt-2 text-[10px] text-zinc-600">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-5 text-xs text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Credited
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Debited
          </span>
        </div>
      </div>
    </div>
  );
}
