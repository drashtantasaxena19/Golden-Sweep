import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, History, X } from "lucide-react";
import walletService from "../../../services/walletService";
import type { Wallet, WalletTransaction } from "../../../types/wallet";

interface Props {
  wallet: Wallet | null;
  onClose: () => void;
}

const labels: Record<WalletTransaction["transaction_type"], string> = {
  purchase: "Purchase",
  game_entry: "Game Entry",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  refund: "Refund",
};

export default function WalletTransactionsDrawer({ wallet, onClose }: Props) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    setLoading(true);
    walletService
      .getTransactions(wallet.id, 1, 50)
      .then((response) => setTransactions(response.transactions))
      .finally(() => setLoading(false));
  }, [wallet]);

  if (!wallet) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-[#2b261b] bg-[#090a0d] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#25252b] bg-[#090a0d]/95 p-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 text-[#f7c84b]">
              <History size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">
                Ledger
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">
              Wallet Transactions
            </h2>
            <p className="text-sm text-zinc-500">{wallet.user_id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#2a2a30] p-2 text-zinc-400 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 rounded-2xl border border-[#3c3018] bg-[#171208] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Current balance
            </p>
            <p className="mt-2 text-3xl font-bold text-[#f7c84b]">
              {wallet.balance.toLocaleString("en-US")} coins
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-500">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#303038] py-16 text-center text-zinc-500">
              No wallet transactions found.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const positive = ["purchase", "admin_credit", "refund"].includes(
                  transaction.transaction_type,
                );
                const Icon = positive ? ArrowDownLeft : ArrowUpRight;

                return (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-[#25252b] bg-[#0d0d10] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          positive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">
                              {labels[transaction.transaction_type]}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {transaction.reason}
                            </p>
                          </div>
                          <p
                            className={`whitespace-nowrap font-bold ${
                              positive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {positive ? "+" : "-"}
                            {transaction.amount.toLocaleString("en-US")}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
                          <span>
                            {transaction.balance_before.toLocaleString("en-US")} →{" "}
                            {transaction.balance_after.toLocaleString("en-US")}
                          </span>
                          <span>
                            {new Date(transaction.created_at).toLocaleString()}
                          </span>
                          {transaction.reference_id && (
                            <span>Ref: {transaction.reference_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
