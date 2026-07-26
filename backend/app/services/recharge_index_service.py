from __future__ import annotations

from app.core.database import get_database
from backend.app.repositories.recharge_repository import RechargeRepository


async def initialize_recharge_indexes() -> None:
    database = get_database()
    if hasattr(database, "__await__"):
        database = await database
    await RechargeRepository(database).ensure_indexes()
