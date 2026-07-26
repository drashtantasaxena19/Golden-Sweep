import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ExternalLink,
    ImageIcon,
    Loader2,
    Pencil,
    Star,
    Trash2,
} from "lucide-react";

import gameService from "../../services/gameService";
import { getApiErrorMessage } from "../../utils/gameError";
import type {
    GameImageType,
    GameResponse,
} from "../../types/game";
import GameImageUploader from "../../components/admin/games/GameImageUploader";
import GameStatusBadge from "../../components/admin/games/GameStatusBadge";

const GameDetails = () => {
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId: string }>();
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState<GameResponse>();

    const loadGame = useCallback(async () => {
        if (!gameId) return;

        try {
            setLoading(true);
            setGame(await gameService.getAdminGame(gameId));
        } catch (error) {
            console.error(error);
            alert(
                getApiErrorMessage(
                    error,
                    "Unable to load the game."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        void loadGame();
    }, [loadGame]);

    const deleteGame = async () => {
        if (!game) return;
        if (!window.confirm(`Delete "${game.name}"?`)) {
            return;
        }

        try {
            await gameService.deleteGame(game.id);
            navigate("/admin/games");
        } catch (error) {
            alert(
                getApiErrorMessage(
                    error,
                    "Unable to delete the game."
                )
            );
        }
    };

    const handleImageChanged = async (
        imageType: GameImageType,
        fileId: string | null
    ) => {
        setGame((current) =>
            current
                ? {
                      ...current,
                      [`${imageType}_file_id`]: fileId,
                      status:
                          imageType === "logo" && !fileId
                              ? "draft"
                              : current.status,
                  }
                : current
        );
        await loadGame();
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2
                    className="animate-spin text-yellow-500"
                    size={40}
                />
            </div>
        );
    }

    if (!game) {
        return (
            <div className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-10 text-center text-slate-300">
                Game not found.
            </div>
        );
    }

    const heroUrl =
        gameService.getImageUrl(game.banner_file_id) ??
        gameService.getImageUrl(
            game.thumbnail_file_id
        ) ??
        gameService.getImageUrl(game.logo_file_id);

    return (
        <div className="space-y-6 text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/games")
                        }
                        aria-label="Back to games"
                        className="rounded-xl border border-yellow-400/20 bg-[#11141C] p-2.5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {game.name}
                        </h1>
                        <p className="mt-1 text-slate-500">
                            {game.provider_name ??
                                "No provider set"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/admin/games/${game.id}/edit`
                            )
                        }
                        className="flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-blue-300"
                    >
                        <Pencil size={17} />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={deleteGame}
                        className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-red-300"
                    >
                        <Trash2 size={17} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-6 lg:col-span-2">
                    {heroUrl ? (
                        <img
                            src={heroUrl}
                            alt={game.name}
                            className="h-80 w-full rounded-xl object-cover"
                        />
                    ) : (
                        <div className="flex h-80 items-center justify-center rounded-xl bg-[#11141C]">
                            <ImageIcon
                                size={46}
                                className="text-slate-600"
                            />
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <GameStatusBadge
                            status={game.status}
                        />
                        {game.is_featured && (
                            <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300">
                                <Star size={15} />
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="mt-6 text-slate-300">
                        {game.short_description}
                    </p>
                    <p className="mt-4 whitespace-pre-wrap text-slate-500">
                        {game.description}
                    </p>
                </section>

                <section className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-6">
                    <h2 className="mb-5 text-xl font-semibold text-white">
                        Information
                    </h2>
                    <div className="space-y-4">
                        <Info
                            label="Category"
                            value={game.category}
                        />
                        <Info
                            label="Slug"
                            value={game.slug}
                        />
                        <Info
                            label="Entry Fee"
                            value={`${game.entry_fee_coins} coins`}
                        />
                        <Info
                            label="Minimum Age"
                            value={String(game.minimum_age)}
                        />
                        <Info
                            label="Orientation"
                            value={game.orientation}
                        />
                        <Info
                            label="Status management"
                            value="Automatic"
                        />
                    </div>

                    <a
                        href={game.game_url}
                        target={
                            game.opens_in_new_tab
                                ? "_blank"
                                : undefined
                        }
                        rel="noreferrer"
                        className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 font-semibold text-black"
                    >
                        <ExternalLink size={18} />
                        Open Game
                    </a>
                </section>
            </div>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-white">
                    Images
                </h2>
                <div className="grid gap-5 md:grid-cols-3">
                    {(
                        [
                            [
                                "logo",
                                "Logo (required)",
                                game.logo_file_id,
                            ],
                            [
                                "thumbnail",
                                "Thumbnail",
                                game.thumbnail_file_id,
                            ],
                            [
                                "banner",
                                "Banner",
                                game.banner_file_id,
                            ],
                        ] as const
                    ).map(([imageType, label, fileId]) => (
                        <GameImageUploader
                            key={imageType}
                            gameId={game.id}
                            imageType={imageType}
                            label={label}
                            fileId={fileId}
                            onChanged={(nextFileId) =>
                                void handleImageChanged(
                                    imageType,
                                    nextFileId
                                )
                            }
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

const Info = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 capitalize text-slate-200">
            {value}
        </p>
    </div>
);

export default GameDetails;
