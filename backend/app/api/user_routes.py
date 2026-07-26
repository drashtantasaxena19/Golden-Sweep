from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.utils.responses import success_response
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.security import hash_password, verify_password
from app.repositories.user_repository import user_repository
from app.schemas.user import ChangePasswordRequest

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


def serialize_user(user):
    wallet = user.get("wallet") or {}

    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "date_of_birth": user.get("date_of_birth"),
        "country": user.get("country"),
        "state": user.get("state"),
        "preferred_language": user.get("preferred_language"),
        "avatar_url": user.get("avatar_url"),
        "role": user.get("role", "player"),
        "account_status": user.get("account_status"),
        "email_verified": user.get("email_verified", False),
        "phone_verified": user.get("phone_verified", False),
        "wallet_balance": wallet.get("balance", 0),
        "wallet_currency": wallet.get("currency", "GC"),
        "created_at": user.get("created_at"),
    }

@router.post("/me/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):
    password_hash = current_user.get(
        "password_hash"
    )

    if (
        not password_hash
        or not verify_password(
            payload.current_password,
            password_hash,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if (
        payload.current_password
        == payload.new_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "New password must be different "
                "from your current password."
            ),
        )

    await user_repository.update_by_id(
        str(current_user["_id"]),
        {
            "password_hash":
                hash_password(
                    payload.new_password
                )
        },
    )

    return success_response(
        "Password changed successfully."
    )

@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
):
    return success_response(
        "Profile loaded successfully.",
        serialize_user(current_user),
    )
