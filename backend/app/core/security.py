from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(
    password: str,
) -> str:
    return password_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=
            settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "type": "access",
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }

    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(
    subject: str,
) -> str:
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            days=
            settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    payload = {
        "sub": subject,
        "type": "refresh",
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(
    token: str,
) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

    except JWTError as exc:
        raise ValueError(
            "Invalid or expired token."
        ) from exc