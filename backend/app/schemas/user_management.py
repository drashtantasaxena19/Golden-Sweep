from typing import Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class UserFilterRequest(BaseModel):
    search: str | None = None

    role: Literal[
        "player",
        "admin",
        "super_admin",
    ] | None = None

    account_status: Literal[
        "pending",
        "active",
        "suspended",
        "blocked",
    ] | None = None

    email_verified: bool | None = None

    country: str | None = None

    page: int = Field(
        default=1,
        ge=1,
    )

    limit: int = Field(
        default=10,
        ge=1,
        le=100,
    )


class UserStatusUpdateRequest(BaseModel):
    account_status: Literal[
        "active",
        "suspended",
        "blocked",
    ]


class UserRoleUpdateRequest(BaseModel):
    role: Literal[
        "player",
        "admin",
        "super_admin",
    ]


class WalletAdjustmentRequest(BaseModel):
    amount: float = Field(
        gt=0,
    )

    reason: str = Field(
        min_length=3,
        max_length=250,
    )


class UserResponse(BaseModel):
    id: str

    full_name: str

    email: EmailStr

    phone: str

    role: str

    account_status: str

    email_verified: bool

    preferred_language: str

    country: str

    state: str

    wallet_balance: float

    wallet_currency: str

    created_at: str

    last_login_at: str | None = None


class UserListResponse(BaseModel):
    total: int

    page: int

    limit: int

    users: list[UserResponse]


class UserStatisticsResponse(BaseModel):
    total_users: int

    total_players: int

    total_admins: int

    active_users: int

    pending_users: int

    suspended_users: int

    blocked_users: int

    verified_users: int

    unverified_users: int