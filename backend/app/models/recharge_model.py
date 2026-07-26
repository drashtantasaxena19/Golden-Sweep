from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_recharge_package_document(
    *,
    name: str,
    description: str | None,
    price: float,
    currency: str,
    coins: int,
    bonus_coins: int,
    badge: str | None,
    sort_order: int,
    is_active: bool,
    admin_id: str | None,
) -> dict[str, Any]:
    now = utc_now()
    return {
        "name": name,
        "description": description,
        "price": float(price),
        "currency": currency,
        "coins": int(coins),
        "bonus_coins": int(bonus_coins),
        "badge": badge,
        "sort_order": int(sort_order),
        "is_active": bool(is_active),
        "created_by": admin_id,
        "updated_by": admin_id,
        "created_at": now,
        "updated_at": now,
        "deleted_at": None,
    }
