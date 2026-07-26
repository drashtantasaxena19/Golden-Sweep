from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING, ReturnDocument


class WalletRepository:
    WALLET_COLLECTION = "wallets"
    TRANSACTION_COLLECTION = "wallet_transactions"

    def __init__(self, database):
        self.wallets = database[self.WALLET_COLLECTION]
        self.transactions = database[self.TRANSACTION_COLLECTION]

    async def create_indexes(self) -> None:
        await self.wallets.create_index(
            [("user_id", ASCENDING)],
            unique=True,
            name="uq_wallet_user_id",
        )
        await self.wallets.create_index(
            [("is_frozen", ASCENDING), ("balance", DESCENDING)],
            name="idx_wallet_status_balance",
        )
        await self.transactions.create_index(
            [("wallet_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_wallet_transactions_wallet_created",
        )
        await self.transactions.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_wallet_transactions_user_created",
        )
        await self.transactions.create_index(
            [("transaction_type", ASCENDING), ("created_at", DESCENDING)],
            name="idx_wallet_transactions_type_created",
        )
        await self.transactions.create_index(
            [("reference_id", ASCENDING)],
            sparse=True,
            name="idx_wallet_transactions_reference",
        )

    @staticmethod
    def object_id(value: str) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid wallet ID.")
        return ObjectId(value)

    async def get_by_id(self, wallet_id: str) -> Optional[dict[str, Any]]:
        return await self.wallets.find_one({"_id": self.object_id(wallet_id)})

    async def get_by_user_id(self, user_id: str) -> Optional[dict[str, Any]]:
        return await self.wallets.find_one({"user_id": user_id})

    async def create_wallet(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.wallets.insert_one(document)
        wallet = await self.wallets.find_one({"_id": result.inserted_id})
        if wallet is None:
            raise RuntimeError("Wallet could not be loaded after creation.")
        return wallet

    async def list_wallets(
        self,
        *,
        page: int,
        limit: int,
        search: str | None,
        is_frozen: bool | None,
        minimum_balance: int | None,
        maximum_balance: int | None,
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {}

        if search:
            query["user_id"] = {"$regex": search, "$options": "i"}

        if is_frozen is not None:
            query["is_frozen"] = is_frozen

        if minimum_balance is not None or maximum_balance is not None:
            query["balance"] = {}
            if minimum_balance is not None:
                query["balance"]["$gte"] = minimum_balance
            if maximum_balance is not None:
                query["balance"]["$lte"] = maximum_balance

        total = await self.wallets.count_documents(query)
        cursor = self.wallets.find(query)
        cursor = cursor.sort([("updated_at", DESCENDING), ("_id", DESCENDING)])
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        rows = await cursor.to_list(length=limit)
        return rows, total

    async def update_balance(
        self,
        *,
        wallet_id: str,
        expected_balance: int,
        new_balance: int,
    ) -> Optional[dict[str, Any]]:
        return await self.wallets.find_one_and_update(
            {
                "_id": self.object_id(wallet_id),
                "balance": expected_balance,
            },
            {
                "$set": {
                    "balance": new_balance,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            return_document=ReturnDocument.AFTER,
        )

    async def set_frozen(
        self,
        wallet_id: str,
        is_frozen: bool,
    ) -> Optional[dict[str, Any]]:
        return await self.wallets.find_one_and_update(
            {"_id": self.object_id(wallet_id)},
            {
                "$set": {
                    "is_frozen": is_frozen,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            return_document=ReturnDocument.AFTER,
        )

    async def create_transaction(
        self,
        document: dict[str, Any],
    ) -> dict[str, Any]:
        result = await self.transactions.insert_one(document)
        transaction = await self.transactions.find_one({"_id": result.inserted_id})
        if transaction is None:
            raise RuntimeError("Wallet transaction could not be loaded.")
        return transaction

    async def list_transactions(
        self,
        *,
        page: int,
        limit: int,
        user_id: str | None,
        wallet_id: str | None,
        transaction_type: str | None,
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {}

        if user_id:
            query["user_id"] = user_id

        if wallet_id:
            query["wallet_id"] = wallet_id

        if transaction_type:
            query["transaction_type"] = transaction_type

        total = await self.transactions.count_documents(query)
        cursor = self.transactions.find(query)
        cursor = cursor.sort([("created_at", DESCENDING), ("_id", DESCENDING)])
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        rows = await cursor.to_list(length=limit)
        return rows, total

    async def statistics(self) -> dict[str, Any]:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_wallets": {"$sum": 1},
                    "active_wallets": {
                        "$sum": {"$cond": [{"$eq": ["$is_frozen", False]}, 1, 0]}
                    },
                    "frozen_wallets": {
                        "$sum": {"$cond": [{"$eq": ["$is_frozen", True]}, 1, 0]}
                    },
                    "total_coins_in_circulation": {"$sum": "$balance"},
                    "zero_balance_wallets": {
                        "$sum": {"$cond": [{"$eq": ["$balance", 0]}, 1, 0]}
                    },
                    "positive_balance_wallets": {
                        "$sum": {"$cond": [{"$gt": ["$balance", 0]}, 1, 0]}
                    },
                }
            }
        ]
        cursor = await self.wallets.aggregate(pipeline)
        rows = await cursor.to_list(length=1)
        return rows[0] if rows else {
            "total_wallets": 0,
            "active_wallets": 0,
            "frozen_wallets": 0,
            "total_coins_in_circulation": 0,
            "zero_balance_wallets": 0,
            "positive_balance_wallets": 0,
        }
