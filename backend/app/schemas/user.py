from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: str

    full_name: str
    email: EmailStr
    phone: str

    date_of_birth: str

    country: str
    state: str

    preferred_language: str

    avatar_url: str | None = None

    role: str
    account_status: str

    email_verified: bool
    phone_verified: bool

    wallet_balance: int = 0


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    phone: str | None = Field(
        default=None,
        min_length=6,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    state: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    preferred_language: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        min_length=8,
        max_length=128,
    )

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )