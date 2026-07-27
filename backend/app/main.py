from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin_dashboard_routes import (
    router as admin_dashboard_router,
)
from app.api.admin_routes import router as admin_router
from app.api.analytics_routes import router as analytics_router
from app.api.auth_routes import router as auth_router
from app.api.game_routes import (
    admin_router as admin_game_router,
    public_router as public_game_router,
)
from app.api.player_recharge_routes import (
    router as player_recharge_router,
)
from app.api.recharge_routes import router as recharge_router
from app.api.transaction_routes import router as transaction_router
from app.api.user_management_routes import (
    router as user_management_router,
)
from app.api.user_routes import router as user_router
from app.api.wallet_routes import router as wallet_router
from app.core.config import settings
from app.core.database import close_database, connect_database
from app.repositories.user_repository import user_repository
from app.services.game_index_service import initialize_game_indexes
from app.services.transaction_index_service import (
    initialize_transaction_indexes,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    del app

    await connect_database()

    try:
        await user_repository.create_indexes()
        await initialize_transaction_indexes()
        await initialize_game_indexes()

        print("✅ Database indexes ready")

        yield
    finally:
        await close_database()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(user_router)

app.include_router(
    recharge_router,
    prefix="/api",
)

app.include_router(
    player_recharge_router,
    prefix="/api",
)

app.include_router(
    admin_router,
    prefix="/api",
)

app.include_router(
    admin_dashboard_router,
    prefix="/api",
)

app.include_router(
    user_management_router,
    prefix="/api",
)

app.include_router(
    wallet_router,
    prefix="/api",
)

app.include_router(
    transaction_router,
    prefix="/api",
)

app.include_router(
    admin_game_router,
    prefix="/api",
)

app.include_router(
    public_game_router,
    prefix="/api",
)

app.include_router(
    analytics_router,
    prefix="/api",
)


@app.get("/")
async def root() -> dict[str, bool | str]:
    return {
        "success": True,
        "message": "GoldenSweep API is running",
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }