import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import create_user_document
from app.repositories.user_repository import user_repository
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.email_service import email_service


class AuthService:
    def _generate_otp(self) -> str:
        return f"{secrets.randbelow(1_000_000):06d}"

    @staticmethod
    def _ensure_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc)

    async def register(
        self,
        payload: RegisterRequest,
    ) -> dict[str, Any]:
        email = str(payload.email).strip().lower()
        phone = payload.phone.strip()

        if not payload.age_confirmed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must confirm that you are at least 18 years old.",
            )

        if not payload.terms_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must accept the Terms and Privacy Policy.",
            )

        if await user_repository.find_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        if await user_repository.find_by_phone(phone):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this phone number already exists.",
            )

        otp = self._generate_otp()
        now = datetime.now(timezone.utc)

        user = create_user_document(
            full_name=payload.full_name,
            email=email,
            phone=phone,
            password_hash=hash_password(payload.password),
            date_of_birth=payload.date_of_birth,
            country=payload.country,
            state=payload.state,
            preferred_language=payload.preferred_language,
        )

        user["verification"] = {
            "email_otp": otp,
            "email_otp_expires_at": now
            + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
            "email_otp_attempts": 0,
            "last_sent_at": now,
        }

        try:
            created = await user_repository.create(user)

        except DuplicateKeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with these details already exists.",
            ) from exc

        try:
            await email_service.send_verification_email(
                recipient_email=email,
                recipient_name=payload.full_name,
                otp=otp,
            )

        except HTTPException:
            await user_repository.delete_by_id(
                str(created["_id"])
            )
            raise

        return {
            "user_id": str(created["_id"]),
            "email": email,
            "verification_required": True,
            "message": "Verification code sent successfully.",
        }

    async def verify_email(
        self,
        email: str,
        code: str,
    ) -> dict[str, Any]:
        normalized_email = email.strip().lower()
        code = code.strip()

        user = await user_repository.find_by_email(
            normalized_email
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found.",
            )

        if user.get("email_verified"):
            return self._create_auth_result(user)

        verification = user.get("verification") or {}

        stored_code = verification.get(
            "email_otp"
        )

        expires_at = verification.get(
            "email_otp_expires_at"
        )

        attempts = int(
            verification.get(
                "email_otp_attempts",
                0,
            )
        )

        if attempts >= settings.OTP_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Too many invalid attempts. "
                    "Request a new verification code."
                ),
            )

        if not stored_code or not expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No active verification code exists. "
                    "Request a new code."
                ),
            )

        expires_at = self._ensure_utc(
            expires_at
        )

        if expires_at < datetime.now(
            timezone.utc
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Verification code has expired. "
                    "Request a new code."
                ),
            )

        if not secrets.compare_digest(
            str(stored_code),
            code,
        ):
            attempts += 1

            await user_repository.update_by_email(
                normalized_email,
                {
                    "verification.email_otp_attempts":
                        attempts
                },
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code.",
            )

        user = await user_repository.update_by_email(
            normalized_email,
            {
                "email_verified": True,
                "email_verified_at":
                    datetime.now(timezone.utc),

                "verification.email_otp":
                    None,

                "verification.email_otp_expires_at":
                    None,

                "verification.email_otp_attempts":
                    0,
            },
        )

        return self._create_auth_result(user)

    async def resend_verification(
        self,
        email: str,
    ) -> dict[str, Any]:
        normalized_email = email.strip().lower()

        user = await user_repository.find_by_email(
            normalized_email
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found.",
            )

        if user.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified.",
            )

        verification = user.get(
            "verification"
        ) or {}

        last_sent_at = verification.get(
            "last_sent_at"
        )

        now = datetime.now(
            timezone.utc
        )

        if last_sent_at:
            last_sent_at = self._ensure_utc(
                last_sent_at
            )

            elapsed = (
                now - last_sent_at
            ).total_seconds()

            cooldown = (
                settings
                .OTP_RESEND_COOLDOWN_SECONDS
            )

            if elapsed < cooldown:
                remaining = max(
                    1,
                    int(cooldown - elapsed),
                )

                raise HTTPException(
                    status_code=
                        status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"Please wait {remaining} seconds "
                        f"before requesting another code."
                    ),
                )

        otp = self._generate_otp()

        expires_at = (
            now
            + timedelta(
                minutes=
                    settings.OTP_EXPIRE_MINUTES
            )
        )

        await email_service.send_verification_email(
            recipient_email=normalized_email,
            recipient_name=user.get(
                "full_name",
                "Player",
            ),
            otp=otp,
        )

        await user_repository.update_by_email(
            normalized_email,
            {
                "verification.email_otp":
                    otp,

                "verification.email_otp_expires_at":
                    expires_at,

                "verification.email_otp_attempts":
                    0,

                "verification.last_sent_at":
                    now,
            },
        )

        return {
            "email": normalized_email,
            "message":
                "A new verification code has been sent.",
        }

    async def login(
        self,
        payload: LoginRequest,
    ) -> dict[str, Any]:
        email = str(
            payload.email
        ).strip().lower()

        user = await user_repository.find_by_email(
            email
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        password_hash = user.get(
            "password_hash"
        )

        if (
            not password_hash
            or not verify_password(
                payload.password,
                password_hash,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if user.get(
            "account_status"
        ) != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is not active.",
            )

        if not user.get(
            "email_verified"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="EMAIL_NOT_VERIFIED",
            )

        await user_repository.update_by_id(
            str(user["_id"]),
            {
                "last_login_at":
                    datetime.now(timezone.utc)
            },
        )

        return self._create_auth_result(user)

    async def refresh(
        self,
        user_id: str,
    ) -> dict[str, str]:
        user = await user_repository.find_by_id(
            user_id
        )

        if (
            not user
            or user.get(
                "account_status"
            ) != "active"
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid account.",
            )

        user_id = str(
            user["_id"]
        )

        return {
            "access_token":
                create_access_token(
                    user_id,
                    {
                        "role":
                            user.get(
                                "role",
                                "player",
                            )
                    },
                ),

            "refresh_token":
                create_refresh_token(
                    user_id
                ),

            "token_type":
                "bearer",
        }

    async def forgot_password(
        self,
        email: str,
    ) -> dict[str, Any]:
        normalized_email = email.strip().lower()

        user = await user_repository.find_by_email(
            normalized_email
        )

        generic_response = {
            "message": (
                "If an account exists for this email, "
                "a reset code has been sent."
            )
        }

        # Prevent account enumeration.
        if not user:
            return generic_response

        reset_data = user.get(
            "password_reset"
        ) or {}

        requested_at = reset_data.get(
            "requested_at"
        )

        now = datetime.now(
            timezone.utc
        )

        if requested_at:
            requested_at = self._ensure_utc(
                requested_at
            )

            elapsed = (
                now - requested_at
            ).total_seconds()

            cooldown = (
                settings
                .OTP_RESEND_COOLDOWN_SECONDS
            )

            if elapsed < cooldown:
                remaining = max(
                    1,
                    int(
                        cooldown - elapsed
                    ),
                )

                raise HTTPException(
                    status_code=
                        status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"Please wait {remaining} seconds "
                        f"before requesting another "
                        f"password reset code."
                    ),
                )

        otp = self._generate_otp()

        expires_at = (
            now
            + timedelta(
                minutes=
                    settings.OTP_EXPIRE_MINUTES
            )
        )

        await email_service.send_password_reset_email(
            recipient_email=
                normalized_email,

            recipient_name=
                user.get(
                    "full_name",
                    "Player",
                ),

            otp=otp,
        )

        await user_repository.update_by_email(
            normalized_email,
            {
                "password_reset.code":
                    otp,

                "password_reset.expires_at":
                    expires_at,

                "password_reset.attempts":
                    0,

                "password_reset.requested_at":
                    now,

                "password_reset.completed_at":
                    None,
            },
        )

        return generic_response

    async def reset_password(
        self,
        email: str,
        code: str,
        new_password: str,
    ) -> dict[str, Any]:
        normalized_email = (
            email
            .strip()
            .lower()
        )

        code = code.strip()

        user = await user_repository.find_by_email(
            normalized_email
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid or expired "
                    "password reset request."
                ),
            )

        reset_data = user.get(
            "password_reset"
        ) or {}

        stored_code = reset_data.get(
            "code"
        )

        expires_at = reset_data.get(
            "expires_at"
        )

        attempts = int(
            reset_data.get(
                "attempts",
                0,
            )
        )

        if attempts >= settings.OTP_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Too many invalid attempts. "
                    "Request a new reset code."
                ),
            )

        if (
            not stored_code
            or not expires_at
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid or expired "
                    "password reset request."
                ),
            )

        expires_at = self._ensure_utc(
            expires_at
        )

        if (
            expires_at
            < datetime.now(
                timezone.utc
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Password reset code has expired. "
                    "Request a new code."
                ),
            )

        if not secrets.compare_digest(
            str(stored_code),
            code,
        ):
            attempts += 1

            await user_repository.update_by_email(
                normalized_email,
                {
                    "password_reset.attempts":
                        attempts
                },
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password reset code.",
            )

        current_password_hash = user.get(
            "password_hash"
        )

        if (
            current_password_hash
            and verify_password(
                new_password,
                current_password_hash,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "New password must be different "
                    "from your current password."
                ),
            )

        await user_repository.update_by_email(
            normalized_email,
            {
                "password_hash":
                    hash_password(
                        new_password
                    ),

                "password_reset.code":
                    None,

                "password_reset.expires_at":
                    None,

                "password_reset.attempts":
                    0,

                "password_reset.completed_at":
                    datetime.now(
                        timezone.utc
                    ),
            },
        )

        return {
            "message":
                "Password reset successfully."
        }

    def _create_auth_result(
        self,
        user: dict[str, Any] | None,
    ) -> dict[str, Any]:
        if not user:
            raise HTTPException(
                status_code=
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR,

                detail=
                    "Unable to load account.",
            )

        user_id = str(
            user["_id"]
        )

        return {
            "access_token":
                create_access_token(
                    user_id,
                    {
                        "role":
                            user.get(
                                "role",
                                "player",
                            )
                    },
                ),

            "refresh_token":
                create_refresh_token(
                    user_id
                ),

            "token_type":
                "bearer",

            "user": {
                "id":
                    user_id,

                "full_name":
                    user.get(
                        "full_name"
                    ),

                "email":
                    user.get(
                        "email"
                    ),

                "role":
                    user.get(
                        "role",
                        "player",
                    ),

                "email_verified":
                    user.get(
                        "email_verified",
                        False,
                    ),
            },
        }


auth_service = AuthService()