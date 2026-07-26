from fastapi import APIRouter, HTTPException, status

from app.core.security import decode_token
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResendVerificationRequest,
    VerifyEmailRequest,
)
from app.services.auth_service import auth_service
from app.utils.responses import success_response
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    data = await auth_service.register(payload)
    return success_response(
        "Account created. Please verify your email.",
        data,
    )


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    data = await auth_service.verify_email(
        str(payload.email),
        payload.code,
    )

    return success_response(
        "Email verified successfully.",
        data,
    )


@router.post("/resend-code")
async def resend_code(payload: ResendVerificationRequest):
    data = await auth_service.resend_verification(
        str(payload.email)
    )

    return success_response(
        "Verification code resent successfully.",
        data,
    )

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
):
    data = await auth_service.forgot_password(
        str(payload.email)
    )

    return success_response(
        data["message"]
    )


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
):
    data = await auth_service.reset_password(
        str(payload.email),
        payload.code,
        payload.new_password,
    )

    return success_response(
        data["message"]
    )

@router.post("/login")
async def login(payload: LoginRequest):
    data = await auth_service.login(payload)

    return success_response(
        "Signed in successfully.",
        data,
    )


@router.post("/refresh")
async def refresh_token(payload: RefreshTokenRequest):
    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    if decoded.get("type") != "refresh" or not decoded.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    data = await auth_service.refresh(decoded["sub"])

    return success_response(
        "Token refreshed successfully.",
        data,
    )


@router.post("/logout")
async def logout():
    return success_response(
        "Signed out successfully."
    )