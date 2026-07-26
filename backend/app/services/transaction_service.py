from __future__ import annotations

from datetime import datetime
from typing import Any

from app.repositories.transaction_repository import TransactionRepository


TRANSACTION_TYPES = [
    "purchase",
    "game_entry",
    "admin_credit",
    "admin_debit",
    "refund",
]


class TransactionService:
    def __init__(self, repository: TransactionRepository):
        self.repository = repository

    @staticmethod
    def serialize(document: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": str(document["_id"]),
            "wallet_id": document["wallet_id"],
            "user_id": document["user_id"],
            "transaction_type": document["transaction_type"],
            "amount": int(document["amount"]),
            "balance_before": int(document["balance_before"]),
            "balance_after": int(document["balance_after"]),
            "reason": document["reason"],
            "reference_id": document.get("reference_id"),
            "created_by": document.get("created_by"),
            "created_at": document["created_at"],
        }

    async def get_transaction(self, transaction_id: str) -> dict[str, Any]:
        transaction = await self.repository.get_by_id(transaction_id)
        if transaction is None:
            raise LookupError("Transaction not found.")
        return self.serialize(transaction)

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
    ) -> dict[str, Any]:
        rows, total = await self.repository.list_transactions(
            page=page,
            limit=limit,
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

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "transactions": [self.serialize(row) for row in rows],
        }

    async def statistics(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> dict[str, Any]:
        return await self.repository.statistics(
            start_date=start_date,
            end_date=end_date,
        )

    async def type_breakdown(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
    ) -> dict[str, Any]:
        rows = await self.repository.type_breakdown(
            start_date=start_date,
            end_date=end_date,
        )

        return {
            "items": [
                {
                    "transaction_type": row["_id"],
                    "count": int(row.get("count", 0)),
                    "total_amount": int(row.get("total_amount", 0)),
                }
                for row in rows
            ]
        }

    async def daily_trend(
        self,
        *,
        start_date: datetime | None,
        end_date: datetime | None,
        limit: int,
    ) -> dict[str, Any]:
        rows = await self.repository.daily_trend(
            start_date=start_date,
            end_date=end_date,
            limit=limit,
        )

        return {
            "items": [
                {
                    "date": row["_id"],
                    "transaction_count": int(row.get("transaction_count", 0)),
                    "credited_coins": int(row.get("credited_coins", 0)),
                    "debited_coins": int(row.get("debited_coins", 0)),
                    "net_change": int(row.get("credited_coins", 0))
                    - int(row.get("debited_coins", 0)),
                }
                for row in rows
            ]
        }

    @staticmethod
    def filter_options() -> dict[str, Any]:
        return {"transaction_types": TRANSACTION_TYPES}
