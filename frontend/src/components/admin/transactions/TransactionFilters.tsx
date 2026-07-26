import { Filter, RotateCcw, Search } from "lucide-react";
import type { TransactionFilters as Filters } from "../../../types/transaction";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export default function TransactionFilters({
  filters,
  onChange,
  onReset,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_190px_155px_155px_155px_155px_auto]">
        <label className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder="Search user, wallet, reference or reason"
            className="h-11 w-full rounded-xl border border-[#2a2a30] bg-[#08090c] pl-10 pr-4 text-sm text-white outline-none focus:border-[#b98b27]"
          />
        </label>

        <label className="relative">
          <Filter
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <select
            value={filters.transactionType}
            onChange={(event) =>
              onChange({
                ...filters,
                transactionType:
                  event.target.value as Filters["transactionType"],
              })
            }
            className="h-11 w-full appearance-none rounded-xl border border-[#2a2a30] bg-[#08090c] pl-10 pr-3 text-sm text-white outline-none focus:border-[#b98b27]"
          >
            <option value="">All transaction types</option>
            <option value="purchase">Purchase</option>
            <option value="game_entry">Game Entry</option>
            <option value="admin_credit">Admin Credit</option>
            <option value="admin_debit">Admin Debit</option>
            <option value="refund">Refund</option>
          </select>
        </label>

        <input
          value={filters.minimumAmount}
          onChange={(event) =>
            onChange({ ...filters, minimumAmount: event.target.value })
          }
          type="number"
          min="0"
          placeholder="Min amount"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <input
          value={filters.maximumAmount}
          onChange={(event) =>
            onChange({ ...filters, maximumAmount: event.target.value })
          }
          type="number"
          min="0"
          placeholder="Max amount"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <input
          value={filters.startDate}
          onChange={(event) =>
            onChange({ ...filters, startDate: event.target.value })
          }
          type="date"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <input
          value={filters.endDate}
          onChange={(event) =>
            onChange({ ...filters, endDate: event.target.value })
          }
          type="date"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <button
          onClick={onReset}
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2a2a30] px-4 text-sm font-semibold text-zinc-300 hover:border-[#4b3914] hover:text-[#f7c84b]"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
