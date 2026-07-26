import type { TransactionBreakdownItem } from "../../../types/transaction";

interface Props {
  items: TransactionBreakdownItem[];
  loading: boolean;
}

const labels: Record<TransactionBreakdownItem["transaction_type"], string> = {
  purchase: "Purchases",
  game_entry: "Game Entries",
  admin_credit: "Admin Credits",
  admin_debit: "Admin Debits",
  refund: "Refunds",
};

export default function TransactionBreakdown({ items, loading }: Props) {
  const highest = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-5">
      <h2 className="text-lg font-bold text-white">Type Breakdown</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Distribution across transaction categories
      </p>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No transaction data available.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.transaction_type}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-300">
                  {labels[item.transaction_type]}
                </span>
                <span className="text-zinc-500">
                  {item.count.toLocaleString("en-US")} ·{" "}
                  {item.total_amount.toLocaleString("en-US")} coins
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#b6841e] to-[#f6cc5a]"
                  style={{ width: `${(item.count / highest) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
