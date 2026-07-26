from collections.abc import Callable
from typing import Any

from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.core.permissions import AdminPermission


async def get_current_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    role = current_user.get("role", "player")

    if role not in {"admin", "super_admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )

    return current_user


def require_permission(
    permission: AdminPermission,
) -> Callable:
    async def permission_dependency(
        admin: dict[str, Any] = Depends(get_current_admin),
    ) -> dict[str, Any]:
        if admin.get("role") == "super_admin":
            return admin

        permissions = admin.get("admin_permissions", [])

        if permission.value not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return admin

    return permission_dependency