from __future__ import annotations

from app.core.database import get_database
from app.repositories.wallet_repository import WalletRepository


async def initialize_wallet_indexes() -> None:
    database = get_database()
    if hasattr(database, "__await__"):
        database = await database
    await WalletRepository(database).create_indexes()
