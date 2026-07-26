import { useMemo, useState } from "react";

interface BulkActionsProps {
    selectedIds: string[];
    loading?: boolean;
    onClearSelection: () => void;
    onActivate: () => void | Promise<void>;
    onSuspend: () => void | Promise<void>;
    onDelete: () => void | Promise<void>;
}

type PendingAction = "activate" | "suspend" | "delete" | null;

const ActionIcon = ({
    type,
}: {
    type: Exclude<PendingAction, null> | "clear";
}) => {
    const paths = {
        activate: (
            <>
                <path d="M20 6 9 17l-5-5" />
            </>
        ),
        suspend: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m8.5 8.5 7 7" />
            </>
        ),
        delete: (
            <>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 13h10l1-13" />
                <path d="M9 7V4h6v3" />
            </>
        ),
        clear: (
            <>
                <path d="m7 7 10 10" />
                <path d="M17 7 7 17" />
            </>
        ),
    };

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            {paths[type]}
        </svg>
    );
};

export default function BulkActions({
    selectedIds,
    loading = false,
    onClearSelection,
    onActivate,
    onSuspend,
    onDelete,
}: BulkActionsProps) {
    const [pendingAction, setPendingAction] =
        useState<PendingAction>(null);

    const count = useMemo(() => selectedIds.length, [selectedIds]);

    if (count === 0) return null;

    const runAction = async (
        action: Exclude<PendingAction, null>,
        callback: () => void | Promise<void>,
    ) => {
        if (loading || pendingAction) return;

        setPendingAction(action);

        try {
            await callback();
        } finally {
            setPendingAction(null);
        }
    };

    const busy = loading || pendingAction !== null;

    return (
        <section
            className="sticky top-3 z-30 overflow-hidden rounded-2xl border border-amber-300/20 bg-[#0b101d]/95 shadow-2xl shadow-black/20 backdrop-blur-xl"
            aria-label="Bulk user actions"
        >
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-sm font-black text-amber-200">
                        {count}
                    </div>

                    <div className="min-w-0">
                        <p className="font-semibold text-white">
                            {count} user{count === 1 ? "" : "s"} selected
                        </p>
                        <p className="truncate text-xs text-slate-400">
                            Apply one action to every selected account.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                            void runAction("activate", onActivate)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-400/20 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pendingAction === "activate" ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <ActionIcon type="activate" />
                        )}
                        <span>
                            {pendingAction === "activate"
                                ? "Activating..."
                                : "Activate"}
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                            void runAction("suspend", onSuspend)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-400/10 px-3.5 py-2.5 text-sm font-semibold text-orange-200 transition hover:border-orange-300/50 hover:bg-orange-400/20 focus:outline-none focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pendingAction === "suspend" ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <ActionIcon type="suspend" />
                        )}
                        <span>
                            {pendingAction === "suspend"
                                ? "Suspending..."
                                : "Suspend"}
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                            void runAction("delete", onDelete)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-3.5 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-300/50 hover:bg-red-400/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pendingAction === "delete" ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <ActionIcon type="delete" />
                        )}
                        <span>
                            {pendingAction === "delete"
                                ? "Deleting..."
                                : "Delete"}
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={onClearSelection}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ActionIcon type="clear" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {busy && (
                <div className="h-1 overflow-hidden bg-white/5">
                    <div className="h-full w-1/3 animate-[bulk-progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-amber-300 to-yellow-500" />
                </div>
            )}

            <style>
                {`
                    @keyframes bulk-progress {
                        0% { transform: translateX(-110%); }
                        100% { transform: translateX(410%); }
                    }
                `}
            </style>
        </section>
    );
}