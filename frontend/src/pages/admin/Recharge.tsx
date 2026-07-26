import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import RechargeFilters from "../../components/admin/recharge/RechargeFilters";
import RechargePackageForm from "../../components/admin/recharge/RechargePackageForm";
import RechargePackageTable from "../../components/admin/recharge/RechargePackageTable";
import RechargeStatistics from "../../components/admin/recharge/RechargeStatistics";
import rechargeService from "../../services/rechargeService";
import type {
    RechargeFilters as RechargeFilterValues,
    RechargePackage,
    RechargePackageListResponse,
    RechargePackagePayload,
    RechargePackageStatistics,
} from "../../types/recharge";

const EMPTY_FILTERS: RechargeFilterValues = {
    search: "",
    status: "",
    currency: "",
};

const EMPTY_LIST: RechargePackageListResponse = {
    total: 0,
    page: 1,
    limit: 20,
    packages: [],
};

const EMPTY_STATISTICS: RechargePackageStatistics = {
    total_packages: 0,
    active_packages: 0,
    inactive_packages: 0,
    lowest_price: 0,
    highest_price: 0,
    total_base_coins: 0,
    total_bonus_coins: 0,
};

function errorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}

export default function Recharge() {
    const [data, setData] = useState<RechargePackageListResponse>(EMPTY_LIST);
    const [statistics, setStatistics] =
        useState<RechargePackageStatistics>(EMPTY_STATISTICS);
    const [filters, setFilters] = useState<RechargeFilterValues>(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] =
        useState<RechargeFilterValues>(EMPTY_FILTERS);
    const [selectedPackage, setSelectedPackage] =
        useState<RechargePackage | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const pageCount = Math.max(1, Math.ceil(data.total / data.limit));

    const showMessage = useCallback(
        (type: "success" | "error", text: string) => {
            setMessage({ type, text });
            window.setTimeout(() => setMessage(null), 3500);
        },
        [],
    );

    const loadPackages = useCallback(async () => {
        setLoading(true);
        try {
            const result = await rechargeService.getPackages(
                appliedFilters,
                data.page,
                data.limit,
            );
            setData(result);
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, data.limit, data.page, showMessage]);

    const loadStatistics = useCallback(async () => {
        try {
            setStatistics(await rechargeService.getStatistics());
        } catch (error) {
            showMessage("error", errorMessage(error));
        }
    }, [showMessage]);

    useEffect(() => {
        void loadPackages();
    }, [loadPackages]);

    useEffect(() => {
        void loadStatistics();
    }, [loadStatistics]);

    const refreshAll = async () => {
        await Promise.all([loadPackages(), loadStatistics()]);
    };

    const openCreate = () => {
        setSelectedPackage(null);
        setFormOpen(true);
    };

    const openEdit = (pkg: RechargePackage) => {
        setSelectedPackage(pkg);
        setFormOpen(true);
    };

    const savePackage = async (payload: RechargePackagePayload) => {
        setActionLoading(true);
        try {
            if (selectedPackage) {
                await rechargeService.updatePackage(selectedPackage.id, payload);
                showMessage("success", "Recharge plan updated successfully.");
            } else {
                await rechargeService.createPackage(payload);
                showMessage("success", "Recharge plan created successfully.");
            }

            setFormOpen(false);
            setSelectedPackage(null);
            await refreshAll();
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (pkg: RechargePackage) => {
        setActionLoading(true);
        try {
            if (pkg.is_active) {
                await rechargeService.deactivatePackage(pkg.id);
                showMessage("success", `${pkg.name} was deactivated.`);
            } else {
                await rechargeService.activatePackage(pkg.id);
                showMessage("success", `${pkg.name} was activated.`);
            }
            await refreshAll();
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    const deletePackage = async (pkg: RechargePackage) => {
        const confirmed = window.confirm(
            `Delete "${pkg.name}"? This will remove it from the admin and player package lists.`,
        );
        if (!confirmed) return;

        setActionLoading(true);
        try {
            await rechargeService.deletePackage(pkg.id);
            showMessage("success", `${pkg.name} was deleted.`);
            await refreshAll();
        } catch (error) {
            showMessage("error", errorMessage(error));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-w-0 space-y-5 p-3 sm:p-4 lg:p-6">
            {message && (
                <div
                    role="status"
                    className={`fixed right-4 top-4 z-[90] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
                        message.type === "success"
                            ? "border-emerald-400/30 bg-emerald-950 text-emerald-200"
                            : "border-red-400/30 bg-red-950 text-red-200"
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
                        Recharge Plans
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Create and manage Gold Coin purchase packages shown to players.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => void refreshAll()}
                        disabled={loading || actionLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreate}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                    >
                        <Plus size={17} />
                        Create Plan
                    </button>
                </div>
            </header>

            <RechargeStatistics statistics={statistics} />

            <RechargeFilters
                value={filters}
                loading={loading}
                onChange={setFilters}
                onApply={() => {
                    setData((current) => ({ ...current, page: 1 }));
                    setAppliedFilters(filters);
                }}
                onReset={() => {
                    setFilters(EMPTY_FILTERS);
                    setAppliedFilters(EMPTY_FILTERS);
                    setData((current) => ({ ...current, page: 1 }));
                }}
            />

            <RechargePackageTable
                packages={data.packages}
                loading={loading}
                onEdit={openEdit}
                onToggleStatus={(pkg) => void toggleStatus(pkg)}
                onDelete={(pkg) => void deletePackage(pkg)}
            />

            <footer className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                    Showing {data.packages.length === 0 ? 0 : (data.page - 1) * data.limit + 1}
                    –{Math.min(data.page * data.limit, data.total)} of {data.total} plans
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
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-40"
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
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </footer>

            <RechargePackageForm
                open={formOpen}
                pkg={selectedPackage}
                loading={actionLoading}
                onClose={() => {
                    setFormOpen(false);
                    setSelectedPackage(null);
                }}
                onSubmit={(payload) => void savePackage(payload)}
            />
        </div>
    );
}
