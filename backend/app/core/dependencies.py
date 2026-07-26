from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.repositories.user_repository import user_repository


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = decode_token(token)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token does not contain a user identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repository.find_by_id(str(user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account was not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.get("account_status", "active") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active.",
        )

    return user


async def get_current_verified_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if not current_user.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address is not verified.",
        )

    return current_user


async def get_current_player(
    current_user: dict[str, Any] = Depends(get_current_verified_user),
) -> dict[str, Any]:
    role = current_user.get("role")

    if role != "player":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Player access required.",
        )

    return current_user


async def get_current_admin(
    current_user: dict[str, Any] = Depends(get_current_verified_user),
) -> dict[str, Any]:
    role = current_user.get("role")

    if role not in {"admin", "super_admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )

    return current_user


async def get_current_super_admin(
    current_user: dict[str, Any] = Depends(get_current_verified_user),
) -> dict[str, Any]:
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super administrator access required.",
        )

    return current_user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any] | None:
    if credentials is None:
        return None

    try:
        payload = decode_token(credentials.credentials)

        if payload.get("type") != "access":
            return None

        user_id = payload.get("sub")

        if not user_id:
            return None

        user = await user_repository.find_by_id(str(user_id))

        if not user:
            return None

        if user.get("account_status", "active") != "active":
            return None

        return user

    except Exception:
        return None