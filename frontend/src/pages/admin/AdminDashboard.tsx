import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    CircleDollarSign,
    Clock3,
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

import type {
    AdminDashboardStats,
} from "../../types/admin"


interface StatCardProps {
    title: string
    value: string
    change: string
    positive?: boolean
    icon: React.ReactNode
}


interface RecentActivityItem {
    title: string
    description: string
    time: string
    icon: React.ReactNode
}


interface TopGameItem {
    name: string
    players: string
    revenue: string
    percentage: number
}


const revenueChartData = [
    42,
    58,
    49,
    71,
    65,
    83,
    61,
    74,
    92,
    78,
    88,
    96,
]


const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]


const topGames: TopGameItem[] = [
    {
        name: "Golden Roulette",
        players: "3,420",
        revenue: "$84,620",
        percentage: 86,
    },
    {
        name: "Royal Slots",
        players: "2,780",
        revenue: "$62,180",
        percentage: 72,
    },
    {
        name: "Lucky Spin",
        players: "1,940",
        revenue: "$41,760",
        percentage: 58,
    },
    {
        name: "Golden Cards",
        players: "1,260",
        revenue: "$25,840",
        percentage: 42,
    },
]


const formatNumber = (
    value: number,
): string => {
    return new Intl.NumberFormat(
        "en-US",
    ).format(value)
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


const AdminDashboard = () => {
    const navigate = useNavigate()

    const [
        dashboard,
        setDashboard,
    ] = useState<AdminDashboardStats | null>(
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

            try {
                const response =
                    await adminService
                        .getDashboardStats()

                setDashboard(response)
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Unable to load dashboard statistics.",
                )
            } finally {
                setIsLoading(false)
            }
        },
        [],
    )

    useEffect(() => {
        void loadDashboard()
    }, [loadDashboard])

    const stats = useMemo<
        StatCardProps[]
    >(() => {
        if (!dashboard) {
            return []
        }

        const {
            users,
            administrators,
            wallet,
            growth,
        } = dashboard

        return [
            {
                title: "Total Players",
                value: formatNumber(
                    users.total,
                ),
                change: `${formatNumber(
                    growth.new_users_this_month,
                )} this month`,
                positive: true,
                icon: <Users size={21} />,
            },
            {
                title: "Active Players",
                value: formatNumber(
                    users.active,
                ),
                change: `${users.active_user_rate.toFixed(
                    1,
                )}% active`,
                positive: true,
                icon: (
                    <UserCheck size={21} />
                ),
            },
            {
                title: "Verified Players",
                value: formatNumber(
                    users.verified,
                ),
                change: `${users.verification_rate.toFixed(
                    1,
                )}% verified`,
                positive: true,
                icon: (
                    <ShieldCheck size={21} />
                ),
            },
            {
                title: "Wallet Balance",
                value: `${formatNumber(
                    wallet.total_balance,
                )} ${wallet.currency}`,
                change: "Live wallet total",
                positive: true,
                icon: (
                    <WalletCards size={21} />
                ),
            },
            {
                title: "Administrators",
                value: formatNumber(
                    administrators.total_admins +
                        administrators
                            .total_super_admins,
                ),
                change: `${
                    administrators
                        .total_super_admins
                } super admin`,
                positive: true,
                icon: (
                    <ShieldCheck size={21} />
                ),
            },
            {
                title: "Pending Requests",
                value: formatNumber(
                    administrators
                        .pending_requests,
                ),
                change: "Needs review",
                positive:
                    administrators
                        .pending_requests === 0,
                icon: <Clock3 size={21} />,
            },
        ]
    }, [dashboard])

    const recentActivity = useMemo<
        RecentActivityItem[]
    >(() => {
        if (!dashboard) {
            return []
        }

        const {
            users,
            administrators,
            growth,
        } = dashboard

        const activity: RecentActivityItem[] =
            []

        if (growth.new_users_today > 0) {
            activity.push({
                title:
                    "New players registered",
                description: `${formatNumber(
                    growth.new_users_today,
                )} new player account(s) were created today.`,
                time: "Today",
                icon: <Users size={17} />,
            })
        }

        if (
            administrators.pending_requests >
            0
        ) {
            activity.push({
                title:
                    "Admin requests pending",
                description: `${formatNumber(
                    administrators
                        .pending_requests,
                )} administrator request(s) require review.`,
                time: "Needs attention",
                icon: (
                    <ShieldCheck size={17} />
                ),
            })
        }

        if (users.unverified > 0) {
            activity.push({
                title:
                    "Unverified player accounts",
                description: `${formatNumber(
                    users.unverified,
                )} player account(s) have not verified their email.`,
                time: "Current status",
                icon: (
                    <AlertCircle size={17} />
                ),
            })
        }

        activity.push({
            title:
                "Dashboard statistics updated",
            description:
                "Live player, wallet and administrator statistics were fetched successfully.",
            time: formatDateTime(
                dashboard.generated_at,
            ),
            icon: <Activity size={17} />,
        })

        return activity.slice(0, 4)
    }, [dashboard])

    if (isLoading && !dashboard) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020309] px-5 text-white">
                <div className="text-center">
                    <LoaderCircle
                        size={42}
                        className="mx-auto animate-spin text-[#e7b23c]"
                    />

                    <p className="mt-4 text-sm font-bold text-white/45">
                        Loading GoldenSweep
                        dashboard...
                    </p>
                </div>
            </main>
        )
    }

    if (error && !dashboard) {
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

    if (!dashboard) {
        return null
    }

    return (
        <main className="min-h-screen bg-[#020309] px-5 py-6 text-white lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <section className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#e7b23c]">
                            <Activity size={15} />

                            GoldenSweep Control Center
                        </div>

                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Admin Dashboard
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                            Monitor players, wallet
                            activity, platform revenue,
                            games and administrative
                            operations.
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
                                    "/admin/reports",
                                )
                            }
                            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] px-5 text-xs font-black text-black transition hover:scale-[1.02]"
                        >
                            VIEW REPORTS
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
                            statistics. Showing the last
                            loaded data. {error}
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
                                    Platform earnings
                                </h2>
                            </div>

                            <select
                                defaultValue="30"
                                className="h-10 rounded-xl border border-white/[0.08] bg-black/30 px-3 text-xs font-bold text-white/55 outline-none"
                            >
                                <option value="7">
                                    Last 7 days
                                </option>

                                <option value="30">
                                    Last 30 days
                                </option>

                                <option value="90">
                                    Last 90 days
                                </option>
                            </select>
                        </div>

                        <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] px-4 py-3">
                            <p className="text-xs leading-5 text-amber-100/55">
                                Revenue and transaction
                                APIs are not connected yet.
                                The chart below currently
                                displays dashboard preview
                                data.
                            </p>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <Metric
                                label="Gross Revenue"
                                value="$248,920"
                                change="+12.6%"
                                positive
                            />

                            <Metric
                                label="Player Deposits"
                                value="$186,440"
                                change="+9.2%"
                                positive
                            />

                            <Metric
                                label="Payouts"
                                value="$82,310"
                                change="-3.4%"
                            />
                        </div>

                        <div className="mt-7 flex h-[270px] items-end gap-2 rounded-2xl border border-white/[0.05] bg-black/20 px-4 pb-4 pt-8">
                            {revenueChartData.map(
                                (
                                    height,
                                    index,
                                ) => (
                                    <div
                                        key={`${height}-${index}`}
                                        className="group relative flex h-full flex-1 items-end"
                                    >
                                        <div
                                            style={{
                                                height: `${height}%`,
                                            }}
                                            className="w-full rounded-t-md bg-gradient-to-t from-[#9c630c] via-[#e1a82e] to-[#ffe58b] opacity-80 transition group-hover:opacity-100"
                                        />

                                        <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                                            ${height}K
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-6 gap-2 text-center text-[9px] font-bold uppercase tracking-wider text-white/20 sm:grid-cols-12">
                            {months.map(month => (
                                <span key={month}>
                                    {month}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#070912] p-5 shadow-[0_18px_50px_rgba(0,0,0,.28)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e7b23c]">
                                    Live Activity
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    Recent events
                                </h2>
                            </div>

                            <Activity
                                size={22}
                                className="text-[#e7b23c]"
                            />
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentActivity.map(
                                activity => (
                                    <article
                                        key={`${activity.title}-${activity.time}`}
                                        className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition hover:border-[#e7b23c]/20 hover:bg-[#e7b23c]/[0.035]"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7b23c]/15 bg-[#e7b23c]/[0.06] text-[#f2c75d]">
                                            {
                                                activity.icon
                                            }
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-white/85">
                                                {
                                                    activity.title
                                                }
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-white/35">
                                                {
                                                    activity.description
                                                }
                                            </p>

                                            <p className="mt-1.5 text-[10px] font-semibold text-[#e7b23c]/60">
                                                {
                                                    activity.time
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

                        <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] px-4 py-3">
                            <p className="text-xs leading-5 text-amber-100/55">
                                Game analytics are
                                currently preview data
                                until the games collection
                                and analytics API are
                                connected.
                            </p>
                        </div>

                        <div className="mt-5 space-y-4">
                            {topGames.map(game => (
                                <div
                                    key={game.name}
                                    className="rounded-xl border border-white/[0.06] bg-black/20 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-white/85">
                                                {
                                                    game.name
                                                }
                                            </h3>

                                            <p className="mt-1 text-xs text-white/35">
                                                {
                                                    game.players
                                                }{" "}
                                                active
                                                players
                                            </p>
                                        </div>

                                        <p className="text-sm font-black text-[#f0c34f]">
                                            {
                                                game.revenue
                                            }
                                        </p>
                                    </div>

                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                        <div
                                            style={{
                                                width: `${game.percentage}%`,
                                            }}
                                            className="h-full rounded-full bg-gradient-to-r from-[#a86b0d] via-[#e2ad32] to-[#ffe687]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                description="View accounts, statuses and profiles."
                                icon={
                                    <Users
                                        size={19}
                                    />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/users",
                                    )
                                }
                            />

                            <QuickAction
                                title="Review Admin Requests"
                                description="Approve or reject pending applications."
                                icon={
                                    <ShieldCheck
                                        size={19}
                                    />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/requests",
                                    )
                                }
                            />

                            <QuickAction
                                title="Monitor Transactions"
                                description="Inspect recharge and wallet activity."
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
                                description="Configure supported gaming worlds."
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
                        GoldenSweep account data.
                    </span>

                    <span>
                        Last updated:{" "}
                        {formatDateTime(
                            dashboard.generated_at,
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
                    className={`flex items-center gap-1 text-[10px] font-black ${
                        positive
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
    positive = false,
}: {
    label: string
    value: string
    change: string
    positive?: boolean
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
                className={`mt-1 text-xs font-bold ${
                    positive
                        ? "text-emerald-300"
                        : "text-orange-300"
                }`}
            >
                {change}
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