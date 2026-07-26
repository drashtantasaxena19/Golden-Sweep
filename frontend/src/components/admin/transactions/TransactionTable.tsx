import { Eye } from "lucide-react";
import type { Transaction } from "../../../types/transaction";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onView: (transaction: Transaction) => void;
}

const labels: Record<Transaction["transaction_type"], string> = {
  purchase: "Purchase",
  game_entry: "Game Entry",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  refund: "Refund",
};

const positiveTypes = new Set(["purchase", "admin_credit", "refund"]);

export default function TransactionTable({
  transactions,
  loading,
  onView,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#26211a] bg-[#0d0d10]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-[#25252b] bg-[#111114]">
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              <th className="px-5 py-4 font-semibold">Transaction</th>
              <th className="px-5 py-4 font-semibold">Player</th>
              <th className="px-5 py-4 font-semibold">Type</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Balance</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-[#202026]">
                  <td colSpan={7} className="px-5 py-5">
                    <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-zinc-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {
                const positive = positiveTypes.has(
                  transaction.transaction_type,
                );

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-[#202026] transition last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="max-w-[180px] truncate font-medium text-white">
                        {transaction.reason}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {transaction.reference_id || transaction.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-200">
                        {transaction.user_id}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {transaction.wallet_id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                        {labels[transaction.transaction_type]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`font-bold ${
                          positive ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {positive ? "+" : "-"}
                        {transaction.amount.toLocaleString("en-US")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {transaction.balance_before.toLocaleString("en-US")} →{" "}
                      {transaction.balance_after.toLocaleString("en-US")}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {new Date(transaction.created_at).toLocaleString("en-US")}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onView(transaction)}
                        className="rounded-lg border border-[#2a2a30] p-2 text-zinc-400 transition hover:border-[#4b3914] hover:text-[#f7c84b]"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
