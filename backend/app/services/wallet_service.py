from __future__ import annotations

from typing import Any

from pymongo.errors import DuplicateKeyError

from app.models.wallet_model import (
    build_wallet_document,
    build_wallet_transaction_document,
)
from app.repositories.wallet_repository import WalletRepository


class WalletService:
    def __init__(self, repository: WalletRepository):
        self.repository = repository

    @staticmethod
    def serialize_wallet(document: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": str(document["_id"]),
            "user_id": document["user_id"],
            "balance": int(document.get("balance", 0)),
            "is_frozen": bool(document.get("is_frozen", False)),
            "created_at": document["created_at"],
            "updated_at": document["updated_at"],
        }

    @staticmethod
    def serialize_transaction(document: dict[str, Any]) -> dict[str, Any]:
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

    async def get_or_create_wallet(self, user_id: str) -> dict[str, Any]:
        wallet = await self.repository.get_by_user_id(user_id)
        if wallet:
            return self.serialize_wallet(wallet)

        try:
            wallet = await self.repository.create_wallet(
                build_wallet_document(user_id),
            )
        except DuplicateKeyError:
            wallet = await self.repository.get_by_user_id(user_id)
            if wallet is None:
                raise RuntimeError("Wallet could not be created.")
        return self.serialize_wallet(wallet)

    async def get_wallet(self, wallet_id: str) -> dict[str, Any]:
        wallet = await self.repository.get_by_id(wallet_id)
        if wallet is None:
            raise LookupError("Wallet not found.")
        return self.serialize_wallet(wallet)

    async def get_wallet_by_user(self, user_id: str) -> dict[str, Any]:
        wallet = await self.repository.get_by_user_id(user_id)
        if wallet is None:
            raise LookupError("Wallet not found.")
        return self.serialize_wallet(wallet)

    async def list_wallets(
        self,
        *,
        page: int,
        limit: int,
        search: str | None,
        is_frozen: bool | None,
        minimum_balance: int | None,
        maximum_balance: int | None,
    ) -> dict[str, Any]:
        wallets, total = await self.repository.list_wallets(
            page=page,
            limit=limit,
            search=search,
            is_frozen=is_frozen,
            minimum_balance=minimum_balance,
            maximum_balance=maximum_balance,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "wallets": [self.serialize_wallet(wallet) for wallet in wallets],
        }

    async def adjust_balance(
        self,
        *,
        wallet_id: str,
        amount: int,
        reason: str,
        reference_id: str | None,
        admin_id: str | None,
        transaction_type: str,
    ) -> dict[str, Any]:
        wallet = await self.repository.get_by_id(wallet_id)
        if wallet is None:
            raise LookupError("Wallet not found.")

        if wallet.get("is_frozen"):
            raise ValueError("Wallet is frozen.")

        balance_before = int(wallet.get("balance", 0))
        is_debit = transaction_type in {"admin_debit", "game_entry"}
        balance_after = balance_before - amount if is_debit else balance_before + amount

        if balance_after < 0:
            raise ValueError("Wallet has insufficient balance.")

        updated = await self.repository.update_balance(
            wallet_id=wallet_id,
            expected_balance=balance_before,
            new_balance=balance_after,
        )
        if updated is None:
            raise RuntimeError("Wallet balance changed concurrently. Please retry.")

        transaction = build_wallet_transaction_document(
            wallet_id=wallet_id,
            user_id=wallet["user_id"],
            transaction_type=transaction_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reason=reason,
            reference_id=reference_id,
            created_by=admin_id,
        )
        await self.repository.create_transaction(transaction)
        return self.serialize_wallet(updated)

    async def set_frozen(
        self,
        wallet_id: str,
        is_frozen: bool,
    ) -> dict[str, Any]:
        updated = await self.repository.set_frozen(wallet_id, is_frozen)
        if updated is None:
            raise LookupError("Wallet not found.")
        return self.serialize_wallet(updated)

    async def list_transactions(
        self,
        *,
        page: int,
        limit: int,
        user_id: str | None,
        wallet_id: str | None,
        transaction_type: str | None,
    ) -> dict[str, Any]:
        rows, total = await self.repository.list_transactions(
            page=page,
            limit=limit,
            user_id=user_id,
            wallet_id=wallet_id,
            transaction_type=transaction_type,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "transactions": [
                self.serialize_transaction(transaction)
                for transaction in rows
            ],
        }

    async def statistics(self) -> dict[str, Any]:
        statistics = await self.repository.statistics()
        statistics.pop("_id", None)
        return statistics
