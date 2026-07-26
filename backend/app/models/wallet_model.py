from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_wallet_document(user_id: str) -> dict[str, Any]:
    now = utc_now()
    return {
        "user_id": user_id,
        "balance": 0,
        "is_frozen": False,
        "created_at": now,
        "updated_at": now,
    }


def build_wallet_transaction_document(
    *,
    wallet_id: str,
    user_id: str,
    transaction_type: str,
    amount: int,
    balance_before: int,
    balance_after: int,
    reason: str,
    reference_id: str | None,
    created_by: str | None,
) -> dict[str, Any]:
    return {
        "wallet_id": wallet_id,
        "user_id": user_id,
        "transaction_type": transaction_type,
        "amount": int(amount),
        "balance_before": int(balance_before),
        "balance_after": int(balance_after),
        "reason": reason,
        "reference_id": reference_id,
        "created_by": created_by,
        "created_at": utc_now(),
    }
