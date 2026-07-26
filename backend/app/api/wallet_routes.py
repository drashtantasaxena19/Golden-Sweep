from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.database import get_database
from app.repositories.wallet_repository import WalletRepository
from app.schemas.wallet_schema import (
    WalletAdjustmentRequest,
    WalletListResponse,
    WalletResponse,
    WalletStatisticsResponse,
    WalletStatusResponse,
    WalletTransactionListResponse,
    WalletTransactionType,
)
from app.services.wallet_service import WalletService


router = APIRouter(prefix="/admin/wallet", tags=["Admin Wallet"])


def get_wallet_service(database=Depends(get_database)) -> WalletService:
    return WalletService(WalletRepository(database))


def get_admin_id(request: Request) -> str | None:
    user = getattr(request.state, "user", None)
    if isinstance(user, dict):
        return str(user.get("id") or user.get("uid") or user.get("sub") or "") or None
    return str(getattr(user, "id", "") or getattr(user, "uid", "") or "") or None


def map_error(error: Exception) -> HTTPException:
    if isinstance(error, ValueError):
        return HTTPException(status_code=400, detail=str(error))
    if isinstance(error, LookupError):
        return HTTPException(status_code=404, detail=str(error))
    return HTTPException(status_code=500, detail=str(error))


@router.get("/statistics", response_model=WalletStatisticsResponse)
async def get_wallet_statistics(
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.statistics()
    except Exception as error:
        raise map_error(error) from error


@router.get("/transactions", response_model=WalletTransactionListResponse)
async def list_wallet_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    user_id: Optional[str] = Query(default=None),
    wallet_id: Optional[str] = Query(default=None),
    transaction_type: Optional[WalletTransactionType] = Query(default=None),
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.list_transactions(
            page=page,
            limit=limit,
            user_id=user_id,
            wallet_id=wallet_id,
            transaction_type=transaction_type,
        )
    except Exception as error:
        raise map_error(error) from error


@router.get("", response_model=WalletListResponse)
async def list_wallets(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    is_frozen: Optional[bool] = Query(default=None),
    minimum_balance: Optional[int] = Query(default=None, ge=0),
    maximum_balance: Optional[int] = Query(default=None, ge=0),
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.list_wallets(
            page=page,
            limit=limit,
            search=search.strip() if search else None,
            is_frozen=is_frozen,
            minimum_balance=minimum_balance,
            maximum_balance=maximum_balance,
        )
    except Exception as error:
        raise map_error(error) from error


@router.post("/user/{user_id}", response_model=WalletResponse)
async def create_or_get_wallet(
    user_id: str,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.get_or_create_wallet(user_id)
    except Exception as error:
        raise map_error(error) from error


@router.get("/user/{user_id}", response_model=WalletResponse)
async def get_wallet_by_user(
    user_id: str,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.get_wallet_by_user(user_id)
    except Exception as error:
        raise map_error(error) from error


@router.get("/{wallet_id}", response_model=WalletResponse)
async def get_wallet(
    wallet_id: str,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        return await service.get_wallet(wallet_id)
    except Exception as error:
        raise map_error(error) from error


@router.post("/{wallet_id}/credit", response_model=WalletStatusResponse)
async def credit_wallet(
    wallet_id: str,
    payload: WalletAdjustmentRequest,
    request: Request,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        wallet = await service.adjust_balance(
            wallet_id=wallet_id,
            amount=payload.amount,
            reason=payload.reason,
            reference_id=payload.reference_id,
            admin_id=get_admin_id(request),
            transaction_type="admin_credit",
        )
        return {
            "success": True,
            "message": "Wallet credited successfully.",
            "wallet": wallet,
        }
    except Exception as error:
        raise map_error(error) from error


@router.post("/{wallet_id}/debit", response_model=WalletStatusResponse)
async def debit_wallet(
    wallet_id: str,
    payload: WalletAdjustmentRequest,
    request: Request,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        wallet = await service.adjust_balance(
            wallet_id=wallet_id,
            amount=payload.amount,
            reason=payload.reason,
            reference_id=payload.reference_id,
            admin_id=get_admin_id(request),
            transaction_type="admin_debit",
        )
        return {
            "success": True,
            "message": "Wallet debited successfully.",
            "wallet": wallet,
        }
    except Exception as error:
        raise map_error(error) from error


@router.patch("/{wallet_id}/freeze", response_model=WalletStatusResponse)
async def freeze_wallet(
    wallet_id: str,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        wallet = await service.set_frozen(wallet_id, True)
        return {
            "success": True,
            "message": "Wallet frozen successfully.",
            "wallet": wallet,
        }
    except Exception as error:
        raise map_error(error) from error


@router.patch("/{wallet_id}/unfreeze", response_model=WalletStatusResponse)
async def unfreeze_wallet(
    wallet_id: str,
    service: WalletService = Depends(get_wallet_service),
):
    try:
        wallet = await service.set_frozen(wallet_id, False)
        return {
            "success": True,
            "message": "Wallet unfrozen successfully.",
            "wallet": wallet,
        }
    except Exception as error:
        raise map_error(error) from error
