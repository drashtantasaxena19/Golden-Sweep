from typing import Any

from pydantic import BaseModel, Field


class AdminProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    permissions: list[str]
    account_status: str
    email_verified: bool


class UpdateUserStatusRequest(BaseModel):
    account_status: str = Field(
        pattern="^(active|suspended|blocked)$"
    )


class UpdateAdminPermissionsRequest(BaseModel):
    permissions: list[str]


class AdminDashboardStatsResponse(BaseModel):
    total_users: int = 0
    active_users: int = 0
    verified_users: int = 0
    paid_users: int = 0

    total_games: int = 0
    active_games: int = 0

    total_transactions: int = 0
    successful_transactions: int = 0

    total_revenue: float = 0
    total_credits_purchased: int = 0
    total_credits_spent: int = 0
    total_credits_in_wallets: int = 0


class AdminUserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str | None = None

    country: str | None = None
    state: str | None = None

    role: str
    account_status: str

    email_verified: bool
    phone_verified: bool

    wallet_balance: int = 0

    created_at: Any = None
    last_login_at: Any = None