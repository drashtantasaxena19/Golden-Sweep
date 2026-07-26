import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type {
    RechargePackage,
    RechargePackagePayload,
} from "../../../types/recharge";

interface RechargePackageFormProps {
    open: boolean;
    pkg: RechargePackage | null;
    loading: boolean;
    onClose: () => void;
    onSubmit: (payload: RechargePackagePayload) => void;
}

const EMPTY_FORM: RechargePackagePayload = {
    name: "",
    description: "",
    price: 0,
    currency: "INR",
    coins: 0,
    bonus_coins: 0,
    badge: "",
    sort_order: 0,
    is_active: true,
};

export default function RechargePackageForm({
    open,
    pkg,
    loading,
    onClose,
    onSubmit,
}: RechargePackageFormProps) {
    const [form, setForm] = useState<RechargePackagePayload>(EMPTY_FORM);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        setError("");
        setForm(
            pkg
                ? {
                      name: pkg.name,
                      description: pkg.description ?? "",
                      price: pkg.price,
                      currency: pkg.currency,
                      coins: pkg.coins,
                      bonus_coins: pkg.bonus_coins,
                      badge: pkg.badge ?? "",
                      sort_order: pkg.sort_order,
                      is_active: pkg.is_active,
                  }
                : EMPTY_FORM,
        );
    }, [open, pkg]);

    if (!open) return null;

    const submit = () => {
        if (!form.name.trim()) {
            setError("Plan name is required.");
            return;
        }
        if (form.price <= 0) {
            setError("Price must be greater than zero.");
            return;
        }
        if (form.coins <= 0) {
            setError("Coins must be greater than zero.");
            return;
        }
        if (form.currency.trim().length !== 3) {
            setError("Currency must contain exactly 3 letters.");
            return;
        }

        onSubmit({
            ...form,
            name: form.name.trim(),
            description: form.description?.trim() || null,
            badge: form.badge?.trim() || null,
            currency: form.currency.trim().toUpperCase(),
        });
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#080b13] shadow-2xl">
                <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {pkg ? "Edit Recharge Plan" : "Create Recharge Plan"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Configure the purchase price and awarded Gold Coins.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Plan name
                        </span>
                        <input
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                            placeholder="Gold Pack"
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Price
                        </span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    price: Number(event.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Currency
                        </span>
                        <input
                            value={form.currency}
                            maxLength={3}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    currency: event.target.value.toUpperCase(),
                                })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 uppercase text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Base coins
                        </span>
                        <input
                            type="number"
                            min="1"
                            value={form.coins}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    coins: Number(event.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Bonus coins
                        </span>
                        <input
                            type="number"
                            min="0"
                            value={form.bonus_coins}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    bonus_coins: Number(event.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Badge
                        </span>
                        <input
                            value={form.badge ?? ""}
                            onChange={(event) =>
                                setForm({ ...form, badge: event.target.value })
                            }
                            placeholder="Best Value"
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label>
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Sort order
                        </span>
                        <input
                            type="number"
                            min="0"
                            value={form.sort_order}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    sort_order: Number(event.target.value),
                                })
                            }
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label className="sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-medium text-slate-300">
                            Description
                        </span>
                        <textarea
                            value={form.description ?? ""}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    description: event.target.value,
                                })
                            }
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-amber-400/50"
                        />
                    </label>

                    <label className="flex items-center gap-3 sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    is_active: event.target.checked,
                                })
                            }
                            className="h-4 w-4 accent-amber-400"
                        />
                        <span className="text-sm font-medium text-slate-300">
                            Plan is active and visible to players
                        </span>
                    </label>

                    <div className="sm:col-span-2 rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-sm text-amber-200">
                        Players receive{" "}
                        <strong>
                            {(form.coins + form.bonus_coins).toLocaleString()} Gold Coins
                        </strong>{" "}
                        for this plan.
                    </div>

                    {error && (
                        <p className="sm:col-span-2 text-sm font-medium text-red-300">
                            {error}
                        </p>
                    )}
                </div>

                <footer className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={loading}
                        className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                    >
                        {loading
                            ? "Saving..."
                            : pkg
                              ? "Save Changes"
                              : "Create Plan"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
