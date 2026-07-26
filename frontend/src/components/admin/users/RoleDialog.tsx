import { useEffect, useMemo, useState } from "react";
import type { UserSummary } from "../../../types/userManagement";

interface RoleDialogProps {
    open: boolean;
    user: UserSummary | null;
    roles: string[];
    loading?: boolean;
    onClose: () => void;
    onSave: (role: string) => void | Promise<void>;
}

interface RoleMeta {
    title: string;
    description: string;
    permissions: string[];
    badgeClass: string;
    cardClass: string;
    icon: string;
}

const ROLE_META: Record<string, RoleMeta> = {
    player: {
        title: "Player",
        description:
            "Standard GoldenSweep account with access to games, wallet features, rewards, and personal profile settings.",
        permissions: [
            "Play available games",
            "Use personal wallet",
            "View rewards and activity",
            "Manage own profile",
        ],
        badgeClass:
            "border-sky-400/30 bg-sky-400/10 text-sky-200",
        cardClass:
            "hover:border-sky-300/40 hover:bg-sky-400/[0.06]",
        icon: "♟",
    },
    admin: {
        title: "Admin",
        description:
            "Operational administrator with access to user management, platform monitoring, and configured admin tools.",
        permissions: [
            "Manage player accounts",
            "Review account status",
            "Adjust eligible wallets",
            "Access admin workspace",
        ],
        badgeClass:
            "border-amber-400/30 bg-amber-400/10 text-amber-200",
        cardClass:
            "hover:border-amber-300/40 hover:bg-amber-400/[0.06]",
        icon: "◆",
    },
    super_admin: {
        title: "Super Admin",
        description:
            "Highest-privilege account with access to sensitive configuration, administrator control, and system-wide actions.",
        permissions: [
            "Manage all user roles",
            "Control administrator access",
            "Access sensitive settings",
            "Perform system-wide actions",
        ],
        badgeClass:
            "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
        cardClass:
            "hover:border-fuchsia-300/40 hover:bg-fuchsia-400/[0.06]",
        icon: "♛",
    },
};

const formatRole = (value: string) =>
    value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getInitials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";

const getRoleMeta = (role: string): RoleMeta =>
    ROLE_META[role] ?? {
        title: formatRole(role),
        description:
            "Custom platform role. Review the permissions configured for this role before assigning it.",
        permissions: [
            "Access depends on backend permissions",
            "May affect protected admin routes",
            "Changes apply on authenticated requests",
        ],
        badgeClass:
            "border-slate-400/30 bg-slate-400/10 text-slate-200",
        cardClass:
            "hover:border-slate-300/40 hover:bg-white/[0.05]",
        icon: "●",
    };

export default function RoleDialog({
    open,
    user,
    roles,
    loading = false,
    onClose,
    onSave,
}: RoleDialogProps) {
    const [selectedRole, setSelectedRole] = useState("");
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (!open) return;

        setSelectedRole(user?.role ?? roles[0] ?? "");
        setConfirmed(false);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
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
    }, [open, user, roles, loading, onClose]);

    const selectedMeta = useMemo(
        () => getRoleMeta(selectedRole),
        [selectedRole],
    );

    if (!open || !user) return null;

    const roleChanged = selectedRole !== user.role;
    const requiresConfirmation =
        selectedRole === "admin" || selectedRole === "super_admin";
    const canSave =
        roleChanged &&
        !loading &&
        (!requiresConfirmation || confirmed);

    const handleRoleSelect = (role: string) => {
        if (loading) return;

        setSelectedRole(role);
        setConfirmed(false);
    };

    const handleSave = async () => {
        if (!canSave) return;
        await onSave(selectedRole);
    };

    return (
        <div
            className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-dialog-title"
        >
            <button
                type="button"
                aria-label="Close role dialog"
                disabled={loading}
                className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm disabled:cursor-not-allowed"
                onClick={onClose}
            />

            <section className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#090d18] text-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
                <header className="flex items-start justify-between border-b border-white/10 px-4 py-5 sm:px-6">
                    <div className="min-w-0 pr-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                            Access control
                        </p>
                        <h2
                            id="role-dialog-title"
                            className="mt-1 text-xl font-bold sm:text-2xl"
                        >
                            Change user role
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Select the access level that should be assigned to this account.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>

                <div className="space-y-5 px-4 py-5 sm:px-6">
                    <section className="flex flex-col gap-4 rounded-2xl border border-amber-300/15 bg-gradient-to-br from-amber-300/10 via-white/[0.03] to-transparent p-4 sm:flex-row sm:items-center sm:p-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-600 text-lg font-black text-black">
                            {getInitials(user.full_name)}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-bold">
                                {user.full_name || "Unnamed user"}
                            </h3>
                            <p className="truncate text-sm text-slate-400">
                                {user.email}
                            </p>
                        </div>

                        <div className="sm:text-right">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                Current role
                            </p>
                            <span
                                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                    getRoleMeta(user.role).badgeClass
                                }`}
                            >
                                {formatRole(user.role)}
                            </span>
                        </div>
                    </section>

                    <section>
                        <div className="mb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Available roles
                            </p>
                            <h3 className="mt-1 text-lg font-semibold">
                                Choose a new access level
                            </h3>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            {roles.map((role) => {
                                const meta = getRoleMeta(role);
                                const selected = selectedRole === role;
                                const current = user.role === role;

                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`relative rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            selected
                                                ? "border-amber-300/60 bg-amber-300/10 shadow-lg shadow-amber-300/5"
                                                : `border-white/10 bg-white/[0.03] ${meta.cardClass}`
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-xl">
                                                {meta.icon}
                                            </span>

                                            <span
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                    selected
                                                        ? "border-amber-300 bg-amber-300 text-xs font-black text-black"
                                                        : "border-white/20"
                                                }`}
                                            >
                                                {selected ? "✓" : ""}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <h4 className="font-bold">
                                                {meta.title}
                                            </h4>
                                            {current && (
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Current
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            {meta.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Permission summary
                                </p>
                                <h3 className="mt-1 text-lg font-semibold">
                                    {selectedMeta.title}
                                </h3>
                            </div>

                            <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${selectedMeta.badgeClass}`}
                            >
                                {formatRole(selectedRole)}
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {selectedMeta.description}
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {selectedMeta.permissions.map((permission) => (
                                <div
                                    key={permission}
                                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs text-emerald-300">
                                        ✓
                                    </span>
                                    <span className="text-sm text-slate-300">
                                        {permission}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {requiresConfirmation && roleChanged && (
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-4">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                disabled={loading}
                                onChange={(event) =>
                                    setConfirmed(event.target.checked)
                                }
                                className="mt-1 h-4 w-4 shrink-0 accent-amber-300"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-amber-200">
                                    Confirm elevated access
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-slate-400">
                                    I understand that assigning this role may grant
                                    access to administrative or sensitive platform
                                    features.
                                </span>
                            </span>
                        </label>
                    )}

                    {!roleChanged && (
                        <div className="rounded-2xl border border-slate-400/20 bg-slate-400/[0.06] px-4 py-3 text-sm text-slate-400">
                            Select a different role to enable the update action.
                        </div>
                    )}
                </div>

                <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#090d18]/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!canSave}
                        onClick={handleSave}
                        className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-amber-400/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading
                            ? "Updating role..."
                            : `Update to ${selectedMeta.title}`}
                    </button>
                </footer>
            </section>
        </div>
    );
}