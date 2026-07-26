import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import GameForm from "../../components/admin/games/GameForm";
import gameService from "../../services/gameService";
import { getApiErrorMessage } from "../../utils/gameError";
import type {
    GameImageFiles,
    GameResponse,
    GameUpdate,
} from "../../types/game";

const EditGame = () => {
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId: string }>();
    const [saving, setSaving] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [game, setGame] = useState<GameResponse>();

    const loadGame = useCallback(async () => {
        if (!gameId) {
            navigate("/admin/games", { replace: true });
            return;
        }

        try {
            setPageLoading(true);
            setGame(await gameService.getAdminGame(gameId));
        } catch (error) {
            console.error(error);
            alert(
                getApiErrorMessage(
                    error,
                    "Unable to load the game."
                )
            );
            navigate("/admin/games", { replace: true });
        } finally {
            setPageLoading(false);
        }
    }, [gameId, navigate]);

    useEffect(() => {
        void loadGame();
    }, [loadGame]);

    const handleUpdate = async (
        values: GameUpdate,
        files: GameImageFiles
    ) => {
        if (!gameId) return;

        try {
            setSaving(true);
            await gameService.updateGame(gameId, values);

            if (Object.values(files).some(Boolean)) {
                await gameService.replaceGameImages(
                    gameId,
                    files
                );
            }

            navigate(`/admin/games/${gameId}`);
        } catch (error) {
            console.error(error);
            alert(
                getApiErrorMessage(
                    error,
                    "Unable to update the game."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2
                    className="animate-spin text-yellow-500"
                    size={40}
                />
            </div>
        );
    }

    if (!game) {
        return (
            <div className="rounded-2xl border border-yellow-500/15 bg-[#0A0C12] p-8 text-center text-slate-300">
                Game not found.
            </div>
        );
    }

    return (
        <div className="space-y-6 text-slate-200">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/admin/games/${game.id}`)
                    }
                    aria-label="Back to game details"
                    className="rounded-xl border border-yellow-400/20 bg-[#11141C] p-2.5 text-slate-300 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Edit Game
                    </h1>
                    <p className="mt-1 text-slate-500">
                        {game.name}
                    </p>
                </div>
            </div>

            <GameForm
                mode="edit"
                loading={saving}
                initialValues={game}
                onSubmit={handleUpdate}
                onCancel={() =>
                    navigate(`/admin/games/${game.id}`)
                }
            />
        </div>
    );
};

export default EditGame;
