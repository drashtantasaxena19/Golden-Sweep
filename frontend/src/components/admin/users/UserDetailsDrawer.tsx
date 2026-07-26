import { useEffect } from "react";
import type { UserSummary } from "../../../types/userManagement";

interface UserDetailsDrawerProps {
    open: boolean;
    user: UserSummary | null;
    onClose: () => void;
    onEditRole?: (user: UserSummary) => void;
    onManageWallet?: (user: UserSummary) => void;
    onDelete?: (user: UserSummary) => void;
    onToggleStatus?: (user: UserSummary) => void;
}

const formatLabel = (value?: string | null) => {
    if (!value) return "Not available";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value?: string | null) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatWallet = (user: UserSummary) => {
    const currency = user.wallet_currency || "GC";
    const balance = Number(user.wallet_balance ?? 0);

    return `${currency} ${balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};

const getInitials = (name?: string | null) => {
    if (!name) return "U";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
};

const getStatusClasses = (status?: string | null) => {
    switch (status) {
        case "active":
            return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
        case "pending":
            return "border-amber-400/30 bg-amber-400/10 text-amber-300";
        case "suspended":
            return "border-orange-400/30 bg-orange-400/10 text-orange-300";
        case "blocked":
            return "border-red-400/30 bg-red-400/10 text-red-300";
        default:
            return "border-slate-400/30 bg-slate-400/10 text-slate-300";
    }
};

const getRoleClasses = (role?: string | null) => {
    switch (role) {
        case "super_admin":
            return "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300";
        case "admin":
            return "border-amber-400/30 bg-amber-400/10 text-amber-300";
        default:
            return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    }
};

export default function UserDetailsDrawer({
    open,
    user,
    onClose,
    onEditRole,
    onManageWallet,
    onDelete,
    onToggleStatus,
}: UserDetailsDrawerProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open || !user) return null;

    const status = user.account_status || "unknown";
    const isActive = status === "active";

    const details = [
        { label: "Email", value: user.email || "Not available" },
        { label: "Country", value: user.country || "Not available" },
        { label: "Role", value: formatLabel(user.role) },
        { label: "Status", value: formatLabel(status) },
        {
            label: "Email verification",
            value: user.email_verified ? "Verified" : "Not verified",
        },
        { label: "Wallet balance", value: formatWallet(user) },
        {
            label: "Joined",
            value: formatDate(
                (user as UserSummary & { created_at?: string | null }).created_at,
            ),
        },
        {
            label: "Last login",
            value: formatDate(
                (user as UserSummary & { last_login_at?: string | null }).last_login_at,
            ),
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[70]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
        >
            <button
                type="button"
                aria-label="Close user details"
                className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-[#090d18] text-white shadow-2xl">
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                            GoldenSweep Admin
                        </p>
                        <h2
                            id="user-details-title"
                            className="mt-1 truncate text-xl font-bold sm:text-2xl"
                        >
                            User details
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                        aria-label="Close drawer"
                    >
                        ×
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                    <section className="overflow-hidden rounded-2xl border border-amber-300/15 bg-gradient-to-br from-amber-300/10 via-white/[0.03] to-transparent">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300 to-yellow-600 text-2xl font-black text-black shadow-lg shadow-amber-400/10">
                                    {getInitials(user.full_name)}
                                </div>

                                <div className="mt-4 min-w-0 sm:ml-5 sm:mt-0">
                                    <h3 className="truncate text-2xl font-bold">
                                        {user.full_name || "Unnamed user"}
                                    </h3>
                                    <p className="mt-1 break-all text-sm text-slate-400">
                                        {user.email}
                                    </p>

                                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleClasses(
                                                user.role,
                                            )}`}
                                        >
                                            {formatLabel(user.role)}
                                        </span>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                status,
                                            )}`}
                                        >
                                            {formatLabel(status)}
                                        </span>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                user.email_verified
                                                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                                    : "border-slate-400/30 bg-slate-400/10 text-slate-300"
                                            }`}
                                        >
                                            {user.email_verified
                                                ? "Verified"
                                                : "Unverified"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Account overview
                                </p>
                                <h4 className="mt-1 text-lg font-semibold">
                                    Profile information
                                </h4>
                            </div>
                        </div>

                        <dl className="divide-y divide-white/10">
                            {details.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4"
                                >
                                    <dt className="text-sm text-slate-500">
                                        {detail.label}
                                    </dt>
                                    <dd className="break-words text-sm font-medium text-slate-100 sm:text-right">
                                        {detail.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Quick actions
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {onEditRole && (
                                <button
                                    type="button"
                                    onClick={() => onEditRole(user)}
                                    className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-300/50 hover:bg-sky-400/20 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                                >
                                    Change role
                                </button>
                            )}

                            {onManageWallet && (
                                <button
                                    type="button"
                                    onClick={() => onManageWallet(user)}
                                    className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                                >
                                    Manage wallet
                                </button>
                            )}

                            {onToggleStatus && (
                                <button
                                    type="button"
                                    onClick={() => onToggleStatus(user)}
                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 ${
                                        isActive
                                            ? "border-orange-400/25 bg-orange-400/10 text-orange-200 hover:border-orange-300/50 hover:bg-orange-400/20 focus:ring-orange-300/40"
                                            : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300/50 hover:bg-emerald-400/20 focus:ring-emerald-300/40"
                                    }`}
                                >
                                    {isActive ? "Suspend user" : "Activate user"}
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(user)}
                                    className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:border-red-300/50 hover:bg-red-400/20 focus:outline-none focus:ring-2 focus:ring-red-300/40"
                                >
                                    Delete user
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                <footer className="shrink-0 border-t border-white/10 bg-[#090d18]/95 px-4 py-4 backdrop-blur sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                    >
                        Close
                    </button>
                </footer>
            </aside>
        </div>
    );
}