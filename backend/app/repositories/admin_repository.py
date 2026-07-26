from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from app.core.database import get_database


class AdminRepository:
    @property
    def db(self):
        return get_database()

    async def get_user_statistics(self) -> dict[str, Any]:
        users = self.db.users

        total_users = await users.count_documents({})

        active_users = await users.count_documents({"account_status": "active"})

        suspended_users = await users.count_documents({"account_status": "suspended"})

        blocked_users = await users.count_documents({"account_status": "blocked"})

        verified_users = await users.count_documents({"email_verified": True})

        unverified_users = await users.count_documents({"email_verified": False})

        admin_users = await users.count_documents({"role": "admin"})

        super_admin_users = await users.count_documents({"role": "super_admin"})

        pending_admin_requests = await users.count_documents(
            {
                "requested_role": "admin",
                "role": "player",
            }
        )

        wallet_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "wallet_balance": {
                        "$sum": {
                            "$ifNull": [
                                "$wallet.balance",
                                0,
                            ]
                        }
                    },
                }
            }
        ]

        cursor = await users.aggregate(wallet_pipeline)
        wallet_result = await cursor.to_list(length=1)

        wallet_balance = wallet_result[0]["wallet_balance"] if wallet_result else 0

        today = datetime.now(UTC)

        today_start = datetime(
            today.year,
            today.month,
            today.day,
            tzinfo=UTC,
        )

        week_start = today - timedelta(days=7)

        month_start = today - timedelta(days=30)

        new_today = await users.count_documents(
            {
                "created_at": {
                    "$gte": today_start,
                }
            }
        )

        new_week = await users.count_documents(
            {
                "created_at": {
                    "$gte": week_start,
                }
            }
        )

        new_month = await users.count_documents(
            {
                "created_at": {
                    "$gte": month_start,
                }
            }
        )

        return {
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "blocked_users": blocked_users,
            "verified_users": verified_users,
            "unverified_users": unverified_users,
            "admins": admin_users,
            "super_admins": super_admin_users,
            "pending_admin_requests": pending_admin_requests,
            "wallet_balance": wallet_balance,
            "new_today": new_today,
            "new_week": new_week,
            "new_month": new_month,
        }


admin_repository = AdminRepository()
