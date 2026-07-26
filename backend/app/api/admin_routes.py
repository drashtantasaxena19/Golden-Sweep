from fastapi import (
    APIRouter,
    Depends,
)

from app.core.admin_dependencies import (
    get_current_admin,
)
from app.schemas.admin import AdminProfileResponse
from app.services.admin_service import admin_service


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/me",
    response_model=AdminProfileResponse,
)
async def get_admin_profile(
    admin=Depends(get_current_admin),
):
    return await admin_service.get_admin_profile(
        admin
    )


@router.get("/health")
async def admin_health(
    admin=Depends(get_current_admin),
):
    return {
        "status": "ok",
        "admin_id": str(admin["_id"]),
        "role": admin.get("role"),
    }