import { Search } from "lucide-react";

import {
    GAME_CATEGORY_LABELS,
    GAME_CATEGORY_OPTIONS,
    GAME_STATUS_LABELS,
} from "../../../types/game";
import type {
    GameCategory,
    GameFilter,
    GameStatus,
} from "../../../types/game";

interface GameFiltersProps {
    filters: GameFilter;
    onChange: (filters: GameFilter) => void;
}

const FILTER_STATUS_OPTIONS: readonly GameStatus[] = [
    "draft",
    "published",
    "maintenance",
    "disabled",
];

const GameFilters = ({
    filters,
    onChange,
}: GameFiltersProps) => {
    const updateFilter = <K extends keyof GameFilter>(
        key: K,
        value: GameFilter[K]
    ) => {
        onChange({
            ...filters,
            [key]: value,
            page: 1,
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-4">
            <div className="relative min-w-[220px] flex-1">
                <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
                <input
                    value={filters.search ?? ""}
                    onChange={(event) =>
                        updateFilter(
                            "search",
                            event.target.value ||
                                undefined
                        )
                    }
                    placeholder="Search name, slug, or provider"
                    className="w-full rounded-xl border border-white/10 bg-[#11141C] py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-yellow-400/50"
                />
            </div>

            <select
                value={filters.status ?? ""}
                onChange={(event) =>
                    updateFilter(
                        "status",
                        (event.target.value ||
                            undefined) as
                            | GameStatus
                            | undefined
                    )
                }
                className="rounded-xl border border-white/10 bg-[#11141C] px-3 py-2.5 text-sm text-white"
            >
                <option value="">All statuses</option>
                {FILTER_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                        {GAME_STATUS_LABELS[item]}
                    </option>
                ))}
            </select>

            <select
                value={filters.category ?? ""}
                onChange={(event) =>
                    updateFilter(
                        "category",
                        (event.target.value ||
                            undefined) as
                            | GameCategory
                            | undefined
                    )
                }
                className="rounded-xl border border-white/10 bg-[#11141C] px-3 py-2.5 text-sm text-white"
            >
                <option value="">All categories</option>
                {GAME_CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                        {GAME_CATEGORY_LABELS[item]}
                    </option>
                ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                    type="checkbox"
                    checked={filters.is_featured === true}
                    onChange={(event) =>
                        updateFilter(
                            "is_featured",
                            event.target.checked
                                ? true
                                : undefined
                        )
                    }
                    className="accent-yellow-400"
                />
                Featured only
            </label>

            <button
                type="button"
                onClick={() =>
                    onChange({
                        page: 1,
                        limit: filters.limit ?? 20,
                    })
                }
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
            >
                Reset
            </button>
        </div>
    );
};

export default GameFilters;
