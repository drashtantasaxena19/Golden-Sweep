import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";
import type { TransactionStatistics as Stats } from "../../../types/transaction";

interface Props {
  statistics: Stats | null;
  loading: boolean;
}

const cards = [
  {
    key: "total_transactions",
    label: "Total Transactions",
    icon: ReceiptText,
  },
  {
    key: "total_credited_coins",
    label: "Credited Coins",
    icon: ArrowDownCircle,
  },
  {
    key: "total_debited_coins",
    label: "Debited Coins",
    icon: ArrowUpCircle,
  },
  {
    key: "net_coin_change",
    label: "Net Coin Change",
    icon: CircleDollarSign,
  },
] as const;

export default function TransactionStatistics({
  statistics,
  loading,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#4b3914] bg-[#19140a] text-[#f7c84b]">
              <Icon size={21} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
              Ledger
            </span>
          </div>

          <p className="mt-5 text-sm text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {loading
              ? "—"
              : Number(statistics?.[key] ?? 0).toLocaleString("en-US")}
          </p>
        </div>
      ))}
    </div>
  );
}
