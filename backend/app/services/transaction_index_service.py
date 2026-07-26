from __future__ import annotations

from app.core.database import get_database
from app.repositories.transaction_repository import TransactionRepository


async def initialize_transaction_indexes() -> None:
    database = get_database()
    if hasattr(database, "__await__"):
        database = await database
    await TransactionRepository(database).create_indexes()
