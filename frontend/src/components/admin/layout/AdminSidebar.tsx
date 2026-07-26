import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    PackageOpen,
    Gamepad2,
    Gauge,
    LogOut,
    Settings,
    ShieldCheck,
    Users,
    WalletCards,
    X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import type { AdminProfile } from "../../../types/admin"
import authService from "../../../services/authService"
import { clearAuth } from "../../../services/authStorage"

interface AdminSidebarProps {
    admin: AdminProfile
    mobileOpen: boolean
    collapsed: boolean
    onClose: () => void
    onToggleCollapse: () => void
}

interface NavigationItem {
    title: string
    path: string
    icon: LucideIcon
    superAdminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
    {
        title: "Dashboard",
        path: "/admin",
        icon: Gauge,
    },
    {
        title: "Users",
        path: "/admin/users",
        icon: Users,
    },
    {
        title: "Recharge",
        path: "/admin/recharge",
        icon: PackageOpen,
    },
    {
        title: "Wallet",
        path: "/admin/wallet",
        icon: WalletCards,
    },
    {
        title: "Transactions",
        path: "/admin/transactions",
        icon: CircleDollarSign,
    },
    {
        title: "Games",
        path: "/admin/games",
        icon: Gamepad2,
    },
    {
        title: "Analytics",
        path: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "Audit Logs",
        path: "/admin/audit-logs",
        icon: ClipboardList,
        superAdminOnly: true,
    },
    {
        title: "Settings",
        path: "/admin/settings",
        icon: Settings,
    },
]

const AdminSidebar = ({
    admin,
    mobileOpen,
    collapsed,
    onClose,
    onToggleCollapse,
}: AdminSidebarProps) => {
    const navigate = useNavigate()

    const visibleNavigation = navigationItems.filter(item => {
        if (!item.superAdminOnly) return true

        return admin.role === "super_admin"
    })

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch {
            // Local logout must still happen when the server is unavailable.
        } finally {
            clearAuth()
            navigate("/login", { replace: true })
        }
    }

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close administrator menu"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07] bg-[#05070e] shadow-[20px_0_60px_rgba(0,0,0,.3)] transition-all duration-300 ${collapsed
                        ? "w-[280px] lg:w-[88px]"
                        : "w-[280px]"
                    } ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div
                    className={`flex h-[76px] items-center border-b border-white/[0.07] ${collapsed
                            ? "justify-between px-5 lg:justify-center lg:px-3"
                            : "justify-between px-5"
                        }`}
                >
                    <NavLink
                        to="/admin"
                        onClick={onClose}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f2c14e]/20 bg-[#f2c14e]/[0.07] text-[#f3c854] shadow-[0_0_25px_rgba(242,193,78,.1)]">
                            <ShieldCheck size={24} />
                        </div>

                        <div
                            className={`min-w-0 ${collapsed
                                    ? "lg:hidden"
                                    : ""
                                }`}
                        >
                            <p className="truncate text-base font-black tracking-wide text-white">
                                GoldenSweep
                            </p>

                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d9a82f]">
                                Admin Console
                            </p>
                        </div>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div
                    className={`border-b border-white/[0.07] ${collapsed
                            ? "px-3 py-4"
                            : "p-4"
                        }`}
                >
                    <div
                        className={`rounded-2xl border border-[#e5ae2d]/10 bg-[#e5ae2d]/[0.035] ${collapsed
                                ? "p-2 lg:flex lg:justify-center"
                                : "p-3"
                            }`}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f6d46d] to-[#b8790f] text-sm font-black uppercase text-black">
                                {getInitials(admin)}
                            </div>

                            <div
                                className={`min-w-0 ${collapsed
                                        ? "lg:hidden"
                                        : ""
                                    }`}
                            >
                                <p className="truncate text-sm font-bold text-white/90">
                                    {getAdminName(admin)}
                                </p>

                                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-[#e4b43f]">
                                    {admin.role === "super_admin"
                                        ? "Super Administrator"
                                        : "Administrator"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <p
                        className={`mb-3 px-3 text-[9px] font-black uppercase tracking-[0.22em] text-white/20 ${collapsed
                                ? "lg:hidden"
                                : ""
                            }`}
                    >
                        Management
                    </p>

                    <div className="space-y-1.5">
                        {visibleNavigation.map(item => {
                            const Icon = item.icon

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/admin"}
                                    onClick={onClose}
                                    title={
                                        collapsed
                                            ? item.title
                                            : undefined
                                    }
                                    className={({ isActive }) =>
                                        `group flex h-11 items-center rounded-xl border transition ${collapsed
                                            ? "justify-start gap-3 px-3 lg:justify-center lg:px-0"
                                            : "gap-3 px-3"
                                        } ${isActive
                                            ? "border-[#e5ae2d]/20 bg-gradient-to-r from-[#e5ae2d]/[0.13] to-[#e5ae2d]/[0.025] text-[#f4c853]"
                                            : "border-transparent text-white/40 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-white/80"
                                        }`
                                    }
                                >
                                    <Icon
                                        size={19}
                                        className="shrink-0"
                                    />

                                    <span
                                        className={`truncate text-sm font-semibold ${collapsed
                                                ? "lg:hidden"
                                                : ""
                                            }`}
                                    >
                                        {item.title}
                                    </span>
                                </NavLink>
                            )
                        })}
                    </div>
                </nav>

                <div className="border-t border-white/[0.07] p-3">
                    <button
                        type="button"
                        onClick={handleLogout}
                        title={collapsed ? "Logout" : undefined}
                        className={`flex h-11 w-full items-center rounded-xl border border-transparent text-red-300/65 transition hover:border-red-400/10 hover:bg-red-500/[0.06] hover:text-red-200 ${collapsed
                                ? "justify-start gap-3 px-3 lg:justify-center lg:px-0"
                                : "gap-3 px-3"
                            }`}
                    >
                        <LogOut
                            size={19}
                            className="shrink-0"
                        />

                        <span
                            className={`text-sm font-semibold ${collapsed
                                    ? "lg:hidden"
                                    : ""
                                }`}
                        >
                            Logout
                        </span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onToggleCollapse}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    className="absolute -right-3 top-[92px] hidden h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-[#0b0d15] text-white/50 shadow-xl transition hover:border-[#e5ae2d]/30 hover:text-[#e5ae2d] lg:flex"
                >
                    {collapsed ? (
                        <ChevronRight size={15} />
                    ) : (
                        <ChevronLeft size={15} />
                    )}
                </button>
            </aside>
        </>
    )
}

const getAdminName = (admin: AdminProfile) => {
    const record = admin as AdminProfile & {
        full_name?: string
        name?: string
        email?: string
    }

    return (
        record.full_name ||
        record.name ||
        record.email ||
        "GoldenSweep Admin"
    )
}

const getInitials = (admin: AdminProfile) => {
    const name = getAdminName(admin)
        .replace(/@.*$/, "")
        .trim()

    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join("")

    return initials || "GS"
}

export default AdminSidebar