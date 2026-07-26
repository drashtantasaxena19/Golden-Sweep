from __future__ import annotations

import re
from datetime import datetime, timezone
from math import ceil
from typing import Any

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING, ReturnDocument


class GameRepository:
    COLLECTION_NAME = "games"

    def __init__(self, database) -> None:
        self.collection = database[self.COLLECTION_NAME]

    @staticmethod
    def to_object_id(value: str | ObjectId) -> ObjectId:
        if isinstance(value, ObjectId):
            return value

        if not ObjectId.is_valid(value):
            raise ValueError("Invalid game ID.")

        return ObjectId(value)

    async def create_indexes(self) -> None:
        await self.collection.create_index(
            [("slug", ASCENDING)],
            unique=True,
            name="uq_games_slug",
        )
        await self.collection.create_index(
            [("name", ASCENDING)],
            name="idx_games_name",
        )
        await self.collection.create_index(
            [("status", ASCENDING), ("sort_order", ASCENDING)],
            name="idx_games_status_sort",
        )
        await self.collection.create_index(
            [
                ("show_on_landing_page", ASCENDING),
                ("status", ASCENDING),
                ("sort_order", ASCENDING),
            ],
            name="idx_games_landing_public",
        )
        await self.collection.create_index(
            [
                ("is_featured", ASCENDING),
                ("status", ASCENDING),
                ("sort_order", ASCENDING),
            ],
            name="idx_games_featured_public",
        )
        await self.collection.create_index(
            [("category", ASCENDING), ("status", ASCENDING)],
            name="idx_games_category_status",
        )
        await self.collection.create_index(
            [("provider_name", ASCENDING)],
            name="idx_games_provider",
        )
        await self.collection.create_index(
            [("provider_name", ASCENDING), ("provider_game_id", ASCENDING)],
            unique=True,
            sparse=True,
            name="uq_games_provider_game",
        )
        await self.collection.create_index(
            [("updated_at", DESCENDING)],
            name="idx_games_updated_at",
        )

    async def create(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(document)
        created = await self.collection.find_one({"_id": result.inserted_id})

        if created is None:
            raise RuntimeError("Game could not be loaded after creation.")

        return created

    async def get_by_id(self, game_id: str) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {"_id": self.to_object_id(game_id)}
        )

    async def get_by_slug(self, slug: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"slug": slug})

    async def slug_exists(
        self,
        slug: str,
        *,
        exclude_game_id: str | None = None,
    ) -> bool:
        query: dict[str, Any] = {"slug": slug}

        if exclude_game_id:
            query["_id"] = {
                "$ne": self.to_object_id(exclude_game_id)
            }

        return (
            await self.collection.count_documents(query, limit=1)
            > 0
        )

    async def provider_game_exists(
        self,
        *,
        provider_name: str,
        provider_game_id: str,
        exclude_game_id: str | None = None,
    ) -> bool:
        query: dict[str, Any] = {
            "provider_name": {
                "$regex": f"^{re.escape(provider_name.strip())}$",
                "$options": "i",
            },
            "provider_game_id": provider_game_id.strip(),
        }

        if exclude_game_id:
            query["_id"] = {
                "$ne": self.to_object_id(exclude_game_id)
            }

        return (
            await self.collection.count_documents(query, limit=1)
            > 0
        )

    async def update(
        self,
        game_id: str,
        updates: dict[str, Any],
    ) -> dict[str, Any] | None:
        return await self.collection.find_one_and_update(
            {"_id": self.to_object_id(game_id)},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )

    async def delete(self, game_id: str) -> bool:
        result = await self.collection.delete_one(
            {"_id": self.to_object_id(game_id)}
        )
        return result.deleted_count == 1

    async def increment_play_count(
        self,
        game_id: str,
    ) -> dict[str, Any] | None:
        return await self.collection.find_one_and_update(
            {
                "_id": self.to_object_id(game_id),
                "status": "published",
            },
            {
                "$inc": {"play_count": 1},
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                },
            },
            return_document=ReturnDocument.AFTER,
        )

    async def list_admin(
        self,
        *,
        page: int,
        limit: int,
        search: str | None = None,
        status: str | None = None,
        category: str | None = None,
        provider_name: str | None = None,
        is_featured: bool | None = None,
        show_on_landing_page: bool | None = None,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {}

        if search:
            escaped = re.escape(search.strip())
            query["$or"] = [
                {"name": {"$regex": escaped, "$options": "i"}},
                {"slug": {"$regex": escaped, "$options": "i"}},
                {
                    "short_description": {
                        "$regex": escaped,
                        "$options": "i",
                    }
                },
                {
                    "provider_name": {
                        "$regex": escaped,
                        "$options": "i",
                    }
                },
                {"tags": {"$regex": escaped, "$options": "i"}},
            ]

        if status:
            query["status"] = status

        if category:
            query["category"] = category

        if provider_name:
            query["provider_name"] = {
                "$regex": (
                    f"^{re.escape(provider_name.strip())}$"
                ),
                "$options": "i",
            }

        if is_featured is not None:
            query["is_featured"] = is_featured

        if show_on_landing_page is not None:
            query["show_on_landing_page"] = (
                show_on_landing_page
            )

        total = await self.collection.count_documents(query)
        cursor = (
            self.collection.find(query)
            .sort(
                [
                    ("sort_order", ASCENDING),
                    ("updated_at", DESCENDING),
                ]
            )
            .skip((page - 1) * limit)
            .limit(limit)
        )

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": ceil(total / limit) if total else 0,
            "games": await cursor.to_list(length=limit),
        }

    async def list_public(
        self,
        *,
        page: int,
        limit: int,
        category: str | None = None,
        featured_only: bool = False,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {
            "status": "published",
            "show_on_landing_page": True,
            "logo_file_id": {"$nin": [None, ""]},
        }

        if category:
            query["category"] = category

        if featured_only:
            query["is_featured"] = True

        total = await self.collection.count_documents(query)
        cursor = (
            self.collection.find(query)
            .sort(
                [
                    ("is_featured", DESCENDING),
                    ("sort_order", ASCENDING),
                    ("updated_at", DESCENDING),
                ]
            )
            .skip((page - 1) * limit)
            .limit(limit)
        )

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": ceil(total / limit) if total else 0,
            "games": await cursor.to_list(length=limit),
        }

    async def statistics(self) -> dict[str, int]:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_games": {"$sum": 1},
                    "published_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "published"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "draft_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "draft"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "maintenance_games": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$status",
                                        "maintenance",
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "disabled_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "disabled"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "featured_games": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$is_featured", True]},
                                1,
                                0,
                            ]
                        }
                    },
                    "landing_page_games": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$eq": [
                                        "$show_on_landing_page",
                                        True,
                                    ]
                                },
                                1,
                                0,
                            ]
                        }
                    },
                    "total_play_count": {
                        "$sum": {
                            "$ifNull": ["$play_count", 0]
                        }
                    },
                }
            }
        ]

        rows = await self.collection.aggregate(
            pipeline
        ).to_list(length=1)

        if not rows:
            return {
                "total_games": 0,
                "published_games": 0,
                "draft_games": 0,
                "maintenance_games": 0,
                "disabled_games": 0,
                "featured_games": 0,
                "landing_page_games": 0,
                "total_play_count": 0,
            }

        result = rows[0]
        result.pop("_id", None)
        return result


__all__ = ["GameRepository"]