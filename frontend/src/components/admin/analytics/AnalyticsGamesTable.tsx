import type { GamePerformanceItem } from "../../types/analytics";

interface AnalyticsGamesTableProps {
  games: GamePerformanceItem[];
}

const AnalyticsGamesTable = ({ games }: AnalyticsGamesTableProps) => {
  if (!games.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
        No game performance data is available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-3 font-medium">Game</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Provider</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Plays</th>
            <th className="px-3 py-3 text-right font-medium">Share</th>
          </tr>
        </thead>

        <tbody>
          {games.map((game) => (
            <tr
              key={game.game_id}
              className="border-b border-white/5 text-zinc-300 last:border-0"
            >
              <td className="px-3 py-4">
                <p className="font-medium text-white">{game.name}</p>
                <p className="mt-1 text-xs text-zinc-600">{game.slug}</p>
              </td>
              <td className="px-3 py-4 capitalize">{game.category}</td>
              <td className="px-3 py-4">
                {game.provider_name ?? "Internal"}
              </td>
              <td className="px-3 py-4">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize">
                  {game.status}
                </span>
              </td>
              <td className="px-3 py-4 text-right font-medium text-white">
                {game.play_count.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-4 text-right text-amber-300">
                {game.percentage_of_total_plays.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsGamesTable;
