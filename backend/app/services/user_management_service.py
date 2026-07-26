from typing import Any

from fastapi import HTTPException, status

from app.repositories.user_management_repository import (
    user_management_repository,
)
from app.schemas.user_management import (
    UserFilterRequest,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    WalletAdjustmentRequest,
)


class UserManagementService:
    @staticmethod
    def _serialize_user(user: dict[str, Any]) -> dict[str, Any]:
        wallet = user.get("wallet") or {}
        balance = wallet.get("balance", user.get("wallet_balance", 0))
        currency = wallet.get("currency", user.get("wallet_currency", "GC"))

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
            "role": user.get("role") or "player",
            "account_status": user.get("account_status") or "active",
            "email_verified": bool(user.get("email_verified", False)),
            "phone_verified": bool(user.get("phone_verified", False)),
            "wallet_balance": float(balance or 0),
            "wallet_currency": currency or "GC",
            "login_count": int(user.get("login_count", 0) or 0),
            "created_at": str(user.get("created_at")) if user.get("created_at") else None,
            "updated_at": str(user.get("updated_at")) if user.get("updated_at") else None,
            "last_login_at": str(user.get("last_login_at")) if user.get("last_login_at") else None,
        }

    async def list_users(
        self,
        payload: UserFilterRequest,
    ) -> dict[str, Any]:
        users, total = (
            await user_management_repository.list_users(
                search=payload.search,
                role=payload.role,
                account_status=payload.account_status,
                email_verified=payload.email_verified,
                country=payload.country,
                page=payload.page,
                limit=payload.limit,
            )
        )

        return {
            "total": total,
            "page": payload.page,
            "limit": payload.limit,
            "users": [
                self._serialize_user(user)
                for user in users
            ],
        }

    async def get_user(
        self,
        user_id: str,
    ) -> dict[str, Any]:
        user = (
            await user_management_repository.get_by_id(
                user_id
            )
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return self._serialize_user(user)

    async def get_statistics(self) -> dict[str, int]:
        stats = await user_management_repository.get_statistics()

        total_users = int(stats.get("total_users", 0) or 0)
        player_users = int(stats.get("total_players", 0) or 0)
        admin_users = int(stats.get("admin_users", 0) or 0)
        super_admin_users = int(stats.get("super_admin_users", 0) or 0)
        active_users = int(stats.get("active_users", 0) or 0)
        pending_users = int(stats.get("pending_users", 0) or 0)
        suspended_users = int(stats.get("suspended_users", 0) or 0)
        blocked_users = int(stats.get("blocked_users", 0) or 0)
        verified_users = int(stats.get("verified_users", 0) or 0)
        unverified_users = int(stats.get("unverified_users", 0) or 0)
        inactive_users = max(
            total_users - active_users - suspended_users - blocked_users,
            0,
        )

        return {
            "total_users": total_users,
            "player_users": player_users,
            "admin_users": admin_users,
            "super_admin_users": super_admin_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "pending_users": pending_users,
            "suspended_users": suspended_users,
            "blocked_users": blocked_users,
            "verified_users": verified_users,
            "unverified_users": unverified_users,
        }

    async def change_status(
        self,
        user_id: str,
        payload: UserStatusUpdateRequest,
    ) -> dict[str, str]:

        user = (
            await user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        await (
            user_management_repository
            .update_account_status(
                user_id,
                payload.account_status,
            )
        )

        return {
            "message":
                "Account status updated successfully."
        }

    async def change_role(
        self,
        user_id: str,
        payload: UserRoleUpdateRequest,
    ) -> dict[str, str]:

        user = await (
            user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        await (
            user_management_repository
            .update_role(
                user_id,
                payload.role,
            )
        )

        return {
            "message":
                "User role updated successfully."
        }

    async def verify_email(
        self,
        user_id: str,
    ) -> dict[str, str]:

        user = await (
            user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if user.get(
            "email_verified"
        ):
            return {
                "message":
                    "Email already verified."
            }

        await (
            user_management_repository
            .verify_email(user_id)
        )

        return {
            "message":
                "Email verified successfully."
        }

    async def credit_wallet(
        self,
        user_id: str,
        payload: WalletAdjustmentRequest,
    ) -> dict[str, str]:

        if payload.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be greater than zero.",
            )

        user = await user_management_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        await user_management_repository.adjust_wallet(user_id, payload.amount)

        return {
            "message":
                "Wallet credited successfully."
        }

    async def debit_wallet(
        self,
        user_id: str,
        payload: WalletAdjustmentRequest,
    ) -> dict[str, str]:

        user = await (
            user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        wallet = user.get("wallet") or {}
        balance = float(
            wallet.get("balance", user.get("wallet_balance", 0)) or 0
        )

        if balance < payload.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient wallet balance.",
            )

        await (
            user_management_repository
            .adjust_wallet(
                user_id,
                -payload.amount,
            )
        )

        return {
            "message":
                "Wallet debited successfully."
        }

    async def set_wallet_balance(
        self,
        user_id: str,
        amount: float,
    ) -> dict[str, str]:

        if amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Wallet balance cannot be negative.",
            )

        user = await (
            user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        await (
            user_management_repository
            .set_wallet_balance(
                user_id,
                amount,
            )
        )

        return {
            "message":
                "Wallet balance updated successfully."
        }

    async def delete_user(
        self,
        user_id: str,
    ) -> dict[str, str]:

        user = await (
            user_management_repository
            .get_by_id(user_id)
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        await (
            user_management_repository
            .delete_user(
                user_id,
            )
        )

        return {
            "message":
                "User deleted successfully."
        }
        
    async def bulk_update_status(
        self,
        user_ids: list[str],
        account_status: str,
    ) -> dict[str, Any]:

        updated = (
            await user_management_repository
            .bulk_update_status(
                user_ids,
                account_status,
            )
        )

        return {
            "updated": updated,
            "message":
                f"{updated} user(s) updated successfully.",
        }

    async def bulk_delete(
        self,
        user_ids: list[str],
    ) -> dict[str, Any]:

        deleted = (
            await user_management_repository
            .bulk_delete(
                user_ids,
            )
        )

        return {
            "deleted": deleted,
            "message":
                f"{deleted} user(s) deleted successfully.",
        }

    async def recent_users(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:

        users = (
            await user_management_repository
            .recent_users(limit)
        )

        return [
            self._serialize_user(user)
            for user in users
        ]

    async def search_by_name(
        self,
        name: str,
    ) -> list[dict[str, Any]]:

        users = (
            await user_management_repository
            .search_by_name(name)
        )

        return [
            self._serialize_user(user)
            for user in users
        ]

    async def search_by_email(
        self,
        email: str,
    ) -> list[dict[str, Any]]:

        users = (
            await user_management_repository
            .search_by_email(email)
        )

        return [
            self._serialize_user(user)
            for user in users
        ]

    async def get_country_list(
        self,
    ) -> list[str]:

        return (
            await user_management_repository
            .get_country_list()
        )

    async def get_role_counts(
        self,
    ) -> list[dict[str, Any]]:

        return (
            await user_management_repository
            .get_role_counts()
        )

    async def get_status_counts(
        self,
    ) -> list[dict[str, Any]]:

        return (
            await user_management_repository
            .get_status_counts()
        )

    async def email_exists(
        self,
        email: str,
    ) -> bool:

        return (
            await user_management_repository
            .email_exists(email)
        )

    async def user_exists(
        self,
        user_id: str,
    ) -> bool:

        return (
            await user_management_repository
            .user_exists(user_id)
        )


user_management_service = UserManagementService()