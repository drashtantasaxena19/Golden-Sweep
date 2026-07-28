import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AnalyticsDistribution,
  AnalyticsExportMenu,
  AnalyticsFilters,
  AnalyticsGamesTable,
  AnalyticsLineChart,
  AnalyticsPanel,
  AnalyticsStatCard,
} from "../../components/admin/analytics";
import analyticsService, {
  formatAnalyticsDateTime,
  formatAnalyticsNumber,
  formatAnalyticsPercentage,
  getAnalyticsPresetRange,
  type AnalyticsDashboardData,
  type AnalyticsPreset,
} from "../../services/analyticsService";
import type {
  AnalyticsExportFormat,
  AnalyticsGranularity,
  AnalyticsSection,
} from "../../types/analytics";

type DashboardTab =
  | "overview"
  | "revenue"
  | "users"
  | "wallet"
  | "transactions"
  | "games";

const tabs: Array<{ value: DashboardTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "revenue", label: "Revenue" },
  { value: "users", label: "Users" },
  { value: "wallet", label: "Wallet" },
  { value: "transactions", label: "Transactions" },
  { value: "games", label: "Games" },
];

const toInputDate = (
  value: Date | string | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AdminAnalytics = () => {
  const initialRange = useMemo(
    () => getAnalyticsPresetRange("last_30_days"),
    [],
  );

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");
  const [preset, setPreset] =
    useState<AnalyticsPreset>("last_30_days");
  const [startDate, setStartDate] = useState(
    toInputDate(initialRange.startDate),
  );
  const [endDate, setEndDate] = useState(
    toInputDate(initialRange.endDate),
  );
  const [granularity, setGranularity] =
    useState<AnalyticsGranularity>(initialRange.granularity);
  const [data, setData] = useState<AnalyticsDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestRange = useMemo(
    () => ({
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59.999` : undefined,
      granularity,
    }),
    [endDate, granularity, startDate],
  );

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getDashboard(
        requestRange,
        10,
      );
      setData(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Analytics could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestRange]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const handlePresetChange = (nextPreset: AnalyticsPreset) => {
    const range = getAnalyticsPresetRange(nextPreset);

    setPreset(nextPreset);
    setStartDate(toInputDate(range.startDate));
    setEndDate(toInputDate(range.endDate));
    setGranularity(range.granularity);
  };

  const handleExport = async (
    format: AnalyticsExportFormat,
    section: AnalyticsSection,
  ) => {
    setExporting(true);
    setError(null);

    try {
      await analyticsService.downloadExport({
        ...requestRange,
        format,
        section,
      });
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Analytics export failed.",
      );
    } finally {
      setExporting(false);
    }
  };

  const overview = data?.overview;
  const revenue = data?.revenue;
  const users = data?.users;
  const wallet = data?.wallet;
  const transactions = data?.transactions;
  const games = data?.games;

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-400">
              GoldenSweep Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Track players, coin flow, wallets, transactions, games,
              recharge packages, and platform growth from one place.
            </p>
          </div>

          <AnalyticsExportMenu
            loading={exporting}
            onExport={handleExport}
          />
        </header>

        <AnalyticsFilters
          preset={preset}
          granularity={granularity}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          onPresetChange={handlePresetChange}
          onGranularityChange={setGranularity}
          onStartDateChange={(value) => {
            setPreset("last_30_days");
            setStartDate(value);
          }}
          onEndDateChange={(value) => {
            setPreset("last_30_days");
            setEndDate(value);
          }}
          onApply={() => void loadAnalytics()}
          onRefresh={() => void loadAnalytics()}
        />

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {data ? (
          <p className="mt-4 text-right text-xs text-zinc-600">
            Generated {formatAnalyticsDateTime(data.overview.generated_at)}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={
                activeTab === tab.value
                  ? "shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black"
                  : "shrink-0 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <div className="mt-8 grid min-h-80 place-items-center rounded-3xl border border-white/10 bg-zinc-950/70 text-sm text-zinc-500">
            Loading analytics…
          </div>
        ) : null}

        {activeTab === "overview" && overview ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Total players"
                value={formatAnalyticsNumber(overview.users.total_players)}
                trend={overview.users.growth_percentage}
                helper={`${formatAnalyticsNumber(
                  overview.users.new_users_in_range,
                )} new in selected period`}
              />
              <AnalyticsStatCard
                label="Coins in circulation"
                value={formatAnalyticsNumber(
                  overview.wallet.total_coins_in_circulation,
                )}
                helper={`${formatAnalyticsNumber(
                  overview.wallet.active_wallets,
                )} active wallets`}
              />
              <AnalyticsStatCard
                label="Transactions"
                value={formatAnalyticsNumber(
                  overview.transactions.total_transactions,
                )}
                helper={`${formatAnalyticsNumber(
                  overview.transactions.transactions_today,
                )} today`}
              />
              <AnalyticsStatCard
                label="Total game plays"
                value={formatAnalyticsNumber(
                  overview.games.total_play_count,
                )}
                helper={`${formatAnalyticsNumber(
                  overview.games.published_games,
                )} published games`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsPanel title="Platform KPIs">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    [
                      "Daily active users",
                      formatAnalyticsNumber(
                        overview.kpis.daily_active_users,
                      ),
                    ],
                    [
                      "Monthly active users",
                      formatAnalyticsNumber(
                        overview.kpis.monthly_active_users,
                      ),
                    ],
                    [
                      "Average revenue per user",
                      formatAnalyticsNumber(
                        overview.kpis.average_revenue_per_user,
                      ),
                    ],
                    [
                      "Wallet conversion",
                      formatAnalyticsPercentage(
                        overview.kpis.wallet_conversion_rate,
                      ),
                    ],
                    [
                      "Verified user rate",
                      formatAnalyticsPercentage(
                        overview.kpis.verified_user_rate,
                      ),
                    ],
                    [
                      "Active user rate",
                      formatAnalyticsPercentage(
                        overview.kpis.active_user_rate,
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-xs uppercase tracking-wider text-zinc-600">
                        {label}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </AnalyticsPanel>

              <AnalyticsPanel title="Recharge packages">
                <AnalyticsDistribution
                  items={[
                    {
                      label: "Active packages",
                      value: overview.recharge.active_packages,
                      percentage: overview.recharge.total_packages
                        ? (overview.recharge.active_packages /
                            overview.recharge.total_packages) *
                          100
                        : 0,
                    },
                    {
                      label: "Inactive packages",
                      value: overview.recharge.inactive_packages,
                      percentage: overview.recharge.total_packages
                        ? (overview.recharge.inactive_packages /
                            overview.recharge.total_packages) *
                          100
                        : 0,
                    },
                  ]}
                />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.03] p-4">
                    <p className="text-xs text-zinc-600">Base coins</p>
                    <p className="mt-2 font-semibold text-white">
                      {formatAnalyticsNumber(
                        overview.recharge.total_base_coins,
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-4">
                    <p className="text-xs text-zinc-600">Bonus coins</p>
                    <p className="mt-2 font-semibold text-amber-300">
                      {formatAnalyticsNumber(
                        overview.recharge.total_bonus_coins,
                      )}
                    </p>
                  </div>
                </div>
              </AnalyticsPanel>
            </div>
          </div>
        ) : null}

        {activeTab === "revenue" && revenue ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Credited coins"
                value={formatAnalyticsNumber(
                  revenue.summary.total_credited_coins,
                )}
                trend={revenue.summary.growth_percentage}
              />
              <AnalyticsStatCard
                label="Debited coins"
                value={formatAnalyticsNumber(
                  revenue.summary.total_debited_coins,
                )}
              />
              <AnalyticsStatCard
                label="Net coin flow"
                value={formatAnalyticsNumber(
                  revenue.summary.net_coin_flow,
                )}
              />
              <AnalyticsStatCard
                label="Average revenue / user"
                value={formatAnalyticsNumber(
                  revenue.summary.average_revenue_per_user,
                )}
              />
            </div>

            <AnalyticsPanel
              title="Revenue trend"
              description="Net credited minus debited coin movement."
            >
              <AnalyticsLineChart data={revenue.revenue_trend} />
            </AnalyticsPanel>

            <AnalyticsPanel title="Revenue by transaction type">
              <AnalyticsDistribution
                items={revenue.revenue_by_transaction_type}
              />
            </AnalyticsPanel>
          </div>
        ) : null}

        {activeTab === "users" && users ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Total users"
                value={formatAnalyticsNumber(users.summary.total_users)}
                trend={users.summary.growth_percentage}
              />
              <AnalyticsStatCard
                label="Active users"
                value={formatAnalyticsNumber(users.summary.active_users)}
                helper={formatAnalyticsPercentage(
                  users.summary.active_user_rate,
                )}
              />
              <AnalyticsStatCard
                label="Verified users"
                value={formatAnalyticsNumber(
                  users.summary.verified_users,
                )}
                helper={formatAnalyticsPercentage(
                  users.summary.verification_rate,
                )}
              />
              <AnalyticsStatCard
                label="Returning users"
                value={formatAnalyticsNumber(
                  users.summary.returning_users,
                )}
              />
            </div>

            <AnalyticsPanel title="Registration growth">
              <AnalyticsLineChart data={users.registration_growth} />
            </AnalyticsPanel>

            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsPanel title="Users by status">
                <AnalyticsDistribution items={users.users_by_status} />
              </AnalyticsPanel>
              <AnalyticsPanel title="Users by country">
                <AnalyticsDistribution items={users.users_by_country} />
              </AnalyticsPanel>
            </div>
          </div>
        ) : null}

        {activeTab === "wallet" && wallet ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Total wallets"
                value={formatAnalyticsNumber(
                  wallet.summary.total_wallets,
                )}
              />
              <AnalyticsStatCard
                label="Active wallets"
                value={formatAnalyticsNumber(
                  wallet.summary.active_wallets,
                )}
                helper={formatAnalyticsPercentage(
                  wallet.summary.wallet_conversion_rate,
                )}
              />
              <AnalyticsStatCard
                label="Coins in circulation"
                value={formatAnalyticsNumber(
                  wallet.summary.total_coins_in_circulation,
                )}
              />
              <AnalyticsStatCard
                label="Average balance"
                value={formatAnalyticsNumber(
                  wallet.summary.average_wallet_balance,
                )}
              />
            </div>

            <AnalyticsPanel title="Wallet growth">
              <AnalyticsLineChart data={wallet.wallet_growth} />
            </AnalyticsPanel>

            <AnalyticsPanel title="Balance distribution">
              <AnalyticsDistribution
                items={wallet.balance_distribution.map((bucket) => ({
                  label: bucket.label,
                  value: bucket.wallet_count,
                  percentage: bucket.percentage,
                }))}
              />
            </AnalyticsPanel>
          </div>
        ) : null}

        {activeTab === "transactions" && transactions ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Transactions"
                value={formatAnalyticsNumber(
                  transactions.summary.total_transactions,
                )}
              />
              <AnalyticsStatCard
                label="Credited coins"
                value={formatAnalyticsNumber(
                  transactions.summary.total_credited_coins,
                )}
              />
              <AnalyticsStatCard
                label="Debited coins"
                value={formatAnalyticsNumber(
                  transactions.summary.total_debited_coins,
                )}
              />
              <AnalyticsStatCard
                label="Average amount"
                value={formatAnalyticsNumber(
                  transactions.summary.average_transaction_amount,
                )}
              />
            </div>

            <AnalyticsPanel title="Transaction volume">
              <AnalyticsLineChart
                data={transactions.transaction_trend}
              />
            </AnalyticsPanel>

            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsPanel title="Transactions by type">
                <AnalyticsDistribution
                  items={transactions.transactions_by_type}
                />
              </AnalyticsPanel>
              <AnalyticsPanel title="Amount by type">
                <AnalyticsDistribution
                  items={transactions.amount_by_type}
                />
              </AnalyticsPanel>
            </div>
          </div>
        ) : null}

        {activeTab === "games" && games ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AnalyticsStatCard
                label="Total games"
                value={formatAnalyticsNumber(games.summary.total_games)}
              />
              <AnalyticsStatCard
                label="Published games"
                value={formatAnalyticsNumber(
                  games.summary.published_games,
                )}
                helper={formatAnalyticsPercentage(
                  games.summary.published_rate,
                )}
              />
              <AnalyticsStatCard
                label="Total plays"
                value={formatAnalyticsNumber(
                  games.summary.total_play_count,
                )}
              />
              <AnalyticsStatCard
                label="Average plays / game"
                value={formatAnalyticsNumber(
                  games.summary.average_plays_per_game,
                )}
              />
            </div>

            <AnalyticsPanel title="Game creation trend">
              <AnalyticsLineChart data={games.game_creation_trend} />
            </AnalyticsPanel>

            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsPanel title="Games by category">
                <AnalyticsDistribution items={games.games_by_category} />
              </AnalyticsPanel>
              <AnalyticsPanel title="Plays by category">
                <AnalyticsDistribution items={games.plays_by_category} />
              </AnalyticsPanel>
            </div>

            <AnalyticsPanel title="Top performing games">
              <AnalyticsGamesTable games={games.top_games} />
            </AnalyticsPanel>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default AdminAnalytics;
