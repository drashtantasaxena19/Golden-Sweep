import { RotateCcw, Search } from "lucide-react";

import type { RechargeFilters as RechargeFilterValues } from "../../../types/recharge";

interface RechargeFiltersProps {
    value: RechargeFilterValues;
    loading: boolean;
    onChange: (value: RechargeFilterValues) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function RechargeFilters({
    value,
    loading,
    onChange,
    onApply,
    onReset,
}: RechargeFiltersProps) {
    return (
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="grid gap-3 md:grid-cols-4">
                <label className="md:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Search
                    </span>
                    <input
                        value={value.search}
                        onChange={(event) =>
                            onChange({ ...value, search: event.target.value })
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") onApply();
                        }}
                        placeholder="Plan name, badge or description"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50"
                    />
                </label>

                <label>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Status
                    </span>
                    <select
                        value={value.status}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                status: event.target.value as RechargeFilterValues["status"],
                            })
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>

                <label>
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Currency
                    </span>
                    <input
                        value={value.currency}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                currency: event.target.value.toUpperCase(),
                            })
                        }
                        maxLength={3}
                        placeholder="INR"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm uppercase text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50"
                    />
                </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onReset}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                    <RotateCcw size={16} />
                    Reset
                </button>

                <button
                    type="button"
                    onClick={onApply}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                >
                    <Search size={16} />
                    Apply Filters
                </button>
            </div>
        </section>
    );
}
