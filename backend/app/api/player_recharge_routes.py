from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.database import get_database
from app.schemas.recharge_schema import RechargePackageListResponse
from app.repositories.recharge_repository import RechargeRepository
from app.services.recharge_service import RechargeService


router = APIRouter(prefix="/recharge", tags=["Recharge Packages"])


def get_service(database=Depends(get_database)) -> RechargeService:
    return RechargeService(RechargeRepository(database))


@router.get("/packages", response_model=RechargePackageListResponse)
async def list_active_recharge_packages(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    service: RechargeService = Depends(get_service),
):
    return await service.list(
        page=page,
        limit=limit,
        search=None,
        is_active=True,
        currency=None,
        sort_by="sort_order",
        sort_order="asc",
    )
