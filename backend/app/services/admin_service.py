from typing import Any

from fastapi import HTTPException, status

from app.core.permissions import (
    ADMIN_DEFAULT_PERMISSIONS,
)
from app.repositories.user_repository import user_repository


class AdminService:
    def serialize_admin(
        self,
        user: dict[str, Any],
    ) -> dict[str, Any]:
        role = user.get("role", "player")

        permissions = user.get(
            "admin_permissions",
            [],
        )

        if (
            role == "super_admin"
            and not permissions
        ):
            permissions = ADMIN_DEFAULT_PERMISSIONS

        return {
            "id": str(user["_id"]),
            "full_name": user.get(
                "full_name",
                "",
            ),
            "email": user.get(
                "email",
                "",
            ),
            "role": role,
            "permissions": permissions,
            "account_status": user.get(
                "account_status",
                "active",
            ),
            "email_verified": user.get(
                "email_verified",
                False,
            ),
        }

    async def get_admin_profile(
        self,
        admin: dict[str, Any],
    ) -> dict[str, Any]:
        return self.serialize_admin(admin)

    async def bootstrap_admin(
        self,
        user_id: str,
    ) -> dict[str, Any]:
        user = await user_repository.find_by_id(
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        updated = await user_repository.update_by_id(
            user_id,
            {
                "role": "admin",
                "admin_permissions":
                    ADMIN_DEFAULT_PERMISSIONS,
            },
        )

        if not updated:
            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail="Unable to create administrator.",
            )

        return self.serialize_admin(updated)


admin_service = AdminService()