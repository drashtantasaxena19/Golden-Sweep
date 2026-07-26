import {
    Bell,
    ChevronDown,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    ShieldCheck,
} from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import type { AdminProfile } from "../../../types/admin"

interface AdminNavbarProps {
    admin: AdminProfile
    sidebarCollapsed: boolean
    onOpenSidebar: () => void
    onToggleSidebar: () => void
}

const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/users": "Player Management",
    "/admin/requests": "Admin Requests",
    "/admin/wallet": "Wallet Management",
    "/admin/transactions": "Transactions",
    "/admin/games": "Game Management",
    "/admin/analytics": "Analytics",
    "/admin/audit-logs": "Audit Logs",
    "/admin/settings": "Platform Settings",
}

const AdminNavbar = ({
    admin,
    sidebarCollapsed,
    onOpenSidebar,
    onToggleSidebar,
}: AdminNavbarProps) => {
    const location = useLocation()

    const [searchOpen, setSearchOpen] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const pageTitle =
        pageTitles[location.pathname] ||
        "Administration"

    return (
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#020309]/90 backdrop-blur-xl">
            <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        aria-label="Open sidebar"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/55 transition hover:border-[#e5ae2d]/20 hover:text-[#e5ae2d] lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/45 transition hover:border-[#e5ae2d]/20 hover:text-[#e5ae2d] lg:flex"
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen size={19} />
                        ) : (
                            <PanelLeftClose size={19} />
                        )}
                    </button>

                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d8a62e]">
                            GoldenSweep Console
                        </p>

                        <h1 className="truncate text-lg font-black text-white sm:text-xl">
                            {pageTitle}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className={`relative hidden transition-all md:block ${
                            searchOpen
                                ? "w-[280px]"
                                : "w-[210px]"
                        }`}
                    >
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                        />

                        <input
                            type="search"
                            onFocus={() => setSearchOpen(true)}
                            onBlur={() => setSearchOpen(false)}
                            placeholder="Search admin console..."
                            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-10 pr-3 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-[#e5ae2d]/25"
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setNotificationOpen(current => !current)
                                setProfileOpen(false)
                            }}
                            aria-label="Notifications"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/45 transition hover:border-[#e5ae2d]/20 hover:text-[#e5ae2d]"
                        >
                            <Bell size={18} />

                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#05070d] bg-red-400" />
                        </button>

                        {notificationOpen && (
                            <div className="absolute right-0 top-12 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-[#090b13] p-3 shadow-[0_25px_80px_rgba(0,0,0,.6)]">
                                <div className="flex items-center justify-between border-b border-white/[0.07] px-2 pb-3">
                                    <p className="text-sm font-black text-white">
                                        Notifications
                                    </p>

                                    <span className="rounded-full bg-[#e5ae2d]/10 px-2 py-1 text-[9px] font-black text-[#e5ae2d]">
                                        3 NEW
                                    </span>
                                </div>

                                <div className="py-2">
                                    <Notification
                                        title="Admin request received"
                                        description="A new administrator application requires review."
                                    />

                                    <Notification
                                        title="High-value recharge"
                                        description="A new wallet recharge was completed successfully."
                                    />

                                    <Notification
                                        title="New player registered"
                                        description="A new verified player joined GoldenSweep."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setProfileOpen(current => !current)
                                setNotificationOpen(false)
                            }}
                            className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2 text-left transition hover:border-[#e5ae2d]/20"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#f6d46d] to-[#b8790f] text-[10px] font-black text-black">
                                {getInitials(admin)}
                            </span>

                            <span className="hidden min-w-0 sm:block">
                                <span className="block max-w-[120px] truncate text-[11px] font-bold text-white/80">
                                    {getAdminName(admin)}
                                </span>

                                <span className="block text-[8px] font-black uppercase tracking-wider text-[#d9a82f]">
                                    {admin.role === "super_admin"
                                        ? "Super Admin"
                                        : "Admin"}
                                </span>
                            </span>

                            <ChevronDown
                                size={14}
                                className="hidden text-white/25 sm:block"
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-12 w-60 rounded-2xl border border-white/[0.08] bg-[#090b13] p-2 shadow-[0_25px_80px_rgba(0,0,0,.6)]">
                                <div className="border-b border-white/[0.07] p-3">
                                    <p className="truncate text-sm font-bold text-white">
                                        {getAdminName(admin)}
                                    </p>

                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#d9a82f]">
                                        {admin.role === "super_admin"
                                            ? "Super Administrator"
                                            : "Administrator"}
                                    </p>
                                </div>

                                <Link
                                    to="/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <ShieldCheck size={16} />

                                    View profile
                                </Link>

                                <Link
                                    to="/admin/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    Platform settings
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

const Notification = ({
    title,
    description,
}: {
    title: string
    description: string
}) => (
    <button
        type="button"
        className="block w-full rounded-xl p-3 text-left transition hover:bg-white/[0.04]"
    >
        <p className="text-xs font-bold text-white/80">
            {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-white/35">
            {description}
        </p>
    </button>
)

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

    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join("") || "GS"
    )
}

export default AdminNavbar