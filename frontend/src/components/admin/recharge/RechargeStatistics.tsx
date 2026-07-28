import {
    BadgeDollarSign,
    CirclePause,
    Coins,
    PackageCheck,
    PackageOpen,
    Sparkles,
    type LucideIcon,
} from "lucide-react";

import type { RechargePackageStatistics } from "../../../types/recharge";

interface RechargeStatisticsProps {
    statistics: RechargePackageStatistics;
}

type RechargeStatisticKey = keyof RechargePackageStatistics;

interface RechargeStatisticCard {
    key: RechargeStatisticKey;
    label: string;
    icon: LucideIcon;
    currency?: boolean;
}

const cards: RechargeStatisticCard[] = [
    {
        key: "total_packages",
        label: "Total Plans",
        icon: PackageOpen,
    },
    {
        key: "active_packages",
        label: "Active Plans",
        icon: PackageCheck,
    },
    {
        key: "inactive_packages",
        label: "Inactive Plans",
        icon: CirclePause,
    },
    {
        key: "lowest_price",
        label: "Lowest Price",
        icon: BadgeDollarSign,
        currency: true,
    },
    {
        key: "total_base_coins",
        label: "Base Coins",
        icon: Coins,
    },
    {
        key: "total_bonus_coins",
        label: "Bonus Coins",
        icon: Sparkles,
    },
];

export default function RechargeStatistics({
    statistics,
}: RechargeStatisticsProps) {
    return (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => {
                const Icon = card.icon;
                const value = statistics[card.key];

                const formattedValue = card.currency
                    ? Number(value ?? 0).toLocaleString("en-US", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                      })
                    : Number(value ?? 0).toLocaleString("en-US");

                return (
                    <article
                        key={card.key}
                        className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {card.label}
                            </p>

                            <Icon size={18} className="text-amber-400" />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-white">
                            {formattedValue}
                        </p>
                    </article>
                );
            })}
        </section>
    );
}