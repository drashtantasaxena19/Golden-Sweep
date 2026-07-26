import {
  Eye,
  Lock,
  MoreHorizontal,
  MinusCircle,
  PlusCircle,
  Unlock,
} from "lucide-react";
import type { Wallet } from "../../../types/wallet";

interface Props {
  wallets: Wallet[];
  loading: boolean;
  onCredit: (wallet: Wallet) => void;
  onDebit: (wallet: Wallet) => void;
  onToggleFreeze: (wallet: Wallet) => void;
  onTransactions: (wallet: Wallet) => void;
}

export default function WalletTable({
  wallets,
  loading,
  onCredit,
  onDebit,
  onToggleFreeze,
  onTransactions,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#26211a] bg-[#0d0d10]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-[#25252b] bg-[#111114]">
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
              <th className="px-5 py-4 font-semibold">Player</th>
              <th className="px-5 py-4 font-semibold">Balance</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Last updated</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-[#202026]">
                  <td colSpan={5} className="px-5 py-5">
                    <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                  </td>
                </tr>
              ))
            ) : wallets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-zinc-500">
                  No wallets found for the selected filters.
                </td>
              </tr>
            ) : (
              wallets.map((wallet) => (
                <tr
                  key={wallet.id}
                  className="border-b border-[#202026] transition last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{wallet.user_id}</p>
                    <p className="mt-1 text-xs text-zinc-600">{wallet.id}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-lg font-bold text-[#f7c84b]">
                      {wallet.balance.toLocaleString("en-US")}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">coins</span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        wallet.is_frozen
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {wallet.is_frozen ? "Frozen" : "Active"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {new Date(wallet.updated_at).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onTransactions(wallet)}
                        title="View transactions"
                        className="rounded-lg border border-[#2a2a30] p-2 text-zinc-400 transition hover:border-[#4b3914] hover:text-[#f7c84b]"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() => onCredit(wallet)}
                        disabled={wallet.is_frozen}
                        title="Credit wallet"
                        className="rounded-lg border border-[#2a2a30] p-2 text-zinc-400 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <PlusCircle size={17} />
                      </button>

                      <button
                        onClick={() => onDebit(wallet)}
                        disabled={wallet.is_frozen}
                        title="Debit wallet"
                        className="rounded-lg border border-[#2a2a30] p-2 text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <MinusCircle size={17} />
                      </button>

                      <button
                        onClick={() => onToggleFreeze(wallet)}
                        title={wallet.is_frozen ? "Unfreeze wallet" : "Freeze wallet"}
                        className="rounded-lg border border-[#2a2a30] p-2 text-zinc-400 transition hover:border-[#4b3914] hover:text-[#f7c84b]"
                      >
                        {wallet.is_frozen ? (
                          <Unlock size={17} />
                        ) : (
                          <Lock size={17} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
