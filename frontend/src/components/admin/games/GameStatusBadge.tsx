import {
    GAME_STATUS_LABELS,
} from "../../../types/game";
import type { GameStatus } from "../../../types/game";

const STATUS_STYLES: Record<GameStatus, string> = {
    draft: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    published:
        "border-green-500/20 bg-green-500/10 text-green-300",
    maintenance:
        "border-orange-500/20 bg-orange-500/10 text-orange-300",
    disabled:
        "border-red-500/20 bg-red-500/10 text-red-300",
};

const GameStatusBadge = ({
    status,
}: {
    status: GameStatus;
}) => (
    <span
        className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${STATUS_STYLES[status]}`}
    >
        {GAME_STATUS_LABELS[status]}
    </span>
);

export default GameStatusBadge;
