import {
    Eye,
    ImageOff,
    Loader2,
    Pencil,
    Star,
    Trash2,
} from "lucide-react";

import gameService from "../../../services/gameService";
import type { GameResponse } from "../../../types/game";
import GameStatusBadge from "./GameStatusBadge";

interface GameTableProps {
    games?: GameResponse[] | null;
    loading?: boolean;
    onView: (game: GameResponse) => void;
    onEdit: (game: GameResponse) => void;
    onDelete: (game: GameResponse) => void;
}

const GameTable = ({
    games = [],
    loading = false,
    onView,
    onEdit,
    onDelete,
}: GameTableProps) => {
    const safeGames = Array.isArray(games) ? games : [];

    return (
        <div className="overflow-hidden rounded-2xl border border-yellow-500/15 bg-[#0A0C12]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="border-b border-white/10 bg-[#11141C] text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Game</th>
                            <th className="px-4 py-3">
                                Provider
                            </th>
                            <th className="px-4 py-3">
                                Category
                            </th>
                            <th className="px-4 py-3">
                                Status
                            </th>
                            <th className="px-4 py-3">
                                Updated
                            </th>
                            <th className="px-4 py-3 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {loading && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-12 text-center"
                                >
                                    <Loader2
                                        size={28}
                                        className="mx-auto animate-spin text-yellow-500"
                                    />
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            safeGames.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-slate-500"
                                    >
                                        No games found.
                                    </td>
                                </tr>
                            )}

                        {!loading &&
                            safeGames.map((game) => {
                                const imageUrl =
                                    gameService.getImageUrl(
                                        game.thumbnail_file_id ??
                                            game.logo_file_id
                                    );

                                return (
                                    <tr
                                        key={game.id}
                                        className="transition hover:bg-white/[0.03]"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {imageUrl ? (
                                                    <img
                                                        src={
                                                            imageUrl
                                                        }
                                                        alt={
                                                            game.name
                                                        }
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#11141C] text-slate-600">
                                                        <ImageOff
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="flex items-center gap-1 font-medium text-white">
                                                        <span className="max-w-[220px] truncate">
                                                            {
                                                                game.name
                                                            }
                                                        </span>
                                                        {game.is_featured && (
                                                            <Star
                                                                size={
                                                                    14
                                                                }
                                                                className="fill-yellow-400 text-yellow-400"
                                                            />
                                                        )}
                                                    </p>
                                                    <p className="max-w-[220px] truncate text-xs text-slate-500">
                                                        {
                                                            game.slug
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-slate-400">
                                            {game.provider_name ??
                                                "—"}
                                        </td>
                                        <td className="px-4 py-3 capitalize text-slate-400">
                                            {game.category}
                                        </td>
                                        <td className="px-4 py-3">
                                            <GameStatusBadge
                                                status={
                                                    game.status
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {new Date(
                                                game.updated_at
                                            ).toLocaleDateString(
                                                "en-US"
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Action
                                                    label="View"
                                                    onClick={() =>
                                                        onView(
                                                            game
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </Action>
                                                <Action
                                                    label="Edit"
                                                    onClick={() =>
                                                        onEdit(
                                                            game
                                                        )
                                                    }
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </Action>
                                                <Action
                                                    label="Delete"
                                                    danger
                                                    onClick={() =>
                                                        onDelete(
                                                            game
                                                        )
                                                    }
                                                >
                                                    <Trash2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </Action>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Action = ({
    label,
    danger = false,
    onClick,
    children,
}: {
    label: string;
    danger?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`rounded-lg border p-2 transition ${
            danger
                ? "border-red-400/20 text-red-300 hover:bg-red-500/10"
                : "border-white/10 text-slate-300 hover:bg-white/5"
        }`}
    >
        {children}
    </button>
);

export default GameTable;
