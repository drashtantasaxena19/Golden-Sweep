from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.database import get_database
from app.schemas.recharge_schema import (
    RechargePackageCreate,
    RechargePackageListResponse,
    RechargePackageResponse,
    RechargePackageStatistics,
    RechargePackageUpdate,
)
from app.repositories.recharge_repository import RechargeRepository
from app.services.recharge_service import RechargeService


router = APIRouter(prefix="/admin/recharge", tags=["Admin Recharge Packages"])


def get_service(database=Depends(get_database)) -> RechargeService:
    return RechargeService(RechargeRepository(database))


def get_admin_identity(request: Request) -> str | None:
    user = getattr(request.state, "user", None)
    if isinstance(user, dict):
        return str(user.get("id") or user.get("uid") or user.get("sub") or "") or None
    return str(getattr(user, "id", "") or getattr(user, "uid", "") or "") or None


def translate_error(error: Exception) -> HTTPException:
    if isinstance(error, ValueError):
        return HTTPException(status_code=400, detail=str(error))
    if isinstance(error, LookupError):
        return HTTPException(status_code=404, detail=str(error))
    return HTTPException(status_code=500, detail="Recharge package operation failed.")


@router.get("/statistics", response_model=RechargePackageStatistics)
async def recharge_statistics(
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.statistics()
    except Exception as error:
        raise translate_error(error) from error


@router.get("", response_model=RechargePackageListResponse)
async def list_recharge_packages(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    currency: Optional[str] = Query(default=None, min_length=3, max_length=3),
    sort_by: str = Query(default="sort_order"),
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.list(
            page=page,
            limit=limit,
            search=search.strip() if search else None,
            is_active=is_active,
            currency=currency,
            sort_by=sort_by,
            sort_order=sort_order,
        )
    except Exception as error:
        raise translate_error(error) from error


@router.post(
    "",
    response_model=RechargePackageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_recharge_package(
    payload: RechargePackageCreate,
    request: Request,
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.create(payload, get_admin_identity(request))
    except Exception as error:
        raise translate_error(error) from error


@router.get("/{package_id}", response_model=RechargePackageResponse)
async def get_recharge_package(
    package_id: str,
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.get(package_id)
    except Exception as error:
        raise translate_error(error) from error


@router.patch("/{package_id}", response_model=RechargePackageResponse)
async def update_recharge_package(
    package_id: str,
    payload: RechargePackageUpdate,
    request: Request,
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.update(
            package_id,
            payload,
            get_admin_identity(request),
        )
    except Exception as error:
        raise translate_error(error) from error


@router.patch("/{package_id}/activate", response_model=RechargePackageResponse)
async def activate_recharge_package(
    package_id: str,
    request: Request,
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.set_active(
            package_id,
            True,
            get_admin_identity(request),
        )
    except Exception as error:
        raise translate_error(error) from error


@router.patch("/{package_id}/deactivate", response_model=RechargePackageResponse)
async def deactivate_recharge_package(
    package_id: str,
    request: Request,
    service: RechargeService = Depends(get_service),
):
    try:
        return await service.set_active(
            package_id,
            False,
            get_admin_identity(request),
        )
    except Exception as error:
        raise translate_error(error) from error


@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recharge_package(
    package_id: str,
    request: Request,
    service: RechargeService = Depends(get_service),
):
    try:
        await service.delete(package_id, get_admin_identity(request))
        return None
    except Exception as error:
        raise translate_error(error) from error
