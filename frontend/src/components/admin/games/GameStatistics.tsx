import {
    Ban,
    CheckCircle2,
    FileEdit,
    Gamepad2,
    LayoutGrid,
    Star,
    Wrench,
} from "lucide-react";

import type { GameStatisticsResponse } from "../../../types/game";

interface GameStatisticsProps {
    statistics?: GameStatisticsResponse | null;
    loading?: boolean;
}

interface StatCardConfig {
    label: string;
    value: number;
    icon: typeof Gamepad2;
    iconClassName: string;
}

const GameStatistics = ({
    statistics,
    loading = false,
}: GameStatisticsProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-[78px] animate-pulse rounded-xl border border-yellow-500/10 bg-[#11141C]"
                    />
                ))}
            </div>
        );
    }

    const cards: StatCardConfig[] = [
        {
            label: "Total Games",
            value: statistics?.total_games ?? 0,
            icon: Gamepad2,
            iconClassName: "bg-yellow-100 text-yellow-600",
        },
        {
            label: "Published",
            value: statistics?.published_games ?? 0,
            icon: CheckCircle2,
            iconClassName: "bg-green-100 text-green-600",
        },
        {
            label: "Draft",
            value: statistics?.draft_games ?? 0,
            icon: FileEdit,
            iconClassName: "bg-gray-100 text-gray-600",
        },
        {
            label: "Maintenance",
            value: statistics?.maintenance_games ?? 0,
            icon: Wrench,
            iconClassName: "bg-orange-100 text-orange-600",
        },
        {
            label: "Disabled",
            value: statistics?.disabled_games ?? 0,
            icon: Ban,
            iconClassName: "bg-red-100 text-red-600",
        },
        {
            label: "Featured",
            value: statistics?.featured_games ?? 0,
            icon: Star,
            iconClassName: "bg-purple-100 text-purple-600",
        },
        {
            label: "On Landing Page",
            value: statistics?.landing_page_games ?? 0,
            icon: LayoutGrid,
            iconClassName: "bg-blue-100 text-blue-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="group flex items-center gap-4 rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-[#11141C] to-[#090B10] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-yellow-400/35"
                    >
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                        >
                            <Icon size={21} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-2xl font-bold leading-tight text-white">
                                {Number(card.value).toLocaleString()}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-400">
                                {card.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GameStatistics;
