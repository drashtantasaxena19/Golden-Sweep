import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, WalletCards } from "lucide-react";
import WalletAdjustmentDialog from "../../components/admin/wallet/WalletAdjustmentDialog";
import WalletFilters from "../../components/admin/wallet/WalletFilters";
import WalletStatistics from "../../components/admin/wallet/WalletStatistics";
import WalletTable from "../../components/admin/wallet/WalletTable";
import WalletTransactionsDrawer from "../../components/admin/wallet/WalletTransactionsDrawer";
import walletService from "../../services/walletService";
import type {
  Wallet as WalletType,
  WalletAdjustmentPayload,
  WalletFilters as WalletFiltersType,
  WalletStatistics as WalletStatisticsType,
} from "../../types/wallet";

const initialFilters: WalletFiltersType = {
  search: "",
  status: "all",
  minimumBalance: "",
  maximumBalance: "",
};

export default function Wallet() {
  const [statistics, setStatistics] = useState<WalletStatisticsType | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [filters, setFilters] = useState<WalletFiltersType>(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adjustmentWallet, setAdjustmentWallet] = useState<WalletType | null>(null);
  const [adjustmentMode, setAdjustmentMode] = useState<"credit" | "debit" | null>(null);
  const [transactionWallet, setTransactionWallet] = useState<WalletType | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [statisticsResponse, walletsResponse] = await Promise.all([
        walletService.getStatistics(),
        walletService.getWallets(filters, page, limit),
      ]);

      setStatistics(statisticsResponse);
      setWallets(walletsResponse.wallets);
      setTotal(walletsResponse.total);
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Could not load wallet data.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    const timeout = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const handleFiltersChange = (nextFilters: WalletFiltersType) => {
    setPage(1);
    setFilters(nextFilters);
  };

  const openAdjustment = (
    wallet: WalletType,
    mode: "credit" | "debit",
  ) => {
    setAdjustmentWallet(wallet);
    setAdjustmentMode(mode);
  };

  const closeAdjustment = () => {
    if (actionLoading) return;
    setAdjustmentWallet(null);
    setAdjustmentMode(null);
  };

  const submitAdjustment = async (payload: WalletAdjustmentPayload) => {
    if (!adjustmentWallet || !adjustmentMode) return;

    setActionLoading(true);

    try {
      const response =
        adjustmentMode === "credit"
          ? await walletService.creditWallet(adjustmentWallet.id, payload)
          : await walletService.debitWallet(adjustmentWallet.id, payload);

      showMessage("success", response.message);
      closeAdjustment();
      await loadData();
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Wallet update failed.",
      );
    } finally {
      setActionLoading(false);
      setAdjustmentWallet(null);
      setAdjustmentMode(null);
    }
  };

  const toggleFreeze = async (wallet: WalletType) => {
    const action = wallet.is_frozen ? "unfreeze" : "freeze";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this wallet?`,
    );

    if (!confirmed) return;

    try {
      const response = wallet.is_frozen
        ? await walletService.unfreezeWallet(wallet.id)
        : await walletService.freezeWallet(wallet.id);

      showMessage("success", response.message);
      await loadData();
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Wallet status update failed.",
      );
    }
  };

  return (
    <div className="min-h-full bg-[#05060a] px-5 py-6 text-white lg:px-7">
      {message && (
        <div
          className={`fixed right-5 top-20 z-[70] max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-950 text-emerald-300"
              : "border-red-500/30 bg-red-950 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#f7c84b]">
              <WalletCards size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Gold Coin Economy
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Wallet Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Monitor player balances, perform controlled adjustments, freeze
              wallets and inspect the complete coin ledger.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3a3020] bg-[#151108] px-5 text-sm font-bold text-[#f7c84b] transition hover:bg-[#1d170b] disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <WalletStatistics statistics={statistics} loading={loading} />

        <WalletFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={() => handleFiltersChange(initialFilters)}
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Player Wallets</h2>
              <p className="text-sm text-zinc-500">
                {total.toLocaleString("en-US")} wallet{total === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <WalletTable
            wallets={wallets}
            loading={loading}
            onCredit={(wallet) => openAdjustment(wallet, "credit")}
            onDebit={(wallet) => openAdjustment(wallet, "debit")}
            onToggleFreeze={toggleFreeze}
            onTransactions={setTransactionWallet}
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a30] text-zinc-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a30] text-zinc-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <WalletAdjustmentDialog
        wallet={adjustmentWallet}
        mode={adjustmentMode}
        loading={actionLoading}
        onClose={closeAdjustment}
        onSubmit={submitAdjustment}
      />

      <WalletTransactionsDrawer
        wallet={transactionWallet}
        onClose={() => setTransactionWallet(null)}
      />
    </div>
  );
}
