import { useEffect, useMemo, useState } from "react";
import type { UserSummary } from "../../../types/userManagement";

type WalletMode = "credit" | "debit" | "set";

interface WalletDialogProps {
    open: boolean;
    user: UserSummary | null;
    loading?: boolean;
    onClose: () => void;
    onCredit: (amount: number) => void | Promise<void>;
    onDebit: (amount: number) => void | Promise<void>;
    onSetBalance: (amount: number) => void | Promise<void>;
}

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

const parseAmount = (value: string) => {
    const normalized = value.trim();

    if (normalized === "") {
        return null;
    }

    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
};

const formatAmount = (value: number) =>
    value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

export default function WalletDialog({
    open,
    user,
    loading = false,
    onClose,
    onCredit,
    onDebit,
    onSetBalance,
}: WalletDialogProps) {
    const [mode, setMode] = useState<WalletMode>("credit");
    const [amountInput, setAmountInput] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        setMode("credit");
        setAmountInput("");
        setError("");

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, user, loading, onClose]);

    const currentBalance = Number(user?.wallet_balance ?? 0);
    const currency = user?.wallet_currency || "GC";
    const amount = parseAmount(amountInput);

    const projectedBalance = useMemo(() => {
        if (amount === null) return currentBalance;

        if (mode === "credit") return currentBalance + amount;
        if (mode === "debit") return currentBalance - amount;

        return amount;
    }, [amount, currentBalance, mode]);

    if (!open || !user) return null;

    const validate = () => {
        if (amount === null) {
            setError("Enter a valid amount.");
            return false;
        }

        if (amount < 0) {
            setError("Amount cannot be negative.");
            return false;
        }

        if ((mode === "credit" || mode === "debit") && amount <= 0) {
            setError("Amount must be greater than zero.");
            return false;
        }

        if (mode === "debit" && amount > currentBalance) {
            setError("Debit amount cannot exceed the current wallet balance.");
            return false;
        }

        setError("");
        return true;
    };

    const handleSubmit = async () => {
        if (!validate() || amount === null) return;

        if (mode === "credit") {
            await onCredit(amount);
            return;
        }

        if (mode === "debit") {
            await onDebit(amount);
            return;
        }

        await onSetBalance(amount);
    };

    const handleModeChange = (nextMode: WalletMode) => {
        if (loading) return;

        setMode(nextMode);
        setAmountInput("");
        setError("");
    };

    const modeLabel =
        mode === "credit"
            ? "Credit wallet"
            : mode === "debit"
              ? "Debit wallet"
              : "Set wallet balance";

    return (
        <div
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-dialog-title"
        >
            <button
                type="button"
                aria-label="Close wallet dialog"
                disabled={loading}
                className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm disabled:cursor-not-allowed"
                onClick={onClose}
            />

            <div className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#090d18] text-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
                <header className="flex items-start justify-between border-b border-white/10 px-4 py-5 sm:px-6">
                    <div className="min-w-0 pr-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                            GoldenSweep Wallet
                        </p>
                        <h2
                            id="wallet-dialog-title"
                            className="mt-1 text-xl font-bold sm:text-2xl"
                        >
                            Wallet management
                        </h2>
                        <p className="mt-1 truncate text-sm text-slate-400">
                            {user.full_name} · {user.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>

                <div className="space-y-5 px-4 py-5 sm:px-6">
                    <section className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-white/[0.03] to-transparent p-5">
                        <p className="text-sm font-medium text-slate-400">
                            Current balance
                        </p>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                            <span className="text-3xl font-black text-amber-300 sm:text-4xl">
                                {currency}
                            </span>
                            <span className="text-3xl font-black sm:text-4xl">
                                {formatAmount(currentBalance)}
                            </span>
                        </div>
                    </section>

                    <section>
                        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
                            {(
                                [
                                    ["credit", "Credit"],
                                    ["debit", "Debit"],
                                    ["set", "Set balance"],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleModeChange(value)}
                                    className={`rounded-xl px-2 py-3 text-sm font-semibold transition ${
                                        mode === value
                                            ? "bg-amber-300 text-black shadow-lg shadow-amber-300/10"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                        <label
                            htmlFor="wallet-amount"
                            className="block text-sm font-semibold text-slate-200"
                        >
                            {mode === "set" ? "New balance" : "Transaction amount"}
                        </label>

                        <div className="mt-3 flex overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-amber-300/50 focus-within:ring-2 focus-within:ring-amber-300/10">
                            <span className="flex items-center border-r border-white/10 px-4 text-sm font-bold text-amber-300">
                                {currency}
                            </span>
                            <input
                                id="wallet-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={amountInput}
                                disabled={loading}
                                onChange={(event) => {
                                    setAmountInput(event.target.value);
                                    if (error) setError("");
                                }}
                                placeholder="0.00"
                                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg font-semibold text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {QUICK_AMOUNTS.map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setAmountInput(String(quickAmount));
                                        setError("");
                                    }}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    +{formatAmount(quickAmount)}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <p className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                                {error}
                            </p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Transaction preview
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    {modeLabel}
                                </p>
                            </div>
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                    projectedBalance < 0
                                        ? "border-red-400/30 bg-red-400/10 text-red-300"
                                        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                }`}
                            >
                                Projected
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs text-slate-500">Before</p>
                                <p className="mt-1 font-bold">
                                    {currency} {formatAmount(currentBalance)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs text-slate-500">Amount</p>
                                <p className="mt-1 font-bold">
                                    {currency} {formatAmount(amount ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs text-slate-500">After</p>
                                <p
                                    className={`mt-1 font-bold ${
                                        projectedBalance < 0
                                            ? "text-red-300"
                                            : "text-emerald-300"
                                    }`}
                                >
                                    {currency} {formatAmount(projectedBalance)}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#090d18]/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-amber-400/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Processing..." : modeLabel}
                    </button>
                </footer>
            </div>
        </div>
    );
}