from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import get_database
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction_schema import (
    TransactionDailyTrendResponse,
    TransactionFilterOptionsResponse,
    TransactionListResponse,
    TransactionResponse,
    TransactionStatisticsResponse,
    TransactionType,
    TransactionTypeBreakdownResponse,
)
from app.services.transaction_service import TransactionService


router = APIRouter(
    prefix="/admin/transactions",
    tags=["Admin Transactions"],
)


def get_transaction_service(database=Depends(get_database)) -> TransactionService:
    return TransactionService(TransactionRepository(database))


def map_error(error: Exception) -> HTTPException:
    if isinstance(error, ValueError):
        return HTTPException(status_code=400, detail=str(error))
    if isinstance(error, LookupError):
        return HTTPException(status_code=404, detail=str(error))
    return HTTPException(status_code=500, detail=str(error))


@router.get(
    "/statistics",
    response_model=TransactionStatisticsResponse,
)
async def get_transaction_statistics(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    service: TransactionService = Depends(get_transaction_service),
):
    try:
        return await service.statistics(
            start_date=start_date,
            end_date=end_date,
        )
    except Exception as error:
        raise map_error(error) from error


@router.get(
    "/type-breakdown",
    response_model=TransactionTypeBreakdownResponse,
)
async def get_transaction_type_breakdown(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    service: TransactionService = Depends(get_transaction_service),
):
    try:
        return await service.type_breakdown(
            start_date=start_date,
            end_date=end_date,
        )
    except Exception as error:
        raise map_error(error) from error


@router.get(
    "/daily-trend",
    response_model=TransactionDailyTrendResponse,
)
async def get_transaction_daily_trend(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    limit: int = Query(default=30, ge=1, le=365),
    service: TransactionService = Depends(get_transaction_service),
):
    try:
        return await service.daily_trend(
            start_date=start_date,
            end_date=end_date,
            limit=limit,
        )
    except Exception as error:
        raise map_error(error) from error


@router.get(
    "/filter-options",
    response_model=TransactionFilterOptionsResponse,
)
async def get_transaction_filter_options(
    service: TransactionService = Depends(get_transaction_service),
):
    return service.filter_options()


@router.get(
    "",
    response_model=TransactionListResponse,
)
async def list_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    transaction_type: Optional[TransactionType] = Query(default=None),
    user_id: Optional[str] = Query(default=None),
    wallet_id: Optional[str] = Query(default=None),
    created_by: Optional[str] = Query(default=None),
    minimum_amount: Optional[int] = Query(default=None, ge=0),
    maximum_amount: Optional[int] = Query(default=None, ge=0),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    service: TransactionService = Depends(get_transaction_service),
):
    try:
        return await service.list_transactions(
            page=page,
            limit=limit,
            search=search.strip() if search else None,
            transaction_type=transaction_type,
            user_id=user_id,
            wallet_id=wallet_id,
            created_by=created_by,
            minimum_amount=minimum_amount,
            maximum_amount=maximum_amount,
            start_date=start_date,
            end_date=end_date,
        )
    except Exception as error:
        raise map_error(error) from error


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
)
async def get_transaction(
    transaction_id: str,
    service: TransactionService = Depends(get_transaction_service),
):
    try:
        return await service.get_transaction(transaction_id)
    except Exception as error:
        raise map_error(error) from error
