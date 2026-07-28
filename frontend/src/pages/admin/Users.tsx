import { useCallback, useEffect, useMemo, useState } from "react";
import BulkActions from "../../components/admin/users/BulkActions";
import DeleteDialog from "../../components/admin/users/DeleteDialog";
import RoleDialog from "../../components/admin/users/RoleDialog";
import UserDetailsDrawer from "../../components/admin/users/UserDetailsDrawer";
import UserFilters, {
    type UserFilterValues,
} from "../../components/admin/users/UserFilters";
import UserTable from "../../components/admin/users/UserTable";
import WalletDialog from "../../components/admin/users/WalletDialog";
import userManagementService from "../../services/userManagementService";
import type {
    UserListResponse,
    UserStatistics,
    UserSummary,
} from "../../types/userManagement";

const DEFAULT_FILTERS: UserFilterValues = {
    search: "",
    role: "",
    status: "",
    verified: "",
    country: "",
};

const EMPTY_DATA: UserListResponse = {
    total: 0,
    page: 1,
    limit: 20,
    users: [],
};

const EMPTY_STATS: UserStatistics = {
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    suspended_users: 0,
    verified_users: 0,
    unverified_users: 0,
    admin_users: 0,
    player_users: 0,
    super_admin_users: 0,
};

const ROLES = ["player", "admin", "super_admin"];

function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
}

export default function Users() {
    const [data, setData] = useState<UserListResponse>(EMPTY_DATA);
    const [statistics, setStatistics] = useState<UserStatistics>(EMPTY_STATS);
    const [filters, setFilters] = useState<UserFilterValues>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<UserFilterValues>(DEFAULT_FILTERS);
    const [countries, setCountries] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [walletDialogOpen, setWalletDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const pageCount = Math.max(1, Math.ceil(data.total / data.limit));

    const requestFilters = useMemo(
        () => ({
            search: appliedFilters.search.trim() || undefined,
            role: appliedFilters.role || undefined,
            account_status: appliedFilters.status || undefined,
            email_verified:
                appliedFilters.verified === ""
                    ? undefined
                    : appliedFilters.verified === "true",
            country: appliedFilters.country || undefined,
            page: data.page,
            limit: data.limit,
        }),
        [appliedFilters, data.limit, data.page],
    );

    const showMessage = useCallback(
        (type: "success" | "error", text: string) => {
            setMessage({ type, text });
            window.setTimeout(() => setMessage(null), 3500);
        },
        [],
    );

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await userManagementService.getUsers(requestFilters);
            setData(result);
            setSelectedIds((current) =>
                current.filter((id) => result.users.some((user) => user.id === id)),
            );
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [requestFilters, showMessage]);

    const loadMetadata = useCallback(async () => {
        const [statsResult, countriesResult] = await Promise.allSettled([
            userManagementService.getStatistics(),
            userManagementService.getCountries(),
        ]);

        if (statsResult.status === "fulfilled") {
            setStatistics(statsResult.value as UserStatistics);
        }

        if (countriesResult.status === "fulfilled") {
            const value = countriesResult.value as unknown;
            if (Array.isArray(value)) {
                setCountries(value.filter((item): item is string => typeof item === "string"));
            }
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        void loadMetadata();
    }, [loadMetadata]);

    const refreshAll = async () => {
        await Promise.all([loadUsers(), loadMetadata()]);
    };

    const applyFilters = () => {
        setData((current) => ({ ...current, page: 1 }));
        setAppliedFilters(filters);
    };

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        setData((current) => ({ ...current, page: 1 }));
    };

    const openDrawer = (user: UserSummary) => {
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    const openRoleDialog = (user: UserSummary) => {
        setSelectedUser(user);
        setDrawerOpen(false);
        setRoleDialogOpen(true);
    };

    const openWalletDialog = (user: UserSummary) => {
        setSelectedUser(user);
        setDrawerOpen(false);
        setWalletDialogOpen(true);
    };

    const openDeleteDialog = (user: UserSummary) => {
        setSelectedUser(user);
        setDrawerOpen(false);
        setDeleteDialogOpen(true);
    };

    const runAction = async (
        action: () => Promise<unknown>,
        successText: string,
        closeDialogs = true,
    ) => {
        setActionLoading(true);
        try {
            await action();
            showMessage("success", successText);
            if (closeDialogs) {
                setRoleDialogOpen(false);
                setWalletDialogOpen(false);
                setDeleteDialogOpen(false);
                setDrawerOpen(false);
            }
            setSelectedUser(null);
            await refreshAll();
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    const updateRole = async (role: string) => {
        if (!selectedUser) return;
        await runAction(
            () => userManagementService.updateRole(selectedUser.id, { role }),
            `${selectedUser.full_name}'s role was updated.`,
        );
    };

    const creditWallet = async (amount: number) => {
        if (!selectedUser) return;
        await runAction(
            () => userManagementService.creditWallet(selectedUser.id, { amount }),
            `Wallet credited by ${selectedUser.wallet_currency} ${amount}.`,
        );
    };

    const debitWallet = async (amount: number) => {
        if (!selectedUser) return;
        await runAction(
            () => userManagementService.debitWallet(selectedUser.id, { amount }),
            `Wallet debited by ${selectedUser.wallet_currency} ${amount}.`,
        );
    };

    const setWalletBalance = async (amount: number) => {
        if (!selectedUser) return;
        await runAction(
            () => userManagementService.setWalletBalance(selectedUser.id, amount),
            `Wallet balance set to ${selectedUser.wallet_currency} ${amount}.`,
        );
    };

    const deleteUser = async (userId: string) => {
        await runAction(
            () => userManagementService.deleteUser(userId),
            "User deleted successfully.",
        );
    };

    const bulkStatus = async (accountStatus: "active" | "suspended") => {
        if (selectedIds.length === 0) return;
        await runAction(
            () => userManagementService.bulkUpdateStatus(selectedIds, accountStatus),
            `${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"} updated.`,
            false,
        );
        setSelectedIds([]);
    };

    const bulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected user(s)?`)) return;

        await runAction(
            () => userManagementService.bulkDelete(selectedIds),
            `${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"} deleted.`,
            false,
        );
        setSelectedIds([]);
    };
    const confirmDeleteUser = async (): Promise<void> => {
        if (!selectedUser) {
            return;
        }

        await deleteUser(selectedUser.id);
    };
    const statCards = [
        { label: "Total Users", value: statistics.total_users },
        { label: "Players", value: statistics.player_users ?? 0 },
        { label: "Active", value: statistics.active_users ?? 0 },
        { label: "Verified", value: statistics.verified_users ?? 0 },
        { label: "Suspended", value: statistics.suspended_users ?? 0 },
        {
            label: "Admins",
            value:
                (statistics.admin_users ?? 0) +
                (statistics.super_admin_users ?? 0),
        },
    ];

    return (
        <div className="min-w-0 space-y-5 p-3 sm:p-4 lg:p-6">
            {message && (
                <div
                    role="status"
                    className={`fixed right-4 top-4 z-[70] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${message.type === "success"
                        ? "border-emerald-400/40 bg-emerald-950 text-emerald-200"
                        : "border-red-400/40 bg-red-950 text-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                        GoldenSweep Admin
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage player accounts, roles, access, verification and wallets.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void refreshAll()}
                    disabled={loading || actionLoading}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {statCards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-black/10"
                    >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {Number(card.value ?? 0).toLocaleString()}
                        </p>
                    </article>
                ))}
            </section>

            <UserFilters
                value={filters}
                roles={ROLES}
                countries={countries}
                loading={loading}
                onChange={setFilters}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <BulkActions
                selectedIds={selectedIds}
                loading={actionLoading}
                onClearSelection={() => setSelectedIds([])}
                onActivate={() => void bulkStatus("active")}
                onSuspend={() => void bulkStatus("suspended")}
                onDelete={() => void bulkDelete()}
            />

            <UserTable
                users={data.users}
                loading={loading}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onView={openDrawer}
                onEdit={openRoleDialog}
                onWallet={openWalletDialog}
                onDelete={openDeleteDialog}
            />

            <footer className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                    Showing {data.users.length === 0 ? 0 : (data.page - 1) * data.limit + 1}
                    –{Math.min(data.page * data.limit, data.total)} of {data.total} users
                </p>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <button
                        type="button"
                        disabled={loading || data.page <= 1}
                        onClick={() =>
                            setData((current) => ({
                                ...current,
                                page: Math.max(1, current.page - 1),
                            }))
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="min-w-20 text-center text-sm text-slate-300">
                        {data.page} / {pageCount}
                    </span>
                    <button
                        type="button"
                        disabled={loading || data.page >= pageCount}
                        onClick={() =>
                            setData((current) => ({
                                ...current,
                                page: Math.min(pageCount, current.page + 1),
                            }))
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </footer>

            <UserDetailsDrawer
                open={drawerOpen}
                user={selectedUser}
                onClose={() => setDrawerOpen(false)}
                onEditRole={openRoleDialog}
                onManageWallet={openWalletDialog}
                onDelete={openDeleteDialog}
            />

            <RoleDialog
                open={roleDialogOpen}
                user={selectedUser}
                roles={ROLES}
                loading={actionLoading}
                onClose={() => setRoleDialogOpen(false)}
                onSave={(role) => void updateRole(role)}
            />

            <WalletDialog
                open={walletDialogOpen}
                user={selectedUser}
                loading={actionLoading}
                onClose={() => setWalletDialogOpen(false)}
                onCredit={(amount) => void creditWallet(amount)}
                onDebit={(amount) => void debitWallet(amount)}
                onSetBalance={(amount) => void setWalletBalance(amount)}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                user={selectedUser}
                loading={actionLoading}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDeleteUser}
            />
        </div>
    );
}