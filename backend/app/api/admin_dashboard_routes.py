from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.admin_dependencies import get_current_admin
from app.services.admin_dashboard_service import (
    admin_dashboard_service,
)
from app.utils.responses import success_response


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"],
)


@router.get("/stats")
async def get_admin_dashboard_stats(
    admin=Depends(get_current_admin),
):
    dashboard_stats = (
        await admin_dashboard_service
        .get_dashboard_stats()
    )

    return success_response(
        message="Admin dashboard statistics fetched successfully.",
        data=dashboard_stats,
    )