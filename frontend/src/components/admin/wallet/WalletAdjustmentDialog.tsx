import { useEffect, useState } from "react";
import { MinusCircle, PlusCircle, X } from "lucide-react";
import type { Wallet } from "../../../types/wallet";

interface Props {
  wallet: Wallet | null;
  mode: "credit" | "debit" | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    amount: number;
    reason: string;
    reference_id?: string;
  }) => Promise<void>;
}

export default function WalletAdjustmentDialog({
  wallet,
  mode,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [referenceId, setReferenceId] = useState("");

  useEffect(() => {
    if (mode) {
      setAmount("");
      setReason("");
      setReferenceId("");
    }
  }, [mode, wallet?.id]);

  if (!wallet || !mode) return null;

  const isCredit = mode === "credit";
  const Icon = isCredit ? PlusCircle : MinusCircle;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isInteger(numericAmount) || numericAmount <= 0) return;
    if (reason.trim().length < 3) return;

    await onSubmit({
      amount: numericAmount,
      reason: reason.trim(),
      reference_id: referenceId.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#3a3020] bg-[#0d0d10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#25252b] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19140a] text-[#f7c84b]">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">
                {isCredit ? "Credit Wallet" : "Debit Wallet"}
              </h2>
              <p className="text-xs text-zinc-500">{wallet.user_id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-[#2a2a30] bg-[#08090c] p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
              Current balance
            </p>
            <p className="mt-1 text-xl font-bold text-[#f7c84b]">
              {wallet.balance.toLocaleString("en-US")} coins
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Amount
            </span>
            <input
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="1"
              step="1"
              required
              className="h-11 w-full rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-white outline-none focus:border-[#b98b27]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Reason
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              minLength={3}
              rows={3}
              className="w-full resize-none rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 py-3 text-white outline-none focus:border-[#b98b27]"
              placeholder="Why is this balance being adjusted?"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Reference ID
            </span>
            <input
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-white outline-none focus:border-[#b98b27]"
              placeholder="Optional internal reference"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              type="button"
              disabled={loading}
              className="h-11 rounded-xl border border-[#2a2a30] px-5 text-sm font-semibold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-[#d7a62c] to-[#f5cb58] px-5 text-sm font-bold text-black disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : isCredit
                  ? "Credit coins"
                  : "Debit coins"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
