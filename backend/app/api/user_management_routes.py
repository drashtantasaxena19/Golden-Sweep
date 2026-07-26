from fastapi import APIRouter, Body, Depends, Query

from app.core.dependencies import get_current_admin
from app.schemas.user_management import (
    UserFilterRequest,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    WalletAdjustmentRequest,
)
from app.services.user_management_service import user_management_service

router = APIRouter(prefix="/admin/users", tags=["User Management"])


@router.get("/statistics")
async def get_statistics(_: dict = Depends(get_current_admin)):
    return await user_management_service.get_statistics()


@router.get("/countries")
async def countries(_: dict = Depends(get_current_admin)):
    return await user_management_service.get_country_list()


@router.get("/roles/count")
async def role_counts(_: dict = Depends(get_current_admin)):
    return await user_management_service.get_role_counts()


@router.get("/status/count")
async def status_counts(_: dict = Depends(get_current_admin)):
    return await user_management_service.get_status_counts()


@router.get("/recent/list")
async def recent_users(
    limit: int = Query(10, ge=1, le=100),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.recent_users(limit)


@router.get("/search/name")
async def search_by_name(
    name: str = Query(..., min_length=1),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.search_by_name(name)


@router.get("/search/email")
async def search_by_email(
    email: str = Query(..., min_length=1),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.search_by_email(email)


@router.patch("/bulk/status")
async def bulk_update_status(
    user_ids: list[str] = Body(...),
    account_status: str = Query(...),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.bulk_update_status(user_ids, account_status)


@router.delete("/bulk")
async def bulk_delete(
    user_ids: list[str] = Body(...),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.bulk_delete(user_ids)


@router.get("")
async def list_users(
    search: str | None = Query(None),
    role: str | None = Query(None),
    account_status: str | None = Query(None),
    email_verified: bool | None = Query(None),
    country: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_admin),
):
    payload = UserFilterRequest(
        search=search,
        role=role,
        account_status=account_status,
        email_verified=email_verified,
        country=country,
        page=page,
        limit=limit,
    )
    return await user_management_service.list_users(payload)


@router.get("/{user_id}")
async def get_user(user_id: str, _: dict = Depends(get_current_admin)):
    return await user_management_service.get_user(user_id)


@router.patch("/{user_id}/status")
async def update_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.change_status(user_id, payload)


@router.patch("/{user_id}/role")
async def update_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.change_role(user_id, payload)


@router.patch("/{user_id}/verify-email")
async def verify_email(user_id: str, _: dict = Depends(get_current_admin)):
    return await user_management_service.verify_email(user_id)


@router.post("/{user_id}/wallet/credit")
async def credit_wallet(
    user_id: str,
    payload: WalletAdjustmentRequest,
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.credit_wallet(user_id, payload)


@router.post("/{user_id}/wallet/debit")
async def debit_wallet(
    user_id: str,
    payload: WalletAdjustmentRequest,
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.debit_wallet(user_id, payload)


@router.put("/{user_id}/wallet")
async def set_wallet_balance(
    user_id: str,
    amount: float = Body(..., embed=True),
    _: dict = Depends(get_current_admin),
):
    return await user_management_service.set_wallet_balance(user_id, amount)


@router.delete("/{user_id}")
async def delete_user(user_id: str, _: dict = Depends(get_current_admin)):
    return await user_management_service.delete_user(user_id)
