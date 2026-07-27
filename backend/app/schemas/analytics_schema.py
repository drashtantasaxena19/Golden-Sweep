from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


AnalyticsGranularity = Literal["hour", "day", "week", "month"]
AnalyticsExportFormat = Literal["csv", "xlsx", "pdf"]


class AnalyticsBaseSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )


class AnalyticsDateRangeSchema(AnalyticsBaseSchema):
    start_date: datetime
    end_date: datetime
    granularity: AnalyticsGranularity

    @model_validator(mode="after")
    def validate_date_range(self) -> "AnalyticsDateRangeSchema":
        if self.start_date > self.end_date:
            raise ValueError("start_date must be earlier than or equal to end_date.")

        return self


class AnalyticsChartPointSchema(AnalyticsBaseSchema):
    label: str = Field(min_length=1, max_length=120)
    date: datetime
    value: float = 0


class AnalyticsCountChartPointSchema(AnalyticsBaseSchema):
    label: str = Field(min_length=1, max_length=120)
    date: datetime
    value: int = Field(default=0, ge=0)


class AnalyticsCategoryValueSchema(AnalyticsBaseSchema):
    label: str = Field(min_length=1, max_length=160)
    value: float = 0
    percentage: float = Field(default=0, ge=0, le=100)


class AnalyticsCountCategorySchema(AnalyticsBaseSchema):
    label: str = Field(min_length=1, max_length=160)
    value: int = Field(default=0, ge=0)
    percentage: float = Field(default=0, ge=0, le=100)


class AnalyticsGrowthMetricSchema(AnalyticsBaseSchema):
    current_value: float = 0
    previous_value: float = 0
    change: float = 0
    growth_percentage: float = 0


class AnalyticsCountGrowthMetricSchema(AnalyticsBaseSchema):
    current_value: int = Field(default=0, ge=0)
    previous_value: int = Field(default=0, ge=0)
    change: int = 0
    growth_percentage: float = 0


class AnalyticsOverviewUsersSchema(AnalyticsBaseSchema):
    total_users: int = Field(default=0, ge=0)
    total_players: int = Field(default=0, ge=0)
    active_users: int = Field(default=0, ge=0)
    pending_users: int = Field(default=0, ge=0)
    suspended_users: int = Field(default=0, ge=0)
    blocked_users: int = Field(default=0, ge=0)
    verified_users: int = Field(default=0, ge=0)
    unverified_users: int = Field(default=0, ge=0)
    new_users_today: int = Field(default=0, ge=0)
    new_users_in_range: int = Field(default=0, ge=0)
    returning_users: int = Field(default=0, ge=0)
    growth_percentage: float = 0


class AnalyticsOverviewWalletSchema(AnalyticsBaseSchema):
    total_wallets: int = Field(default=0, ge=0)
    active_wallets: int = Field(default=0, ge=0)
    frozen_wallets: int = Field(default=0, ge=0)
    zero_balance_wallets: int = Field(default=0, ge=0)
    positive_balance_wallets: int = Field(default=0, ge=0)
    total_coins_in_circulation: int = Field(default=0, ge=0)
    average_wallet_balance: float = Field(default=0, ge=0)


class AnalyticsOverviewTransactionsSchema(AnalyticsBaseSchema):
    total_transactions: int = Field(default=0, ge=0)
    purchase_transactions: int = Field(default=0, ge=0)
    game_entry_transactions: int = Field(default=0, ge=0)
    admin_credit_transactions: int = Field(default=0, ge=0)
    admin_debit_transactions: int = Field(default=0, ge=0)
    refund_transactions: int = Field(default=0, ge=0)
    total_credited_coins: int = Field(default=0, ge=0)
    total_debited_coins: int = Field(default=0, ge=0)
    net_coin_flow: int = 0
    average_transaction_amount: float = Field(default=0, ge=0)
    transactions_today: int = Field(default=0, ge=0)


class AnalyticsOverviewGamesSchema(AnalyticsBaseSchema):
    total_games: int = Field(default=0, ge=0)
    published_games: int = Field(default=0, ge=0)
    draft_games: int = Field(default=0, ge=0)
    maintenance_games: int = Field(default=0, ge=0)
    disabled_games: int = Field(default=0, ge=0)
    featured_games: int = Field(default=0, ge=0)
    landing_page_games: int = Field(default=0, ge=0)
    total_play_count: int = Field(default=0, ge=0)
    games_played_today: int = Field(default=0, ge=0)


class AnalyticsOverviewRechargeSchema(AnalyticsBaseSchema):
    total_packages: int = Field(default=0, ge=0)
    active_packages: int = Field(default=0, ge=0)
    inactive_packages: int = Field(default=0, ge=0)
    lowest_price: float = Field(default=0, ge=0)
    highest_price: float = Field(default=0, ge=0)
    total_base_coins: int = Field(default=0, ge=0)
    total_bonus_coins: int = Field(default=0, ge=0)


class AnalyticsOverviewKpisSchema(AnalyticsBaseSchema):
    daily_active_users: int = Field(default=0, ge=0)
    monthly_active_users: int = Field(default=0, ge=0)
    average_revenue_per_user: float = Field(default=0, ge=0)
    wallet_conversion_rate: float = Field(default=0, ge=0, le=100)
    verified_user_rate: float = Field(default=0, ge=0, le=100)
    active_user_rate: float = Field(default=0, ge=0, le=100)


class AnalyticsOverviewResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    users: AnalyticsOverviewUsersSchema
    wallet: AnalyticsOverviewWalletSchema
    transactions: AnalyticsOverviewTransactionsSchema
    games: AnalyticsOverviewGamesSchema
    recharge: AnalyticsOverviewRechargeSchema
    kpis: AnalyticsOverviewKpisSchema


class RevenueSummarySchema(AnalyticsBaseSchema):
    total_credited_coins: int = Field(default=0, ge=0)
    total_debited_coins: int = Field(default=0, ge=0)
    purchase_coins: int = Field(default=0, ge=0)
    refund_coins: int = Field(default=0, ge=0)
    game_entry_coins: int = Field(default=0, ge=0)
    admin_credit_coins: int = Field(default=0, ge=0)
    admin_debit_coins: int = Field(default=0, ge=0)
    net_coin_flow: int = 0
    average_credit_amount: float = Field(default=0, ge=0)
    average_debit_amount: float = Field(default=0, ge=0)
    average_revenue_per_user: float = Field(default=0, ge=0)
    growth_percentage: float = 0


class RevenueAnalyticsResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    summary: RevenueSummarySchema
    revenue_trend: list[AnalyticsChartPointSchema] = Field(default_factory=list)
    credit_trend: list[AnalyticsChartPointSchema] = Field(default_factory=list)
    debit_trend: list[AnalyticsChartPointSchema] = Field(default_factory=list)
    revenue_by_transaction_type: list[AnalyticsCategoryValueSchema] = Field(
        default_factory=list
    )


class UserAnalyticsSummarySchema(AnalyticsBaseSchema):
    total_users: int = Field(default=0, ge=0)
    total_players: int = Field(default=0, ge=0)
    admin_users: int = Field(default=0, ge=0)
    super_admin_users: int = Field(default=0, ge=0)
    active_users: int = Field(default=0, ge=0)
    pending_users: int = Field(default=0, ge=0)
    suspended_users: int = Field(default=0, ge=0)
    blocked_users: int = Field(default=0, ge=0)
    verified_users: int = Field(default=0, ge=0)
    unverified_users: int = Field(default=0, ge=0)
    new_users_in_range: int = Field(default=0, ge=0)
    returning_users: int = Field(default=0, ge=0)
    daily_active_users: int = Field(default=0, ge=0)
    monthly_active_users: int = Field(default=0, ge=0)
    growth_percentage: float = 0
    active_user_rate: float = Field(default=0, ge=0, le=100)
    verification_rate: float = Field(default=0, ge=0, le=100)


class UserAnalyticsResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    summary: UserAnalyticsSummarySchema
    registration_growth: list[AnalyticsCountChartPointSchema] = Field(
        default_factory=list
    )
    users_by_role: list[AnalyticsCountCategorySchema] = Field(default_factory=list)
    users_by_status: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    users_by_country: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    users_by_language: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    verification_distribution: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )


class WalletAnalyticsSummarySchema(AnalyticsBaseSchema):
    total_wallets: int = Field(default=0, ge=0)
    active_wallets: int = Field(default=0, ge=0)
    frozen_wallets: int = Field(default=0, ge=0)
    zero_balance_wallets: int = Field(default=0, ge=0)
    positive_balance_wallets: int = Field(default=0, ge=0)
    total_coins_in_circulation: int = Field(default=0, ge=0)
    average_wallet_balance: float = Field(default=0, ge=0)
    minimum_wallet_balance: int = Field(default=0, ge=0)
    maximum_wallet_balance: int = Field(default=0, ge=0)
    frozen_wallet_rate: float = Field(default=0, ge=0, le=100)
    wallet_conversion_rate: float = Field(default=0, ge=0, le=100)


class WalletBalanceBucketSchema(AnalyticsBaseSchema):
    label: str = Field(min_length=1, max_length=120)
    minimum_balance: int = Field(default=0, ge=0)
    maximum_balance: int | None = Field(default=None, ge=0)
    wallet_count: int = Field(default=0, ge=0)
    percentage: float = Field(default=0, ge=0, le=100)


class WalletAnalyticsResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    summary: WalletAnalyticsSummarySchema
    wallet_growth: list[AnalyticsCountChartPointSchema] = Field(default_factory=list)
    balance_trend: list[AnalyticsChartPointSchema] = Field(default_factory=list)
    balance_distribution: list[WalletBalanceBucketSchema] = Field(
        default_factory=list
    )


class TransactionAnalyticsSummarySchema(AnalyticsBaseSchema):
    total_transactions: int = Field(default=0, ge=0)
    purchase_transactions: int = Field(default=0, ge=0)
    game_entry_transactions: int = Field(default=0, ge=0)
    admin_credit_transactions: int = Field(default=0, ge=0)
    admin_debit_transactions: int = Field(default=0, ge=0)
    refund_transactions: int = Field(default=0, ge=0)
    total_credited_coins: int = Field(default=0, ge=0)
    total_debited_coins: int = Field(default=0, ge=0)
    net_coin_flow: int = 0
    average_transaction_amount: float = Field(default=0, ge=0)
    minimum_transaction_amount: int = Field(default=0, ge=0)
    maximum_transaction_amount: int = Field(default=0, ge=0)


class TransactionHourlyPointSchema(AnalyticsBaseSchema):
    hour: int = Field(ge=0, le=23)
    label: str = Field(min_length=1, max_length=20)
    transaction_count: int = Field(default=0, ge=0)
    total_amount: int = Field(default=0, ge=0)


class TransactionAnalyticsResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    summary: TransactionAnalyticsSummarySchema
    transaction_trend: list[AnalyticsCountChartPointSchema] = Field(
        default_factory=list
    )
    amount_trend: list[AnalyticsChartPointSchema] = Field(default_factory=list)
    transactions_by_type: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    amount_by_type: list[AnalyticsCategoryValueSchema] = Field(
        default_factory=list
    )
    hourly_distribution: list[TransactionHourlyPointSchema] = Field(
        default_factory=list
    )


class GameAnalyticsSummarySchema(AnalyticsBaseSchema):
    total_games: int = Field(default=0, ge=0)
    published_games: int = Field(default=0, ge=0)
    draft_games: int = Field(default=0, ge=0)
    maintenance_games: int = Field(default=0, ge=0)
    disabled_games: int = Field(default=0, ge=0)
    featured_games: int = Field(default=0, ge=0)
    landing_page_games: int = Field(default=0, ge=0)
    total_play_count: int = Field(default=0, ge=0)
    average_plays_per_game: float = Field(default=0, ge=0)
    published_rate: float = Field(default=0, ge=0, le=100)
    featured_rate: float = Field(default=0, ge=0, le=100)


class GamePerformanceItemSchema(AnalyticsBaseSchema):
    game_id: str = Field(min_length=1)
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140)
    category: str = Field(default="other", min_length=1, max_length=80)
    provider_name: str | None = Field(default=None, max_length=120)
    status: str = Field(default="draft", min_length=1, max_length=40)
    is_featured: bool = False
    show_on_landing_page: bool = False
    play_count: int = Field(default=0, ge=0)
    percentage_of_total_plays: float = Field(default=0, ge=0, le=100)


class GameAnalyticsResponseSchema(AnalyticsBaseSchema):
    range: AnalyticsDateRangeSchema
    generated_at: datetime
    summary: GameAnalyticsSummarySchema
    game_creation_trend: list[AnalyticsCountChartPointSchema] = Field(
        default_factory=list
    )
    games_by_status: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    games_by_category: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    games_by_provider: list[AnalyticsCountCategorySchema] = Field(
        default_factory=list
    )
    plays_by_category: list[AnalyticsCategoryValueSchema] = Field(
        default_factory=list
    )
    plays_by_provider: list[AnalyticsCategoryValueSchema] = Field(
        default_factory=list
    )
    top_games: list[GamePerformanceItemSchema] = Field(default_factory=list)
    least_played_games: list[GamePerformanceItemSchema] = Field(
        default_factory=list
    )


class AnalyticsExportRequestSchema(AnalyticsBaseSchema):
    format: AnalyticsExportFormat
    section: Literal[
        "overview",
        "revenue",
        "users",
        "wallet",
        "transactions",
        "games",
        "full",
    ] = "full"
    start_date: datetime | None = None
    end_date: datetime | None = None
    granularity: AnalyticsGranularity = "day"

    @model_validator(mode="after")
    def validate_export_date_range(self) -> "AnalyticsExportRequestSchema":
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.start_date > self.end_date
        ):
            raise ValueError("start_date must be earlier than or equal to end_date.")

        return self


class AnalyticsExportResponseSchema(AnalyticsBaseSchema):
    success: bool = True
    format: AnalyticsExportFormat
    section: str
    filename: str
    content_type: str
    generated_at: datetime


AnalyticsDateRange = AnalyticsDateRangeSchema
AnalyticsChartPoint = AnalyticsChartPointSchema
AnalyticsCountChartPoint = AnalyticsCountChartPointSchema
AnalyticsCategoryValue = AnalyticsCategoryValueSchema
AnalyticsCountCategory = AnalyticsCountCategorySchema
AnalyticsOverviewResponse = AnalyticsOverviewResponseSchema
RevenueAnalyticsResponse = RevenueAnalyticsResponseSchema
UserAnalyticsResponse = UserAnalyticsResponseSchema
WalletAnalyticsResponse = WalletAnalyticsResponseSchema
TransactionAnalyticsResponse = TransactionAnalyticsResponseSchema
GameAnalyticsResponse = GameAnalyticsResponseSchema
AnalyticsExportRequest = AnalyticsExportRequestSchema
AnalyticsExportResponse = AnalyticsExportResponseSchema


__all__ = [
    "AnalyticsGranularity",
    "AnalyticsExportFormat",
    "AnalyticsBaseSchema",
    "AnalyticsDateRangeSchema",
    "AnalyticsChartPointSchema",
    "AnalyticsCountChartPointSchema",
    "AnalyticsCategoryValueSchema",
    "AnalyticsCountCategorySchema",
    "AnalyticsGrowthMetricSchema",
    "AnalyticsCountGrowthMetricSchema",
    "AnalyticsOverviewUsersSchema",
    "AnalyticsOverviewWalletSchema",
    "AnalyticsOverviewTransactionsSchema",
    "AnalyticsOverviewGamesSchema",
    "AnalyticsOverviewRechargeSchema",
    "AnalyticsOverviewKpisSchema",
    "AnalyticsOverviewResponseSchema",
    "RevenueSummarySchema",
    "RevenueAnalyticsResponseSchema",
    "UserAnalyticsSummarySchema",
    "UserAnalyticsResponseSchema",
    "WalletAnalyticsSummarySchema",
    "WalletBalanceBucketSchema",
    "WalletAnalyticsResponseSchema",
    "TransactionAnalyticsSummarySchema",
    "TransactionHourlyPointSchema",
    "TransactionAnalyticsResponseSchema",
    "GameAnalyticsSummarySchema",
    "GamePerformanceItemSchema",
    "GameAnalyticsResponseSchema",
    "AnalyticsExportRequestSchema",
    "AnalyticsExportResponseSchema",
    "AnalyticsDateRange",
    "AnalyticsChartPoint",
    "AnalyticsCountChartPoint",
    "AnalyticsCategoryValue",
    "AnalyticsCountCategory",
    "AnalyticsOverviewResponse",
    "RevenueAnalyticsResponse",
    "UserAnalyticsResponse",
    "WalletAnalyticsResponse",
    "TransactionAnalyticsResponse",
    "GameAnalyticsResponse",
    "AnalyticsExportRequest",
    "AnalyticsExportResponse",
]