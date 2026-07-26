from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING


class TransactionRepository:
    COLLECTION = "wallet_transactions"

    def __init__(self, database):
        self.collection = database[self.COLLECTION]

    async def create_indexes(self) -> None:
        await self.collection.create_index(
            [("created_at", DESCENDING)],
            name="idx_transactions_created_at",
        )
        await self.collection.create_index(
            [("transaction_type", ASCENDING), ("created_at", DESCENDING)],
            name="idx_transactions_type_created",
        )
        await self.collection.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_transactions_user_created",
        )
        await self.collection.create_index(
            [("wallet_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_transactions_wallet_created",
        )
        await self.collection.create_index(
            [("reference_id", ASCENDING)],
            sparse=True,
            name="idx_transactions_reference_id",
        )
        await self.collection.create_index(
            [("created_by", ASCENDING), ("created_at", DESCENDING)],
            sparse=True,
            name="idx_transactions_created_by",
        )

    @staticmethod
    def object_id(value: str) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid transaction ID.")
        return ObjectId(value)

    async def get_by_id(self, transaction_id: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one(
            {"_id": self.object_id(transaction_id)}
        )

    @staticmethod
    def build_query(
        *,
        search: str | None,
        transaction_type: str | None,
        user_id: str | None,
        wallet_id: str | None,
        created_by: str | None,
        minimum_amount: int | None,
        maximum_amount: int | None,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {}

        if search:
            query["$or"] = [
                {"user_id": {"$regex": search, "$options": "i"}},
                {"wallet_id": {"$regex": search, "$options": "i"}},
                {"reference_id": {"$regex": search, "$options": "i"}},
                {"reason": {"$regex": search, "$options": "i"}},
                {"created_by": {"$regex": search, "$options": "i"}},
            ]

        if transaction_type:
            query["transaction_type"] = transaction_type

        if user_id:
            query["user_id"] = user_id

        if wallet_id:
            query["wallet_id"] = wallet_id

        if created_by:
            query["created_by"] = created_by

        if minimum_amount is not None or maximum_amount is not None:
            query["amount"] = {}
            if minimum_amount is not None:
                query["amount"]["$gte"] = minimum_amount
            if maximum_amount is not None:
                query["amount"]["$lte"] = maximum_amount

        if start_date is not None or end_date is not None:
            query["created_at"] = {}
            if start_date is not None:
                query["created_at"]["$gte"] = start_date
            if end_date is not None:
                query["created_at"]["$lte"] = end_date

        return query

    async def list_transactions(
        self,
        *,
        page: int,
        limit: int,
        search: str | None,
        transaction_type: str | None,
        user_id: str | None,
        wallet_id: str | None,
        created_by: str | None,
        minimum_amount: int | None,
        maximum_amount: int | None,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> tuple[list[dict[str, Any]], int]:
        query = self.build_query(
            search=search,
            transaction_type=transaction_type,
            user_id=user_id,
            wallet_id=wallet_id,
            created_by=created_by,
            minimum_amount=minimum_amount,
            maximum_amount=maximum_amount,
            start_date=start_date,
            end_date=end_date,
        )

        total = await self.collection.count_documents(query)

        cursor = (
            self.collection.find(query)
            .sort([("created_at", DESCENDING), ("_id", DESCENDING)])
            .skip((page - 1) * limit)
            .limit(limit)
        )

        rows = await cursor.to_list(length=limit)
        return rows, total

    async def statistics(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> dict[str, Any]:
        match: dict[str, Any] = {}

        if start_date is not None or end_date is not None:
            match["created_at"] = {}
            if start_date is not None:
                match["created_at"]["$gte"] = start_date
            if end_date is not None:
                match["created_at"]["$lte"] = end_date

        credit_types = ["purchase", "admin_credit", "refund"]
        debit_types = ["game_entry", "admin_debit"]

        pipeline: list[dict[str, Any]] = []

        if match:
            pipeline.append({"$match": match})

        pipeline.append(
            {
                "$group": {
                    "_id": None,
                    "total_transactions": {"$sum": 1},
                    "total_purchase_transactions": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$transaction_type", "purchase"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_game_entry_transactions": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$transaction_type", "game_entry"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_admin_credit_transactions": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$transaction_type", "admin_credit"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_admin_debit_transactions": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$transaction_type", "admin_debit"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_refund_transactions": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$transaction_type", "refund"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "total_credited_coins": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$transaction_type", credit_types]},
                                "$amount",
                                0,
                            ]
                        }
                    },
                    "total_debited_coins": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$transaction_type", debit_types]},
                                "$amount",
                                0,
                            ]
                        }
                    },
                }
            }
        )

        cursor = await self.collection.aggregate(pipeline)
        rows = await cursor.to_list(length=1)

        if not rows:
            return {
                "total_transactions": 0,
                "total_purchase_transactions": 0,
                "total_game_entry_transactions": 0,
                "total_admin_credit_transactions": 0,
                "total_admin_debit_transactions": 0,
                "total_refund_transactions": 0,
                "total_credited_coins": 0,
                "total_debited_coins": 0,
                "net_coin_change": 0,
            }

        data = rows[0]
        credited = int(data.get("total_credited_coins", 0))
        debited = int(data.get("total_debited_coins", 0))

        return {
            "total_transactions": int(data.get("total_transactions", 0)),
            "total_purchase_transactions": int(
                data.get("total_purchase_transactions", 0)
            ),
            "total_game_entry_transactions": int(
                data.get("total_game_entry_transactions", 0)
            ),
            "total_admin_credit_transactions": int(
                data.get("total_admin_credit_transactions", 0)
            ),
            "total_admin_debit_transactions": int(
                data.get("total_admin_debit_transactions", 0)
            ),
            "total_refund_transactions": int(
                data.get("total_refund_transactions", 0)
            ),
            "total_credited_coins": credited,
            "total_debited_coins": debited,
            "net_coin_change": credited - debited,
        }

    async def type_breakdown(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> list[dict[str, Any]]:
        match: dict[str, Any] = {}

        if start_date is not None or end_date is not None:
            match["created_at"] = {}
            if start_date is not None:
                match["created_at"]["$gte"] = start_date
            if end_date is not None:
                match["created_at"]["$lte"] = end_date

        pipeline: list[dict[str, Any]] = []

        if match:
            pipeline.append({"$match": match})

        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": "$transaction_type",
                        "count": {"$sum": 1},
                        "total_amount": {"$sum": "$amount"},
                    }
                },
                {"$sort": {"count": -1, "_id": 1}},
            ]
        )

        cursor = await self.collection.aggregate(pipeline)
        return await cursor.to_list(length=20)

    async def daily_trend(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        match: dict[str, Any] = {}

        if start_date is not None or end_date is not None:
            match["created_at"] = {}
            if start_date is not None:
                match["created_at"]["$gte"] = start_date
            if end_date is not None:
                match["created_at"]["$lte"] = end_date

        credit_types = ["purchase", "admin_credit", "refund"]
        debit_types = ["game_entry", "admin_debit"]

        pipeline: list[dict[str, Any]] = []

        if match:
            pipeline.append({"$match": match})

        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at",
                                "timezone": "UTC",
                            }
                        },
                        "transaction_count": {"$sum": 1},
                        "credited_coins": {
                            "$sum": {
                                "$cond": [
                                    {"$in": ["$transaction_type", credit_types]},
                                    "$amount",
                                    0,
                                ]
                            }
                        },
                        "debited_coins": {
                            "$sum": {
                                "$cond": [
                                    {"$in": ["$transaction_type", debit_types]},
                                    "$amount",
                                    0,
                                ]
                            }
                        },
                    }
                },
                {"$sort": {"_id": -1}},
                {"$limit": limit},
                {"$sort": {"_id": 1}},
            ]
        )

        cursor = await self.collection.aggregate(pipeline)
        return await cursor.to_list(length=limit)
