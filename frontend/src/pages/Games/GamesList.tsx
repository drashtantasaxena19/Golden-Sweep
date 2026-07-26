import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import gameService from "../../services/gameService";
import type {
    GameFilter,
    GameResponse,
    GameStatisticsResponse,
} from "../../types/game";
import GameFilters from "../../components/admin/games/GameFilters";
import GameStatistics from "../../components/admin/games/GameStatistics";
import GameTable from "../../components/admin/games/GameTable";

const emptyStatistics: GameStatisticsResponse = {
    total_games: 0,
    published_games: 0,
    draft_games: 0,
    maintenance_games: 0,
    disabled_games: 0,
    featured_games: 0,
    landing_page_games: 0,
    total_play_count: 0,
};

const GamesList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<GameResponse[]>([]);
    const [statistics, setStatistics] =
        useState<GameStatisticsResponse>(emptyStatistics);
    const [filters, setFilters] = useState<GameFilter>({
        page: 1,
        limit: 20,
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [list, stats] = await Promise.all([
                gameService.listAdminGames(filters),
                gameService.getStatistics(),
            ]);
            setGames(list.games);
            setStatistics(stats);
        } catch (error) {
            console.error("Unable to load games:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const deleteGame = async (game: GameResponse) => {
        if (!window.confirm(`Delete "${game.name}"?`)) {
            return;
        }

        await gameService.deleteGame(game.id);
        await loadData();
    };

    return (
        <div className="space-y-6 text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Games
                    </h1>
                    <p className="mt-1 text-slate-500">
                        GoldenSweep Games Management
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin/games/create")
                    }
                    className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-400"
                >
                    <Plus size={18} />
                    Create Game
                </button>
            </div>

            <GameStatistics
                statistics={statistics}
                loading={loading && games.length === 0}
            />

            <GameFilters
                filters={filters}
                onChange={setFilters}
            />

            <GameTable
                games={games}
                loading={loading}
                onView={(game) =>
                    navigate(`/admin/games/${game.id}`)
                }
                onEdit={(game) =>
                    navigate(
                        `/admin/games/${game.id}/edit`
                    )
                }
                onDelete={(game) => void deleteGame(game)}
            />
        </div>
    );
};

export default GamesList;
