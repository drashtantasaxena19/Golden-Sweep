from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


TransactionType = Literal[
    "purchase",
    "game_entry",
    "admin_credit",
    "admin_debit",
    "refund",
]


class TransactionResponse(BaseModel):
    id: str
    wallet_id: str
    user_id: str
    transaction_type: TransactionType
    amount: int
    balance_before: int
    balance_after: int
    reason: str
    reference_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime


class TransactionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    transactions: list[TransactionResponse]


class TransactionStatisticsResponse(BaseModel):
    total_transactions: int
    total_purchase_transactions: int
    total_game_entry_transactions: int
    total_admin_credit_transactions: int
    total_admin_debit_transactions: int
    total_refund_transactions: int
    total_credited_coins: int
    total_debited_coins: int
    net_coin_change: int


class TransactionTypeBreakdownItem(BaseModel):
    transaction_type: TransactionType
    count: int
    total_amount: int


class TransactionTypeBreakdownResponse(BaseModel):
    items: list[TransactionTypeBreakdownItem]


class TransactionDailyTrendItem(BaseModel):
    date: str
    transaction_count: int
    credited_coins: int
    debited_coins: int
    net_change: int


class TransactionDailyTrendResponse(BaseModel):
    items: list[TransactionDailyTrendItem]


class TransactionFilterOptionsResponse(BaseModel):
    transaction_types: list[TransactionType]
