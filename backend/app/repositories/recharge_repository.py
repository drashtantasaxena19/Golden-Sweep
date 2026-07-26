from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING


class RechargeRepository:
    COLLECTION_NAME = "recharge_packages"

    def __init__(self, database):
        self.collection = database[self.COLLECTION_NAME]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index(
            [("name", ASCENDING)],
            unique=True,
            partialFilterExpression={"deleted_at": None},
            name="uq_active_recharge_package_name",
        )
        await self.collection.create_index(
            [("is_active", ASCENDING), ("sort_order", ASCENDING)],
            name="idx_recharge_active_sort",
        )
        await self.collection.create_index(
            [("created_at", DESCENDING)],
            name="idx_recharge_created_at",
        )

    @staticmethod
    def _object_id(value: str) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid recharge package ID.")
        return ObjectId(value)

    async def create(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(document)
        created = await self.collection.find_one({"_id": result.inserted_id})
        if created is None:
            raise RuntimeError("Recharge package could not be loaded after creation.")
        return created

    async def get_by_id(self, package_id: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one(
            {"_id": self._object_id(package_id), "deleted_at": None}
        )

    async def get_by_name(self, name: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one(
            {"name": {"$regex": f"^{name}$", "$options": "i"}, "deleted_at": None}
        )

    async def list(
        self,
        *,
        page: int,
        limit: int,
        search: str | None,
        is_active: bool | None,
        currency: str | None,
        sort_by: str,
        sort_direction: int,
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {"deleted_at": None}

        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"badge": {"$regex": search, "$options": "i"}},
            ]

        if is_active is not None:
            query["is_active"] = is_active

        if currency:
            query["currency"] = currency.upper()

        total = await self.collection.count_documents(query)
        cursor = self.collection.find(query)
        cursor = cursor.sort([(sort_by, sort_direction), ("_id", DESCENDING)])
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        rows = await cursor.to_list(length=limit)
        return rows, total

    async def update(
        self,
        package_id: str,
        updates: dict[str, Any],
        admin_id: str | None,
    ) -> Optional[dict[str, Any]]:
        updates["updated_at"] = datetime.now(timezone.utc)
        updates["updated_by"] = admin_id

        result = await self.collection.find_one_and_update(
            {"_id": self._object_id(package_id), "deleted_at": None},
            {"$set": updates},
            return_document=True,
        )
        return result

    async def set_active(
        self,
        package_id: str,
        is_active: bool,
        admin_id: str | None,
    ) -> Optional[dict[str, Any]]:
        return await self.update(
            package_id,
            {"is_active": is_active},
            admin_id,
        )

    async def soft_delete(
        self,
        package_id: str,
        admin_id: str | None,
    ) -> bool:
        now = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": self._object_id(package_id), "deleted_at": None},
            {
                "$set": {
                    "deleted_at": now,
                    "is_active": False,
                    "updated_at": now,
                    "updated_by": admin_id,
                }
            },
        )
        return result.modified_count == 1

    async def statistics(self) -> dict[str, Any]:
        pipeline = [
            {"$match": {"deleted_at": None}},
            {
                "$group": {
                    "_id": None,
                    "total_packages": {"$sum": 1},
                    "active_packages": {
                        "$sum": {"$cond": [{"$eq": ["$is_active", True]}, 1, 0]}
                    },
                    "inactive_packages": {
                        "$sum": {"$cond": [{"$eq": ["$is_active", False]}, 1, 0]}
                    },
                    "lowest_price": {"$min": "$price"},
                    "highest_price": {"$max": "$price"},
                    "total_base_coins": {"$sum": "$coins"},
                    "total_bonus_coins": {"$sum": "$bonus_coins"},
                }
            },
        ]
        cursor = await self.collection.aggregate(pipeline)
        rows = await cursor.to_list(length=1)
        return rows[0] if rows else {
            "total_packages": 0,
            "active_packages": 0,
            "inactive_packages": 0,
            "lowest_price": 0,
            "highest_price": 0,
            "total_base_coins": 0,
            "total_bonus_coins": 0,
        }
