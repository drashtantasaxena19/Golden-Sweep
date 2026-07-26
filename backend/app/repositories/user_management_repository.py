from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING

from app.core.database import get_database


class UserManagementRepository:
    @property
    def collection(self):
        return get_database()["users"]

    async def create_indexes(self) -> None:
        await self.collection.create_index(
            [("email", ASCENDING)],
            unique=True,
            name="unique_user_email",
        )

        await self.collection.create_index(
            [("phone", ASCENDING)],
            unique=True,
            sparse=True,
            name="unique_user_phone",
        )

        await self.collection.create_index(
            [("role", ASCENDING)],
            name="user_role_index",
        )

        await self.collection.create_index(
            [("account_status", ASCENDING)],
            name="account_status_index",
        )

        await self.collection.create_index(
            [("country", ASCENDING)],
            name="country_index",
        )

        await self.collection.create_index(
            [("email_verified", ASCENDING)],
            name="email_verified_index",
        )

        await self.collection.create_index(
            [("created_at", DESCENDING)],
            name="created_at_index",
        )

        await self.collection.create_index(
            [("last_login_at", DESCENDING)],
            name="last_login_index",
        )

        await self.collection.create_index(
            [("full_name", ASCENDING)],
            name="full_name_index",
        )

    async def get_by_id(
        self,
        user_id: str,
    ) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None

        return await self.collection.find_one(
            {
                "_id": ObjectId(user_id),
            }
        )

    async def get_by_email(
        self,
        email: str,
    ) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {
                "email": email.strip().lower(),
            }
        )

    async def user_exists(
        self,
        user_id: str,
    ) -> bool:
        if not ObjectId.is_valid(user_id):
            return False

        count = await self.collection.count_documents(
            {
                "_id": ObjectId(user_id),
            },
            limit=1,
        )

        return count > 0

    async def email_exists(
        self,
        email: str,
    ) -> bool:
        count = await self.collection.count_documents(
            {
                "email": email.strip().lower(),
            },
            limit=1,
        )

        return count > 0

    async def get_total_users(
        self,
        filters: dict[str, Any],
    ) -> int:
        return await self.collection.count_documents(filters)

    async def get_statistics(self) -> dict[str, int]:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "total_players": {
                        "$sum": {
                            "$cond": [
                                {"$eq": [{"$ifNull": ["$role", "player"]}, "player"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "admin_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": [{"$ifNull": ["$role", "player"]}, "admin"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "super_admin_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": [{"$ifNull": ["$role", "player"]}, "super_admin"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "active_users": {
                        "$sum": {
                            "$cond": [
                                {"$eq": [{"$ifNull": ["$account_status", "active"]}, "active"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "pending_users": {
                        "$sum": {"$cond": [{"$eq": ["$account_status", "pending"]}, 1, 0]}
                    },
                    "suspended_users": {
                        "$sum": {"$cond": [{"$eq": ["$account_status", "suspended"]}, 1, 0]}
                    },
                    "blocked_users": {
                        "$sum": {"$cond": [{"$eq": ["$account_status", "blocked"]}, 1, 0]}
                    },
                    "verified_users": {
                        "$sum": {"$cond": [{"$eq": ["$email_verified", True]}, 1, 0]}
                    },
                    "unverified_users": {
                        "$sum": {"$cond": [{"$ne": ["$email_verified", True]}, 1, 0]}
                    },
                }
            },
            {"$project": {"_id": 0}},
        ]

        cursor = await self.collection.aggregate(pipeline)
        rows = await cursor.to_list(length=1)
        defaults = {
            "total_users": 0,
            "total_players": 0,
            "admin_users": 0,
            "super_admin_users": 0,
            "active_users": 0,
            "pending_users": 0,
            "suspended_users": 0,
            "blocked_users": 0,
            "verified_users": 0,
            "unverified_users": 0,
        }
        if not rows:
            return defaults

        return {
            key: int(rows[0].get(key, 0) or 0)
            for key in defaults
        }

    async def list_users(
        self,
        *,
        search: str | None,
        role: str | None,
        account_status: str | None,
        email_verified: bool | None,
        country: str | None,
        page: int,
        limit: int,
    ) -> tuple[list[dict[str, Any]], int]:

        filters: dict[str, Any] = {}

        if search:
            filters["$or"] = [
                {
                    "full_name": {
                        "$regex": search,
                        "$options": "i",
                    }
                },
                {
                    "email": {
                        "$regex": search,
                        "$options": "i",
                    }
                },
                {
                    "phone": {
                        "$regex": search,
                        "$options": "i",
                    }
                },
            ]

        if role:
            filters["role"] = role

        if account_status:
            filters["account_status"] = account_status

        if email_verified is not None:
            filters["email_verified"] = email_verified

        if country:
            filters["country"] = country

        total = await self.get_total_users(filters)

        cursor = (
            self.collection.find(filters)
            .sort("created_at", DESCENDING)
            .skip((page - 1) * limit)
            .limit(limit)
        )

        users = await cursor.to_list(length=limit)

        return users, total

    async def recent_users(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find({})
            .sort("created_at", DESCENDING)
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def search_by_name(
        self,
        keyword: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find(
                {
                    "full_name": {
                        "$regex": keyword,
                        "$options": "i",
                    }
                }
            )
            .sort(
                "full_name",
                ASCENDING,
            )
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def search_by_email(
        self,
        keyword: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find(
                {
                    "email": {
                        "$regex": keyword,
                        "$options": "i",
                    }
                }
            )
            .sort(
                "email",
                ASCENDING,
            )
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def get_country_list(
        self,
    ) -> list[str]:

        countries = await self.collection.distinct("country")

        return sorted(
            [
                country
                for country in countries
                if country
            ]
        )

    async def get_role_counts(
        self,
    ) -> dict[str, int]:

        pipeline = [
            {
                "$group": {
                    "_id": "$role",
                    "count": {
                        "$sum": 1,
                    },
                }
            }
        ]

        cursor = await self.collection.aggregate(pipeline)
        result = await cursor.to_list(length=None)

        return {
            item["_id"]: item["count"]
            for item in result
            if item["_id"] is not None
        }

    async def get_status_counts(
        self,
    ) -> dict[str, int]:

        pipeline = [
            {
                "$group": {
                    "_id": "$account_status",
                    "count": {
                        "$sum": 1,
                    },
                }
            }
        ]

        cursor = await self.collection.aggregate(pipeline)
        result = await cursor.to_list(length=None)

        return {
            item["_id"]: item["count"]
            for item in result
            if item["_id"] is not None
        }
        
    async def update_role(
        self,
        user_id: str,
        role: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "role": role,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def update_account_status(
        self,
        user_id: str,
        status: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "account_status": status,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def verify_email(
        self,
        user_id: str,
        verified: bool = True,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "email_verified": verified,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def set_wallet_balance(
        self,
        user_id: str,
        amount: float,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "wallet.balance": amount,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def adjust_wallet(
        self,
        user_id: str,
        amount: float,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$inc": {
                    "wallet.balance": amount,
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )

        return result.modified_count > 0

    async def update_last_login(
        self,
        user_id: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "last_login_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def delete_user(
        self,
        user_id: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.delete_one(
            {
                "_id": ObjectId(user_id),
            }
        )

        return result.deleted_count > 0

    async def bulk_update_status(
        self,
        user_ids: list[str],
        status: str,
    ) -> int:

        object_ids = [
            ObjectId(user_id)
            for user_id in user_ids
            if ObjectId.is_valid(user_id)
        ]

        if not object_ids:
            return 0

        result = await self.collection.update_many(
            {
                "_id": {
                    "$in": object_ids,
                }
            },
            {
                "$set": {
                    "account_status": status,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count

    async def bulk_update_role(
        self,
        user_ids: list[str],
        role: str,
    ) -> int:

        object_ids = [
            ObjectId(user_id)
            for user_id in user_ids
            if ObjectId.is_valid(user_id)
        ]

        if not object_ids:
            return 0

        result = await self.collection.update_many(
            {
                "_id": {
                    "$in": object_ids,
                }
            },
            {
                "$set": {
                    "role": role,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count

    async def bulk_delete(
        self,
        user_ids: list[str],
    ) -> int:

        object_ids = [
            ObjectId(user_id)
            for user_id in user_ids
            if ObjectId.is_valid(user_id)
        ]

        if not object_ids:
            return 0

        result = await self.collection.delete_many(
            {
                "_id": {
                    "$in": object_ids,
                }
            }
        )

        return result.deleted_count
    
    async def toggle_email_verification(
        self,
        user_id: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        user = await self.get_by_id(user_id)

        if not user:
            return False

        current = bool(user.get("email_verified", False))

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": {
                    "email_verified": not current,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return result.modified_count > 0

    async def increment_login_count(
        self,
        user_id: str,
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$inc": {
                    "login_count": 1,
                },
                "$set": {
                    "last_login_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )

        return result.modified_count > 0

    async def get_recently_registered(
        self,
        limit: int = 5,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find({})
            .sort(
                "created_at",
                DESCENDING,
            )
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def get_users_by_role(
        self,
        role: str,
        limit: int = 100,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find(
                {
                    "role": role,
                }
            )
            .sort(
                "created_at",
                DESCENDING,
            )
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def get_users_by_status(
        self,
        status: str,
        limit: int = 100,
    ) -> list[dict[str, Any]]:

        cursor = (
            self.collection.find(
                {
                    "account_status": status,
                }
            )
            .sort(
                "created_at",
                DESCENDING,
            )
            .limit(limit)
        )

        return await cursor.to_list(length=limit)

    async def update_profile(
        self,
        user_id: str,
        data: dict[str, Any],
    ) -> bool:

        if not ObjectId.is_valid(user_id):
            return False

        data["updated_at"] = datetime.now(timezone.utc)

        result = await self.collection.update_one(
            {
                "_id": ObjectId(user_id),
            },
            {
                "$set": data,
            },
        )

        return result.modified_count > 0

    async def update_many(
        self,
        filters: dict[str, Any],
        data: dict[str, Any],
    ) -> int:

        data["updated_at"] = datetime.now(timezone.utc)

        result = await self.collection.update_many(
            filters,
            {
                "$set": data,
            },
        )

        return result.modified_count

    async def delete_many(
        self,
        filters: dict[str, Any],
    ) -> int:

        result = await self.collection.delete_many(filters)

        return result.deleted_count

    async def count(
        self,
        filters: dict[str, Any] | None = None,
    ) -> int:

        return await self.collection.count_documents(filters or {})

    async def find(
        self,
        filters: dict[str, Any],
    ) -> list[dict[str, Any]]:

        cursor = self.collection.find(filters)

        return await cursor.to_list(length=None)

    async def aggregate(
        self,
        pipeline: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:

        cursor = await self.collection.aggregate(pipeline)
        return await cursor.to_list(length=None)


user_management_repository = UserManagementRepository()