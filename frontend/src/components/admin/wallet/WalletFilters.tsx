import { Filter, RotateCcw, Search } from "lucide-react";
import type { WalletFilters as WalletFiltersType } from "../../../types/wallet";

interface Props {
  filters: WalletFiltersType;
  onChange: (filters: WalletFiltersType) => void;
  onReset: () => void;
}

export default function WalletFilters({ filters, onChange, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-[#26211a] bg-[#0d0d10] p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_180px_170px_170px_auto]">
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
            placeholder="Search by user ID"
            className="h-11 w-full rounded-xl border border-[#2a2a30] bg-[#08090c] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#b98b27]"
          />
        </label>

        <label className="relative">
          <Filter
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as WalletFiltersType["status"],
              })
            }
            className="h-11 w-full appearance-none rounded-xl border border-[#2a2a30] bg-[#08090c] pl-10 pr-3 text-sm text-white outline-none focus:border-[#b98b27]"
          >
            <option value="all">All wallets</option>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
          </select>
        </label>

        <input
          value={filters.minimumBalance}
          onChange={(event) =>
            onChange({ ...filters, minimumBalance: event.target.value })
          }
          type="number"
          min="0"
          placeholder="Minimum balance"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <input
          value={filters.maximumBalance}
          onChange={(event) =>
            onChange({ ...filters, maximumBalance: event.target.value })
          }
          type="number"
          min="0"
          placeholder="Maximum balance"
          className="h-11 rounded-xl border border-[#2a2a30] bg-[#08090c] px-4 text-sm text-white outline-none focus:border-[#b98b27]"
        />

        <button
          onClick={onReset}
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2a2a30] px-4 text-sm font-semibold text-zinc-300 transition hover:border-[#4b3914] hover:text-[#f7c84b]"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
