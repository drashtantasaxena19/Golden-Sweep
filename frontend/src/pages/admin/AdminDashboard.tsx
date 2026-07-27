import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    CircleDollarSign,
    Gamepad2,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    TrendingUp,
    UserCheck,
    Users,
    WalletCards,
} from "lucide-react"
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import { useNavigate } from "react-router-dom"

import adminService from "../../services/adminService"
import analyticsService, {
    type AnalyticsDashboardData,
} from "../../services/analyticsService"

import type {
    AdminDashboardStats,
} from "../../types/admin"
import type {
    AnalyticsGranularity,
    GamePerformanceItem,
} from "../../types/analytics"


interface StatCardProps {
    title: string
    value: string
    change: string
    positive?: boolean
    icon: React.ReactNode
}


interface SnapshotItem {
    title: string
    description: string
    time: string
    icon: React.ReactNode
}


type DashboardPeriod = 7 | 30 | 90


interface DashboardRange {
    startDate: Date
    endDate: Date
    granularity: AnalyticsGranularity
}


const formatNumber = (
    value: number,
    maximumFractionDigits = 0,
): string => {
    return new Intl.NumberFormat(
        "en-US",
        {
            maximumFractionDigits,
        },
    ).format(
        Number.isFinite(value)
            ? value
            : 0,
    )
}


const formatPercentage = (
    value: number,
): string => {
    return `${formatNumber(value, 1)}%`
}


const formatDateTime = (
    value: string,
): string => {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return "Not available"
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short",
        },
    ).format(date)
}


const buildRange = (
    period: DashboardPeriod,
): DashboardRange => {
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(endDate)
    startDate.setDate(
        startDate.getDate() - (period - 1),
    )
    startDate.setHours(0, 0, 0, 0)

    return {
        startDate,
        endDate,
        granularity:
            period <= 30
                ? "day"
                : "week",
    }
}


const safeChartMaximum = (
    values: number[],
): number => {
    return Math.max(
        1,
        ...values.map(value =>
            Number.isFinite(value)
                ? Math.max(0, value)
                : 0,
        ),
    )
}


const AdminDashboard = () => {
    const navigate = useNavigate()

    const [
        period,
        setPeriod,
    ] = useState<DashboardPeriod>(30)

    const [
        dashboard,
        setDashboard,
    ] = useState<AdminDashboardStats | null>(
        null,
    )

    const [
        analytics,
        setAnalytics,
    ] = useState<AnalyticsDashboardData | null>(
        null,
    )

    const [
        isLoading,
        setIsLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState<string | null>(null)

    const loadDashboard = useCallback(
        async () => {
            setIsLoading(true)
            setError(null)

            const range = buildRange(period)

            try {
                const [
                    dashboardResponse,
                    analyticsResponse,
                ] = await Promise.all([
                    adminService.getDashboardStats(),
                    analyticsService.getDashboard(
                        range,
                        5,
                    ),
                ])

                setDashboard(dashboardResponse)
                setAnalytics(analyticsResponse)
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to load dashboard data.",
                )
            } finally {
                setIsLoading(false)
            }
        },
        [period],
    )

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard])

    const stats = useMemo<
        StatCardProps[]
    >(() => {
        if (!dashboard || !analytics) {
            return []
        }

        const {
            administrators,
        } = dashboard

        const overview =
            analytics.overview

        return [
            {
                title: "Total Players",
                value: formatNumber(
                    overview.users.total_players,
                ),
                change: `${formatNumber(
                    overview.users.new_users_in_range,
                )} new in period`,
                positive:
                    overview.users
                        .growth_percentage >= 0,
                icon: <Users size={21} />,
            },
            {
                title: "Active Users",
                value: formatNumber(
                    overview.users.active_users,
                ),
                change: `${formatPercentage(
                    overview.kpis.active_user_rate,
                )} active`,
                positive:
                    overview.kpis
                        .active_user_rate > 0,
                icon: (
                    <UserCheck size={21} />
                ),
            },
            {
                title: "Verified Users",
                value: formatNumber(
                    overview.users.verified_users,
                ),
                change: `${formatPercentage(
                    overview.kpis
                        .verified_user_rate,
                )} verified`,
                positive:
                    overview.kpis
                        .verified_user_rate > 0,
                icon: (
                    <ShieldCheck size={21} />
                ),
            },
            {
                title: "Coins in Circulation",
                value: formatNumber(
                    overview.wallet
                        .total_coins_in_circulation,
                ),
                change: `${formatNumber(
                    overview.wallet.active_wallets,
                )} active wallets`,
                positive: true,
                icon: (
                    <WalletCards size={21} />
                ),
            },
            {
                title: "Transactions",
                value: formatNumber(
                    overview.transactions
                        .total_transactions,
                ),
                change: `${formatNumber(
                    overview.transactions
                        .transactions_today,
                )} today`,
                positive:
                    overview.transactions
                        .total_transactions > 0,
                icon: (
                    <CircleDollarSign
                        size={21}
                    />
                ),
            },
            {
                title: "Administrators",
                value: formatNumber(
                    administrators.total_admins +
                    administrators
                        .total_super_admins,
                ),
                change: `${formatNumber(
                    administrators
                        .pending_requests,
                )} pending`,
                positive:
                    administrators
                        .pending_requests === 0,
                icon: (
                    <ShieldCheck size={21} />
                ),
            },
        ]
    }, [analytics, dashboard])

    const snapshots = useMemo<
        SnapshotItem[]
    >(() => {
        if (!dashboard || !analytics) {
            return []
        }

        const overview =
            analytics.overview

        const items: SnapshotItem[] = [
            {
                title:
                    "Player registrations",
                description: `${formatNumber(
                    overview.users
                        .new_users_in_range,
                )} player account(s) were created during the selected period.`,
                time: `${period}-day window`,
                icon: <Users size={17} />,
            },
            {
                title:
                    "Wallet circulation",
                description: `${formatNumber(
                    overview.wallet
                        .total_coins_in_circulation,
                )} coins are currently held across ${formatNumber(
                    overview.wallet
                        .total_wallets,
                )} wallet(s).`,
                time: "Live snapshot",
                icon: (
                    <WalletCards size={17} />
                ),
            },
            {
                title:
                    "Transaction activity",
                description: `${formatNumber(
                    overview.transactions
                        .total_transactions,
                )} transaction(s) moved ${formatNumber(
                    overview.transactions
                        .total_credited_coins,
                )} credited and ${formatNumber(
                    overview.transactions
                        .total_debited_coins,
                )} debited coins.`,
                time: `${period}-day window`,
                icon: (
                    <TrendingUp size={17} />
                ),
            },
            {
                title:
                    "Dashboard refreshed",
                description:
                    "Player, wallet, transaction, revenue, and game analytics were loaded from the live GoldenSweep database.",
                time: formatDateTime(
                    overview.generated_at,
                ),
                icon: <Activity size={17} />,
            },
        ]

        if (
            dashboard.administrators
                .pending_requests > 0
        ) {
            items.unshift({
                title:
                    "Admin requests need review",
                description: `${formatNumber(
                    dashboard.administrators
                        .pending_requests,
                )} administrator request(s) are currently pending.`,
                time: "Needs attention",
                icon: (
                    <AlertCircle size={17} />
                ),
            })
        }

        return items.slice(0, 4)
    }, [analytics, dashboard, period])

    const revenueTrend = useMemo(
        () =>
            analytics?.revenue
                .revenue_trend ?? [],
        [analytics],
    )

    const revenueMaximum = useMemo(
        () =>
            safeChartMaximum(
                revenueTrend.map(
                    point => point.value,
                ),
            ),
        [revenueTrend],
    )

    const topGames = useMemo<
        GamePerformanceItem[]
    >(
        () =>
            analytics?.games.top_games ??
            [],
        [analytics],
    )

    if (
        isLoading &&
        (!dashboard || !analytics)
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020309] px-5 text-white">
                <div className="text-center">
                    <LoaderCircle
                        size={42}
                        className="mx-auto animate-spin text-[#e7b23c]"
                    />

                    <p className="mt-4 text-sm font-bold text-white/45">
                        Loading live GoldenSweep
                        dashboard...
                    </p>
                </div>
            </main>
        )
    }

    if (
        error &&
        (!dashboard || !analytics)
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020309] px-5 text-white">
                <div className="w-full max-w-lg rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-8 text-center">
                    <AlertCircle
                        size={42}
                        className="mx-auto text-red-300"
                    />

                    <h1 className="mt-4 text-xl font-black">
                        Dashboard unavailable
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-white/45">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            void loadDashboard()
                        }}
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] px-5 text-xs font-black text-black"
                    >
                        <RefreshCw size={16} />
                        RETRY
                    </button>
                </div>
            </main>
        )
    }

    if (!dashboard || !analytics) {
        return null
    }

    const {
        overview,
        revenue,
        games,
    } = analytics

    return (
        <main className="min-h-screen bg-[#020309] px-5 py-6 text-white lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <section className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#e7b23c]">
                            <Activity size={15} />
                            GoldenSweep Control
                            Center
                        </div>

                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Admin Dashboard
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                            Live player, wallet,
                            transaction, revenue, and
                            game intelligence from the
                            GoldenSweep database.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.8)]" />

                                <span className="text-xs font-bold text-emerald-200">
                                    Platform Operational
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                void loadDashboard()
                            }}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-xs font-black text-white/70 transition hover:border-[#e7b23c]/25 hover:text-[#f2c75d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    isLoading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                            REFRESH
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/analytics",
                                )
                            }
                            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] px-5 text-xs font-black text-black transition hover:scale-[1.02]"
                        >
                            VIEW ANALYTICS
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
                        <AlertCircle
                            size={18}
                            className="shrink-0 text-amber-300"
                        />

                        <p className="text-xs text-amber-100/70">
                            Unable to refresh the latest
                            information. Showing the last
                            successfully loaded data.{" "}
                            {error}
                        </p>
                    </div>
                )}

                <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {stats.map(stat => (
                        <StatCard
                            key={stat.title}
                            {...stat}
                        />
                    ))}
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#070912] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7b23c]">
                                    Revenue Overview
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    Live coin movement
                                </h2>
                            </div>

                            <select
                                value={period}
                                onChange={event =>
                                    setPeriod(
                                        Number(
                                            event.target
                                                .value,
                                        ) as DashboardPeriod,
                                    )
                                }
                                className="h-10 rounded-xl border border-white/[0.08] bg-black/30 px-3 text-xs font-bold text-white/55 outline-none"
                            >
                                <option value={7}>
                                    Last 7 days
                                </option>
                                <option value={30}>
                                    Last 30 days
                                </option>
                                <option value={90}>
                                    Last 90 days
                                </option>
                            </select>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <Metric
                                label="Credited Coins"
                                value={formatNumber(
                                    revenue.summary
                                        .total_credited_coins,
                                )}
                                change={formatPercentage(
                                    revenue.summary
                                        .growth_percentage,
                                )}
                                positive={
                                    revenue.summary
                                        .growth_percentage >=
                                    0
                                }
                            />

                            <Metric
                                label="Debited Coins"
                                value={formatNumber(
                                    revenue.summary
                                        .total_debited_coins,
                                )}
                                change={`${formatNumber(
                                    revenue.summary
                                        .average_debit_amount,
                                    2,
                                )} average`}
                                positive={false}
                            />

                            <Metric
                                label="Net Coin Flow"
                                value={formatNumber(
                                    revenue.summary
                                        .net_coin_flow,
                                )}
                                change={`${formatNumber(
                                    revenue.summary
                                        .average_revenue_per_user,
                                    2,
                                )} per user`}
                                positive={
                                    revenue.summary
                                        .net_coin_flow >= 0
                                }
                            />
                        </div>

                        {revenueTrend.length ? (
                            <>
                                <div className="mt-7 flex h-[270px] items-end gap-2 rounded-2xl border border-white/[0.05] bg-black/20 px-4 pb-4 pt-8">
                                    {revenueTrend.map(
                                        (
                                            point,
                                            index,
                                        ) => {
                                            const height =
                                                Math.max(
                                                    2,
                                                    (Math.max(
                                                        0,
                                                        point.value,
                                                    ) /
                                                        revenueMaximum) *
                                                    100,
                                                )

                                            return (
                                                <div
                                                    key={`${point.date}-${index}`}
                                                    className="group relative flex h-full min-w-0 flex-1 items-end"
                                                >
                                                    <div
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        className="w-full rounded-t-md bg-gradient-to-t from-[#9c630c] via-[#e1a82e] to-[#ffe58b] opacity-80 transition group-hover:opacity-100"
                                                    />

                                                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                                                        {formatNumber(
                                                            point.value,
                                                        )}{" "}
                                                        coins
                                                    </span>
                                                </div>
                                            )
                                        },
                                    )}
                                </div>

                                <div
                                    className="mt-3 grid gap-2 text-center text-[9px] font-bold uppercase tracking-wider text-white/20"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.min(
                                            revenueTrend.length,
                                            12,
                                        )}, minmax(0, 1fr))`,
                                    }}
                                >
                                    {revenueTrend
                                        .slice(-12)
                                        .map(point => (
                                            <span
                                                key={`${point.date}-${point.label}`}
                                                className="truncate"
                                            >
                                                {
                                                    point.label
                                                }
                                            </span>
                                        ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState message="No revenue movement was recorded for this period." />
                        )}
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#070912] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7b23c]">
                                    Live Snapshot
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    Current platform state
                                </h2>
                            </div>

                            <Activity
                                size={22}
                                className="text-[#e7b23c]"
                            />
                        </div>

                        <div className="mt-5 space-y-3">
                            {snapshots.map(
                                item => (
                                    <article
                                        key={`${item.title}-${item.time}`}
                                        className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition hover:border-[#e7b23c]/20 hover:bg-[#e7b23c]/[0.035]"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7b23c]/15 bg-[#e7b23c]/[0.06] text-[#f2c75d]">
                                            {
                                                item.icon
                                            }
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-white/85">
                                                {
                                                    item.title
                                                }
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-white/35">
                                                {
                                                    item.description
                                                }
                                            </p>

                                            <p className="mt-1.5 text-[10px] font-semibold text-[#e7b23c]/60">
                                                {
                                                    item.time
                                                }
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#070912] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7b23c]">
                                    Game Performance
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    Top performing games
                                </h2>
                            </div>

                            <Gamepad2
                                size={22}
                                className="text-[#e7b23c]"
                            />
                        </div>

                        {topGames.length ? (
                            <div className="mt-5 space-y-4">
                                {topGames.map(game => (
                                    <GamePerformanceCard
                                        key={
                                            game.game_id
                                        }
                                        game={game}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No game plays were recorded for this period." />
                        )}
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#070912] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7b23c]">
                            Quick Actions
                        </p>

                        <h2 className="mt-1 text-xl font-black">
                            Administration
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <QuickAction
                                title="Manage Players"
                                description={`${formatNumber(
                                    overview.users
                                        .total_players,
                                )} players currently registered.`}
                                icon={
                                    <Users size={19} />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/users",
                                    )
                                }
                            />

                            <QuickAction
                                title="Manage Coin Packages"
                                description="Create and manage recharge packages, pricing, and bonus coin offers."
                                icon={<ShieldCheck size={19} />}
                                onClick={() => navigate("/admin/recharge")}
                            />

                            <QuickAction
                                title="Monitor Transactions"
                                description={`${formatNumber(
                                    overview
                                        .transactions
                                        .total_transactions,
                                )} transaction(s) in the selected period.`}
                                icon={
                                    <WalletCards
                                        size={19}
                                    />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/transactions",
                                    )
                                }
                            />

                            <QuickAction
                                title="Manage Games"
                                description={`${formatNumber(
                                    games.summary
                                        .published_games,
                                )} of ${formatNumber(
                                    games.summary
                                        .total_games,
                                )} games are published.`}
                                icon={
                                    <Gamepad2
                                        size={19}
                                    />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/games",
                                    )
                                }
                            />
                        </div>
                    </div>
                </section>

                <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.06] py-5 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Dashboard generated from live
                        GoldenSweep database analytics.
                    </span>

                    <span>
                        Last updated:{" "}
                        {formatDateTime(
                            overview.generated_at,
                        )}
                    </span>
                </footer>
            </div>
        </main>
    )
}


const StatCard = ({
    title,
    value,
    change,
    positive,
    icon,
}: StatCardProps) => {
    return (
        <article className="rounded-2xl border border-white/[0.07] bg-[#070912] p-4 shadow-[0_12px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-[#e7b23c]/20">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7b23c]/15 bg-[#e7b23c]/[0.06] text-[#efc24e]">
                    {icon}
                </div>

                <span
                    className={`flex items-center gap-1 text-[10px] font-black ${positive
                            ? "text-emerald-300"
                            : "text-orange-300"
                        }`}
                >
                    {positive ? (
                        <ArrowUpRight
                            size={13}
                        />
                    ) : (
                        <ArrowDownRight
                            size={13}
                        />
                    )}

                    {change}
                </span>
            </div>

            <p className="mt-5 text-2xl font-black tracking-tight text-white">
                {value}
            </p>

            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.11em] text-white/30">
                {title}
            </p>
        </article>
    )
}


const Metric = ({
    label,
    value,
    change,
    positive,
}: {
    label: string
    value: string
    change: string
    positive: boolean
}) => {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                {label}
            </p>

            <p className="mt-2 text-xl font-black text-white">
                {value}
            </p>

            <p
                className={`mt-1 text-xs font-bold ${positive
                        ? "text-emerald-300"
                        : "text-orange-300"
                    }`}
            >
                {change}
            </p>
        </div>
    )
}


const GamePerformanceCard = ({
    game,
}: {
    game: GamePerformanceItem
}) => {
    const percentage = Math.min(
        Math.max(
            game.percentage_of_total_plays,
            0,
        ),
        100,
    )

    return (
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white/85">
                        {game.name}
                    </h3>

                    <p className="mt-1 text-xs capitalize text-white/35">
                        {game.category}
                        {" · "}
                        {game.provider_name ||
                            "Internal"}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-[#f0c34f]">
                        {formatNumber(
                            game.play_count,
                        )}{" "}
                        plays
                    </p>

                    <p className="mt-1 text-[10px] text-white/30">
                        {formatPercentage(
                            game.percentage_of_total_plays,
                        )}{" "}
                        share
                    </p>
                </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    style={{
                        width: `${percentage}%`,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#a86b0d] via-[#e2ad32] to-[#ffe687]"
                />
            </div>
        </div>
    )
}


const EmptyState = ({
    message,
}: {
    message: string
}) => {
    return (
        <div className="mt-5 rounded-xl border border-dashed border-white/[0.08] bg-black/20 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-white/35">
                {message}
            </p>
        </div>
    )
}


const QuickAction = ({
    title,
    description,
    icon,
    onClick,
}: {
    title: string
    description: string
    icon: React.ReactNode
    onClick: () => void
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-[#e7b23c]/20 hover:bg-[#e7b23c]/[0.04]"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7b23c]/15 bg-[#e7b23c]/[0.06] text-[#efc24e]">
                {icon}
            </span>

            <span className="min-w-0">
                <span className="block text-sm font-bold text-white/85">
                    {title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-white/35">
                    {description}
                </span>
            </span>
        </button>
    )
}


export default AdminDashboard