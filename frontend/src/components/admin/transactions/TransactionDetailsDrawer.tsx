import { ArrowDownLeft, ArrowUpRight, Copy, X } from "lucide-react";
import type { Transaction } from "../../../types/transaction";

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

const labels: Record<Transaction["transaction_type"], string> = {
  purchase: "Purchase",
  game_entry: "Game Entry",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  refund: "Refund",
};

export default function TransactionDetailsDrawer({
  transaction,
  onClose,
}: Props) {
  if (!transaction) return null;

  const positive = ["purchase", "admin_credit", "refund"].includes(
    transaction.transaction_type,
  );
  const Icon = positive ? ArrowDownLeft : ArrowUpRight;

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto border-l border-[#2b261b] bg-[#090a0d] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#25252b] bg-[#090a0d]/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c84b]">
              Transaction Details
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {labels[transaction.transaction_type]}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#2a2a30] p-2 text-zinc-400 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-[#3b311e] bg-[#171208] p-5">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  positive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                <Icon size={22} />
              </div>

              <div>
                <p className="text-sm text-zinc-500">Coin movement</p>
                <p
                  className={`text-3xl font-bold ${
                    positive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {positive ? "+" : "-"}
                  {transaction.amount.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </div>

          <Detail label="Reason" value={transaction.reason} />
          <Detail label="User ID" value={transaction.user_id} copyValue={copy} />
          <Detail
            label="Wallet ID"
            value={transaction.wallet_id}
            copyValue={copy}
          />
          <Detail
            label="Transaction ID"
            value={transaction.id}
            copyValue={copy}
          />
          <Detail
            label="Reference ID"
            value={transaction.reference_id || "Not provided"}
            copyValue={transaction.reference_id ? copy : undefined}
          />
          <Detail
            label="Created by"
            value={transaction.created_by || "System"}
          />

          <div className="grid grid-cols-2 gap-3">
            <Detail
              label="Balance before"
              value={`${transaction.balance_before.toLocaleString("en-US")} coins`}
            />
            <Detail
              label="Balance after"
              value={`${transaction.balance_after.toLocaleString("en-US")} coins`}
            />
          </div>

          <Detail
            label="Created at"
            value={new Date(transaction.created_at).toLocaleString("en-US")}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: (value: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-[#25252b] bg-[#0d0d10] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="break-all text-sm font-medium text-zinc-200">{value}</p>
        {copyValue && (
          <button
            onClick={() => copyValue(value)}
            className="shrink-0 text-zinc-600 hover:text-[#f7c84b]"
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
