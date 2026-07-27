export type AnalyticsGranularity = "hour" | "day" | "week" | "month";

export type AnalyticsExportFormat = "csv" | "xlsx" | "pdf";

export type AnalyticsSection =
    | "overview"
    | "revenue"
    | "users"
    | "wallet"
    | "transactions"
    | "games"
    | "full";

export interface AnalyticsDateRange {
    start_date: string;
    end_date: string;
    granularity: AnalyticsGranularity;
}

export interface AnalyticsQueryParams {
    start_date?: string;
    end_date?: string;
    granularity?: AnalyticsGranularity;
}

export interface GameAnalyticsQueryParams extends AnalyticsQueryParams {
    top_limit?: number;
}

export interface AnalyticsChartPoint {
    label: string;
    date: string;
    value: number;
}

export interface AnalyticsCountChartPoint {
    label: string;
    date: string;
    value: number;
}

export interface AnalyticsCategoryValue {
    label: string;
    value: number;
    percentage: number;
}

export interface AnalyticsCountCategory {
    label: string;
    value: number;
    percentage: number;
}

export interface AnalyticsGrowthMetric {
    current_value: number;
    previous_value: number;
    change: number;
    growth_percentage: number;
}

export interface AnalyticsCountGrowthMetric {
    current_value: number;
    previous_value: number;
    change: number;
    growth_percentage: number;
}

export interface AnalyticsOverviewUsers {
    total_users: number;
    total_players: number;
    active_users: number;
    pending_users: number;
    suspended_users: number;
    blocked_users: number;
    verified_users: number;
    unverified_users: number;
    new_users_today: number;
    new_users_in_range: number;
    returning_users: number;
    growth_percentage: number;
}

export interface AnalyticsOverviewWallet {
    total_wallets: number;
    active_wallets: number;
    frozen_wallets: number;
    zero_balance_wallets: number;
    positive_balance_wallets: number;
    total_coins_in_circulation: number;
    average_wallet_balance: number;
}

export interface AnalyticsOverviewTransactions {
    total_transactions: number;
    purchase_transactions: number;
    game_entry_transactions: number;
    admin_credit_transactions: number;
    admin_debit_transactions: number;
    refund_transactions: number;
    total_credited_coins: number;
    total_debited_coins: number;
    net_coin_flow: number;
    average_transaction_amount: number;
    transactions_today: number;
}

export interface AnalyticsOverviewGames {
    total_games: number;
    published_games: number;
    draft_games: number;
    maintenance_games: number;
    disabled_games: number;
    featured_games: number;
    landing_page_games: number;
    total_play_count: number;
    games_played_today: number;
}

export interface AnalyticsOverviewRecharge {
    total_packages: number;
    active_packages: number;
    inactive_packages: number;
    lowest_price: number;
    highest_price: number;
    total_base_coins: number;
    total_bonus_coins: number;
}

export interface AnalyticsOverviewKpis {
    daily_active_users: number;
    monthly_active_users: number;
    average_revenue_per_user: number;
    wallet_conversion_rate: number;
    verified_user_rate: number;
    active_user_rate: number;
}

export interface AnalyticsOverviewResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    users: AnalyticsOverviewUsers;
    wallet: AnalyticsOverviewWallet;
    transactions: AnalyticsOverviewTransactions;
    games: AnalyticsOverviewGames;
    recharge: AnalyticsOverviewRecharge;
    kpis: AnalyticsOverviewKpis;
}

export interface RevenueSummary {
    total_credited_coins: number;
    total_debited_coins: number;
    purchase_coins: number;
    refund_coins: number;
    game_entry_coins: number;
    admin_credit_coins: number;
    admin_debit_coins: number;
    net_coin_flow: number;
    average_credit_amount: number;
    average_debit_amount: number;
    average_revenue_per_user: number;
    growth_percentage: number;
}

export interface RevenueAnalyticsResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    summary: RevenueSummary;
    revenue_trend: AnalyticsChartPoint[];
    credit_trend: AnalyticsChartPoint[];
    debit_trend: AnalyticsChartPoint[];
    revenue_by_transaction_type: AnalyticsCategoryValue[];
}

export interface UserAnalyticsSummary {
    total_users: number;
    total_players: number;
    admin_users: number;
    super_admin_users: number;
    active_users: number;
    pending_users: number;
    suspended_users: number;
    blocked_users: number;
    verified_users: number;
    unverified_users: number;
    new_users_in_range: number;
    returning_users: number;
    daily_active_users: number;
    monthly_active_users: number;
    growth_percentage: number;
    active_user_rate: number;
    verification_rate: number;
}

export interface UserAnalyticsResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    summary: UserAnalyticsSummary;
    registration_growth: AnalyticsCountChartPoint[];
    users_by_role: AnalyticsCountCategory[];
    users_by_status: AnalyticsCountCategory[];
    users_by_country: AnalyticsCountCategory[];
    users_by_language: AnalyticsCountCategory[];
    verification_distribution: AnalyticsCountCategory[];
}

export interface WalletAnalyticsSummary {
    total_wallets: number;
    active_wallets: number;
    frozen_wallets: number;
    zero_balance_wallets: number;
    positive_balance_wallets: number;
    total_coins_in_circulation: number;
    average_wallet_balance: number;
    minimum_wallet_balance: number;
    maximum_wallet_balance: number;
    frozen_wallet_rate: number;
    wallet_conversion_rate: number;
}

export interface WalletBalanceBucket {
    label: string;
    minimum_balance: number;
    maximum_balance: number | null;
    wallet_count: number;
    percentage: number;
}

export interface WalletAnalyticsResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    summary: WalletAnalyticsSummary;
    wallet_growth: AnalyticsCountChartPoint[];
    balance_trend: AnalyticsChartPoint[];
    balance_distribution: WalletBalanceBucket[];
}

export interface TransactionAnalyticsSummary {
    total_transactions: number;
    purchase_transactions: number;
    game_entry_transactions: number;
    admin_credit_transactions: number;
    admin_debit_transactions: number;
    refund_transactions: number;
    total_credited_coins: number;
    total_debited_coins: number;
    net_coin_flow: number;
    average_transaction_amount: number;
    minimum_transaction_amount: number;
    maximum_transaction_amount: number;
}

export interface TransactionHourlyPoint {
    hour: number;
    label: string;
    transaction_count: number;
    total_amount: number;
}

export interface TransactionAnalyticsResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    summary: TransactionAnalyticsSummary;
    transaction_trend: AnalyticsCountChartPoint[];
    amount_trend: AnalyticsChartPoint[];
    transactions_by_type: AnalyticsCountCategory[];
    amount_by_type: AnalyticsCategoryValue[];
    hourly_distribution: TransactionHourlyPoint[];
}

export interface GameAnalyticsSummary {
    total_games: number;
    published_games: number;
    draft_games: number;
    maintenance_games: number;
    disabled_games: number;
    featured_games: number;
    landing_page_games: number;
    total_play_count: number;
    average_plays_per_game: number;
    published_rate: number;
    featured_rate: number;
}

export interface GamePerformanceItem {
    game_id: string;
    name: string;
    slug: string;
    category: string;
    provider_name: string | null;
    status: string;
    is_featured: boolean;
    show_on_landing_page: boolean;
    play_count: number;
    percentage_of_total_plays: number;
}

export interface GameAnalyticsResponse {
    range: AnalyticsDateRange;
    generated_at: string;
    summary: GameAnalyticsSummary;
    game_creation_trend: AnalyticsCountChartPoint[];
    games_by_status: AnalyticsCountCategory[];
    games_by_category: AnalyticsCountCategory[];
    games_by_provider: AnalyticsCountCategory[];
    plays_by_category: AnalyticsCategoryValue[];
    plays_by_provider: AnalyticsCategoryValue[];
    top_games: GamePerformanceItem[];
    least_played_games: GamePerformanceItem[];
}

export interface AnalyticsExportRequest {
    format: AnalyticsExportFormat;
    section?: AnalyticsSection;
    start_date?: string | null;
    end_date?: string | null;
    granularity?: AnalyticsGranularity;
}

export interface AnalyticsExportResponse {
    success: boolean;
    format: AnalyticsExportFormat;
    section: string;
    filename: string;
    content_type: string;
    generated_at: string;
}

export interface FullAnalyticsResponse {
    overview: AnalyticsOverviewResponse;
    revenue: RevenueAnalyticsResponse;
    users: UserAnalyticsResponse;
    wallet: WalletAnalyticsResponse;
    transactions: TransactionAnalyticsResponse;
    games: GameAnalyticsResponse;
}

export type AnalyticsResponseBySection = {
    overview: AnalyticsOverviewResponse;
    revenue: RevenueAnalyticsResponse;
    users: UserAnalyticsResponse;
    wallet: WalletAnalyticsResponse;
    transactions: TransactionAnalyticsResponse;
    games: GameAnalyticsResponse;
    full: FullAnalyticsResponse;
};