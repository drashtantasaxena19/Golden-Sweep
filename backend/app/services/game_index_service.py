from __future__ import annotations

import inspect
from collections.abc import AsyncGenerator
from typing import Any

from app.core.database import get_database
from app.repositories.game_repository import GameRepository
from app.services.gridfs_storage_service import GridFSStorageService


async def _resolve_database() -> tuple[Any, AsyncGenerator[Any, None] | None]:
    result = get_database()

    if inspect.isasyncgen(result):
        database = await result.__anext__()
        return database, result

    if inspect.isawaitable(result):
        return await result, None

    return result, None


async def initialize_game_indexes() -> None:
    database, generator = await _resolve_database()

    try:
        game_repository = GameRepository(database)
        gridfs_storage = GridFSStorageService(database)

        await game_repository.create_indexes()
        await gridfs_storage.create_indexes()
    finally:
        if generator is not None:
            await generator.aclose()


__all__ = ["initialize_game_indexes"]