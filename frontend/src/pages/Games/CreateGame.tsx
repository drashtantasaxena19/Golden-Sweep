import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import GameForm from "../../components/admin/games/GameForm";
import gameService from "../../services/gameService";
import { getApiErrorMessage } from "../../utils/gameError";
import type {
    GameCreate,
    NewGameImageFiles,
} from "../../types/game";

const CreateGame = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreate = async (
        values: GameCreate,
        files: NewGameImageFiles
    ) => {
        try {
            setLoading(true);
            const result =
                await gameService.createGameWithImages(
                    values,
                    files
                );
            navigate(`/admin/games/${result.game.id}`);
        } catch (error: unknown) {
            console.error("Create game failed:", error);
            alert(
                getApiErrorMessage(
                    error,
                    "Unable to create the game."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-slate-200">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/admin/games")}
                    aria-label="Back to games"
                    className="rounded-xl border border-yellow-400/20 bg-[#11141C] p-2.5 text-slate-300 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Create Game
                    </h1>
                    <p className="mt-1 text-slate-500">
                        Create a draft and upload its required logo.
                    </p>
                </div>
            </div>

            <GameForm
                mode="create"
                loading={loading}
                onSubmit={handleCreate}
                onCancel={() => navigate("/admin/games")}
            />
        </div>
    );
};

export default CreateGame;
