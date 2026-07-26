import { useRef, useState } from "react";
import {
    ImageIcon,
    Loader2,
    Trash2,
    Upload,
} from "lucide-react";

import gameService from "../../../services/gameService";
import type { GameImageType } from "../../../types/game";

interface GameImageUploaderProps {
    gameId: string;
    imageType: GameImageType;
    label: string;
    fileId?: string | null;
    onChanged: (fileId: string | null) => void;
}

const GameImageUploader = ({
    gameId,
    imageType,
    label,
    fileId,
    onChanged,
}: GameImageUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();

    const imageUrl = gameService.getImageUrl(fileId);

    const upload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
            setBusy(true);
            setError(undefined);
            const response =
                await gameService.uploadGameImage(
                    gameId,
                    imageType,
                    file
                );
            onChanged(response.image.file_id);
        } catch (uploadError) {
            console.error(uploadError);
            setError(
                "Upload failed. Use JPG, PNG, or WEBP up to 5 MB."
            );
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!fileId) return;
        if (
            imageType === "logo" &&
            !window.confirm(
                "Removing the logo returns this game to draft. Continue?"
            )
        ) {
            return;
        }

        try {
            setBusy(true);
            setError(undefined);
            await gameService.deleteGameImage(
                gameId,
                imageType
            );
            onChanged(null);
        } catch (deleteError) {
            console.error(deleteError);
            setError("Unable to remove the image.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-4">
            <p className="mb-3 font-medium text-white">
                {label}
            </p>

            <div className="flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#11141C]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImageIcon
                        size={34}
                        className="text-slate-600"
                    />
                )}
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-60"
                >
                    {busy ? (
                        <Loader2
                            size={15}
                            className="animate-spin"
                        />
                    ) : (
                        <Upload size={15} />
                    )}
                    {fileId ? "Replace" : "Upload"}
                </button>

                {fileId && (
                    <button
                        type="button"
                        onClick={() => void remove()}
                        disabled={busy}
                        aria-label={`Delete ${label}`}
                        className="rounded-xl border border-red-400/20 px-3 py-2.5 text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => void upload(event)}
            />
        </div>
    );
};

export default GameImageUploader;
