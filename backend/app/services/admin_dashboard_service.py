from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.repositories.admin_repository import (
    admin_repository,
)


class AdminDashboardService:
    async def get_dashboard_stats(
        self,
    ) -> dict[str, Any]:
        statistics = (
            await admin_repository
            .get_user_statistics()
        )

        total_users = int(
            statistics.get(
                "total_users",
                0,
            )
        )

        verified_users = int(
            statistics.get(
                "verified_users",
                0,
            )
        )

        unverified_users = int(
            statistics.get(
                "unverified_users",
                0,
            )
        )

        active_users = int(
            statistics.get(
                "active_users",
                0,
            )
        )

        suspended_users = int(
            statistics.get(
                "suspended_users",
                0,
            )
        )

        blocked_users = int(
            statistics.get(
                "blocked_users",
                0,
            )
        )

        total_admins = int(
            statistics.get(
                "admins",
                0,
            )
        )

        total_super_admins = int(
            statistics.get(
                "super_admins",
                0,
            )
        )

        pending_admin_requests = int(
            statistics.get(
                "pending_admin_requests",
                0,
            )
        )

        wallet_balance = int(
            statistics.get(
                "wallet_balance",
                0,
            )
        )

        new_users_today = int(
            statistics.get(
                "new_today",
                0,
            )
        )

        new_users_this_week = int(
            statistics.get(
                "new_week",
                0,
            )
        )

        new_users_this_month = int(
            statistics.get(
                "new_month",
                0,
            )
        )

        verification_rate = self._calculate_percentage(
            verified_users,
            total_users,
        )

        active_user_rate = self._calculate_percentage(
            active_users,
            total_users,
        )

        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "suspended": suspended_users,
                "blocked": blocked_users,
                "verified": verified_users,
                "unverified": unverified_users,
                "verification_rate": verification_rate,
                "active_user_rate": active_user_rate,
            },
            "administrators": {
                "total_admins": total_admins,
                "total_super_admins": (
                    total_super_admins
                ),
                "pending_requests": (
                    pending_admin_requests
                ),
            },
            "wallet": {
                "total_balance": wallet_balance,
                "currency": "GC",
            },
            "growth": {
                "new_users_today": (
                    new_users_today
                ),
                "new_users_this_week": (
                    new_users_this_week
                ),
                "new_users_this_month": (
                    new_users_this_month
                ),
            },
            "generated_at": (
                datetime.now(UTC).isoformat()
            ),
        }

    @staticmethod
    def _calculate_percentage(
        value: int,
        total: int,
    ) -> float:
        if total <= 0:
            return 0.0

        percentage = (
            value / total
        ) * 100

        return round(
            percentage,
            2,
        )


admin_dashboard_service = (
    AdminDashboardService()
)