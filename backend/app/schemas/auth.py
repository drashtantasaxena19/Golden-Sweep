from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    phone: str = Field(
        min_length=6,
        max_length=30,
    )

    date_of_birth: str

    country: str = Field(
        min_length=2,
        max_length=100,
    )

    state: str = Field(
        min_length=1,
        max_length=100,
    )

    preferred_language: str = "English"

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    age_confirmed: bool
    terms_accepted: bool


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class VerifyEmailRequest(BaseModel):
    email: EmailStr

    code: str = Field(
        min_length=6,
        max_length=6,
    )


class ResendVerificationRequest(
    BaseModel
):
    email: EmailStr


class ForgotPasswordRequest(
    BaseModel
):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr

    code: str = Field(
        min_length=6,
        max_length=6,
    )

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"