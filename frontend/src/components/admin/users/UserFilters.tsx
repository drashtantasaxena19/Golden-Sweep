import type { UserSummary } from "../../../types/userManagement";

interface DeleteDialogProps {
    open: boolean;
    user: UserSummary | null;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export default function DeleteDialog({ open, user, loading, onClose, onConfirm }: DeleteDialogProps) {
    if (!open || !user) return null;
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#090d18] p-6 text-white">
                <h2 className="text-2xl font-bold text-red-300">Delete User</h2>
                <p className="mt-4 text-slate-300">
                    Are you sure you want to permanently delete
                    <span className="font-semibold text-white"> {user.full_name}</span>?
                </p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button onClick={onClose} disabled={loading}
                        className="rounded-xl border border-white/10 px-4 py-2">Cancel</button>
                    <button onClick={() => void onConfirm()} disabled={loading}
                        className="rounded-xl bg-red-600 px-4 py-2 font-semibold">
                        {loading ? "Deleting..." : "Delete User"}
                    </button>
                </div>
            </div>
        </div>
    );
}