import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import TransactionBreakdown from "../../components/admin/transactions/TransactionBreakdown";
import TransactionDetailsDrawer from "../../components/admin/transactions/TransactionDetailsDrawer";
import TransactionFilters from "../../components/admin/transactions/TransactionFilters";
import TransactionStatistics from "../../components/admin/transactions/TransactionStatistics";
import TransactionTable from "../../components/admin/transactions/TransactionTable";
import TransactionTrend from "../../components/admin/transactions/TransactionTrend";
import transactionService from "../../services/transactionService";
import type {
  Transaction,
  TransactionBreakdownItem,
  TransactionDailyTrendItem,
  TransactionFilters as Filters,
  TransactionStatistics as Statistics,
} from "../../types/transaction";

const initialFilters: Filters = {
  search: "",
  transactionType: "",
  minimumAmount: "",
  maximumAmount: "",
  startDate: "",
  endDate: "",
};

export default function Transactions() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [breakdown, setBreakdown] = useState<TransactionBreakdownItem[]>([]);
  const [trend, setTrend] = useState<TransactionDailyTrendItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [listResponse, statsResponse, breakdownResponse, trendResponse] =
        await Promise.all([
          transactionService.getTransactions(filters, page, limit),
          transactionService.getStatistics(filters.startDate, filters.endDate),
          transactionService.getBreakdown(filters.startDate, filters.endDate),
          transactionService.getDailyTrend(filters.startDate, filters.endDate),
        ]);

      setTransactions(listResponse.transactions);
      setTotal(listResponse.total);
      setStatistics(statsResponse);
      setBreakdown(breakdownResponse.items);
      setTrend(trendResponse.items);
      setMessage(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load transaction data.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const updateFilters = (next: Filters) => {
    setPage(1);
    setFilters(next);
  };

  return (
    <div className="min-h-full bg-[#05060a] px-5 py-6 text-white lg:px-7">
      {message && (
        <div className="fixed right-5 top-20 z-[70] max-w-md rounded-xl border border-red-500/30 bg-red-950 px-4 py-3 text-sm font-medium text-red-300 shadow-2xl">
          {message}
        </div>
      )}

      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#f7c84b]">
              <ReceiptText size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Immutable Ledger
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Review every Gold Coin movement across purchases, game entries,
              refunds and administrative wallet adjustments.
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

        <TransactionStatistics statistics={statistics} loading={loading} />

        <div className="grid gap-6 xl:grid-cols-2">
          <TransactionTrend items={trend} loading={loading} />
          <TransactionBreakdown items={breakdown} loading={loading} />
        </div>

        <TransactionFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => updateFilters(initialFilters)}
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Transaction Ledger</h2>
              <p className="text-sm text-zinc-500">
                {total.toLocaleString("en-US")} transaction
                {total === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <TransactionTable
            transactions={transactions}
            loading={loading}
            onView={setSelectedTransaction}
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

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
