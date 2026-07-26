import type { UserSummary } from "../../../types/userManagement";

interface UserTableProps {
    users: UserSummary[];
    loading: boolean;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    onView?: (user: UserSummary) => void;
    onEdit?: (user: UserSummary) => void;
    onWallet?: (user: UserSummary) => void;
    onDelete?: (user: UserSummary) => void;
}

const roleClasses: Record<string, string> = {
    player: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    admin: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    super_admin: "border-violet-400/30 bg-violet-400/10 text-violet-300",
};

const statusClasses: Record<string, string> = {
    active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    inactive: "border-slate-400/30 bg-slate-400/10 text-slate-300",
    pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    suspended: "border-orange-400/30 bg-orange-400/10 text-orange-300",
    blocked: "border-red-400/30 bg-red-400/10 text-red-300",
};

function formatLabel(value: string): string {
    return value
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function initials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";
}

function money(user: UserSummary): string {
    const amount = Number(user.wallet_balance ?? 0);
    return `${user.wallet_currency || "GC"} ${amount.toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })}`;
}

function Badge({
    children,
    className,
}: {
    children: React.ReactNode;
    className: string;
}) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
        >
            {children}
        </span>
    );
}

export default function UserTable({
    users,
    loading,
    selectedIds = [],
    onSelectionChange,
    onView,
    onEdit,
    onWallet,
    onDelete,
}: UserTableProps) {
    const allSelected =
        users.length > 0 && users.every((user) => selectedIds.includes(user.id));

    const toggleAll = () => {
        if (!onSelectionChange) return;
        const pageIds = users.map((user) => user.id);
        if (allSelected) {
            onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
        } else {
            onSelectionChange(Array.from(new Set([...selectedIds, ...pageIds])));
        }
    };

    const toggleOne = (userId: string) => {
        if (!onSelectionChange) return;
        onSelectionChange(
            selectedIds.includes(userId)
                ? selectedIds.filter((id) => id !== userId)
                : [...selectedIds, userId],
        );
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5 lg:h-16"
                    />
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-2xl text-amber-300">
                    👤
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">No users found</h3>
                <p className="mt-1 text-sm text-slate-400">
                    Try changing or resetting the current filters.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 lg:hidden">
                {users.map((user) => {
                    const selected = selectedIds.includes(user.id);
                    return (
                        <article
                            key={user.id}
                            className={`rounded-2xl border p-4 shadow-lg shadow-black/10 transition ${
                                selected
                                    ? "border-amber-400/50 bg-amber-400/5"
                                    : "border-white/10 bg-slate-950/70"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleOne(user.id)}
                                    aria-label={`Select ${user.full_name}`}
                                    className="mt-1 h-4 w-4 accent-amber-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => onView?.(user)}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-sm font-black text-black">
                                        {initials(user.full_name)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate font-semibold text-white">
                                            {user.full_name}
                                        </span>
                                        <span className="block truncate text-sm text-slate-400">
                                            {user.email}
                                        </span>
                                    </span>
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                                    <div className="mt-1">
                                        <Badge className={roleClasses[user.role] ?? roleClasses.player}>
                                            {formatLabel(user.role)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                                    <div className="mt-1">
                                        <Badge
                                            className={
                                                statusClasses[user.account_status] ??
                                                statusClasses.inactive
                                            }
                                        >
                                            {formatLabel(user.account_status)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Country</p>
                                    <p className="mt-1 font-medium text-slate-200">{user.country || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Wallet</p>
                                    <p className="mt-1 font-semibold text-amber-300">{money(user)}</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <button type="button" onClick={() => onView?.(user)} className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">View</button>
                                <button type="button" onClick={() => onEdit?.(user)} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/20">Role</button>
                                <button type="button" onClick={() => onWallet?.(user)} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-400/20">Wallet</button>
                                <button type="button" onClick={() => onDelete?.(user)} className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-400/20">Delete</button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="hidden min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl shadow-black/10 lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-sm">
                        <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="w-12 px-4 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        aria-label="Select all users on this page"
                                        className="h-4 w-4 accent-amber-400"
                                    />
                                </th>
                                <th className="px-4 py-4 text-left">User</th>
                                <th className="px-4 py-4 text-left">Role</th>
                                <th className="px-4 py-4 text-left">Status</th>
                                <th className="px-4 py-4 text-left">Verified</th>
                                <th className="px-4 py-4 text-left">Country</th>
                                <th className="px-4 py-4 text-left">Wallet</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => {
                                const selected = selectedIds.includes(user.id);
                                return (
                                    <tr
                                        key={user.id}
                                        className={`transition hover:bg-white/[0.035] ${
                                            selected ? "bg-amber-400/[0.06]" : ""
                                        }`}
                                    >
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => toggleOne(user.id)}
                                                aria-label={`Select ${user.full_name}`}
                                                className="h-4 w-4 accent-amber-400"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() => onView?.(user)}
                                                className="flex max-w-[280px] items-center gap-3 text-left"
                                            >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-xs font-black text-black">
                                                    {initials(user.full_name)}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-semibold text-white hover:text-amber-300">
                                                        {user.full_name}
                                                    </span>
                                                    <span className="block truncate text-xs text-slate-400">
                                                        {user.email}
                                                    </span>
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge className={roleClasses[user.role] ?? roleClasses.player}>
                                                {formatLabel(user.role)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge className={statusClasses[user.account_status] ?? statusClasses.inactive}>
                                                {formatLabel(user.account_status)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={user.email_verified ? "text-emerald-300" : "text-slate-500"}>
                                                {user.email_verified ? "✓ Verified" : "Not verified"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300">{user.country || "—"}</td>
                                        <td className="px-4 py-4 font-semibold text-amber-300">{money(user)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => onView?.(user)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">View</button>
                                                <button type="button" onClick={() => onEdit?.(user)} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20">Role</button>
                                                <button type="button" onClick={() => onWallet?.(user)} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20">Wallet</button>
                                                <button type="button" onClick={() => onDelete?.(user)} className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/20">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}