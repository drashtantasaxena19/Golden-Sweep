import {
  CircleDollarSign,
  CircleOff,
  Coins,
  WalletCards,
} from "lucide-react";
import type { WalletStatistics as WalletStatisticsType } from "../../../types/wallet";

interface Props {
  statistics: WalletStatisticsType | null;
  loading: boolean;
}

const cards = [
  {
    key: "total_wallets",
    label: "Total Wallets",
    icon: WalletCards,
  },
  {
    key: "total_coins_in_circulation",
    label: "Coins in Circulation",
    icon: Coins,
  },
  {
    key: "active_wallets",
    label: "Active Wallets",
    icon: CircleDollarSign,
  },
  {
    key: "frozen_wallets",
    label: "Frozen Wallets",
    icon: CircleOff,
  },
] as const;

export default function WalletStatistics({ statistics, loading }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#4b3914] bg-[#19140a] text-[#f7c84b]">
              <Icon size={21} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Wallet
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
