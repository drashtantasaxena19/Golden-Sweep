import {
    Coins,
    Edit3,
    PackageOpen,
    Power,
    PowerOff,
    Trash2,
} from "lucide-react";

import type { RechargePackage } from "../../../types/recharge";

interface RechargePackageTableProps {
    packages: RechargePackage[];
    loading: boolean;
    onEdit: (pkg: RechargePackage) => void;
    onToggleStatus: (pkg: RechargePackage) => void;
    onDelete: (pkg: RechargePackage) => void;
}

export default function RechargePackageTable({
    packages,
    loading,
    onEdit,
    onToggleStatus,
    onDelete,
}: RechargePackageTableProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Coins</th>
                            <th className="px-4 py-3">Bonus</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06]">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center text-slate-400">
                                    Loading recharge plans...
                                </td>
                            </tr>
                        ) : packages.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center">
                                    <PackageOpen
                                        size={32}
                                        className="mx-auto text-slate-600"
                                    />
                                    <p className="mt-3 font-semibold text-slate-300">
                                        No recharge plans found
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Create the first Gold Coin package.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            packages.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-white/[0.025]">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/5 text-amber-400">
                                                <Coins size={19} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {pkg.name}
                                                </p>
                                                <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                                    {pkg.badge || pkg.description || "No badge"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-white">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: pkg.currency,
                                        }).format(pkg.price)}
                                    </td>

                                    <td className="px-4 py-4 text-slate-300">
                                        {pkg.coins.toLocaleString()}
                                    </td>

                                    <td className="px-4 py-4 text-emerald-300">
                                        +{pkg.bonus_coins.toLocaleString()}
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-amber-300">
                                        {pkg.total_coins.toLocaleString()}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                pkg.is_active
                                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                                    : "border-slate-400/20 bg-slate-400/10 text-slate-400"
                                            }`}
                                        >
                                            {pkg.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-slate-400">
                                        {pkg.sort_order}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(pkg)}
                                                title="Edit"
                                                className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 hover:text-white"
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onToggleStatus(pkg)}
                                                title={pkg.is_active ? "Deactivate" : "Activate"}
                                                className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 hover:text-white"
                                            >
                                                {pkg.is_active ? (
                                                    <PowerOff size={16} />
                                                ) : (
                                                    <Power size={16} />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(pkg)}
                                                title="Delete"
                                                className="rounded-lg border border-red-400/15 p-2 text-red-300 hover:bg-red-400/10"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
