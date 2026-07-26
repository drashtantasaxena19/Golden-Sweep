from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


WalletTransactionType = Literal[
    "purchase",
    "game_entry",
    "admin_credit",
    "admin_debit",
    "refund",
]


class WalletAdjustmentRequest(BaseModel):
    amount: int = Field(gt=0)
    reason: str = Field(min_length=3, max_length=500)
    reference_id: Optional[str] = Field(default=None, max_length=120)

    @field_validator("reason", "reference_id", mode="before")
    @classmethod
    def strip_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
        return value


class WalletResponse(BaseModel):
    id: str
    user_id: str
    balance: int
    is_frozen: bool
    created_at: datetime
    updated_at: datetime


class WalletListItem(BaseModel):
    id: str
    user_id: str
    balance: int
    is_frozen: bool
    created_at: datetime
    updated_at: datetime


class WalletListResponse(BaseModel):
    total: int
    page: int
    limit: int
    wallets: list[WalletListItem]


class WalletTransactionResponse(BaseModel):
    id: str
    wallet_id: str
    user_id: str
    transaction_type: WalletTransactionType
    amount: int
    balance_before: int
    balance_after: int
    reason: str
    reference_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime


class WalletTransactionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    transactions: list[WalletTransactionResponse]


class WalletStatisticsResponse(BaseModel):
    total_wallets: int
    active_wallets: int
    frozen_wallets: int
    total_coins_in_circulation: int
    zero_balance_wallets: int
    positive_balance_wallets: int


class WalletStatusResponse(BaseModel):
    success: bool
    message: str
    wallet: WalletResponse
