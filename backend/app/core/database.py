from __future__ import annotations

from urllib.parse import urlparse

from pymongo import AsyncMongoClient
from pymongo.errors import (
    ConfigurationError,
    ConnectionFailure,
    InvalidURI,
    ServerSelectionTimeoutError,
)

from app.core.config import settings


class Database:
    client: AsyncMongoClient | None = None
    db = None


database = Database()


def _safe_mongodb_host() -> str:
    try:
        parsed = urlparse(
            settings.MONGODB_URI.replace(
                "mongodb+srv://",
                "mongodb://",
                1,
            )
        )

        return parsed.hostname or "MongoDB Atlas"
    except Exception:
        return "MongoDB Atlas"


async def connect_database() -> None:
    if database.client is not None and database.db is not None:
        return

    client = AsyncMongoClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=15_000,
        connectTimeoutMS=15_000,
        socketTimeoutMS=20_000,
        retryWrites=True,
        retryReads=True,
        tz_aware=True,
        appname="GoldenSweep API",
    )

    try:
        await client.admin.command("ping")

    except InvalidURI as exc:
        await client.close()

        raise RuntimeError(
            "MongoDB connection string is invalid. "
            "Check MONGODB_URI in backend/.env."
        ) from exc

    except ConfigurationError as exc:
        await client.close()

        raise RuntimeError(
            "MongoDB configuration or DNS resolution failed. "
            "Check the Atlas connection string and your internet/DNS settings."
        ) from exc

    except ServerSelectionTimeoutError as exc:
        await client.close()

        host = _safe_mongodb_host()

        raise RuntimeError(
            "\nMongoDB Atlas connection failed.\n"
            f"Target: {host}\n"
            "Check these items:\n"
            "1. MongoDB Atlas cluster is running and not paused.\n"
            "2. Atlas Network Access allows your current IP address.\n"
            "3. The database username and password in MONGODB_URI are correct.\n"
            "4. Special password characters are URL encoded.\n"
            "5. Firewall, VPN, antivirus, or DNS is not blocking port 27017.\n"
        ) from exc

    except ConnectionFailure as exc:
        await client.close()

        raise RuntimeError(
            "MongoDB connection failed. "
            "Check your internet connection, Atlas network access, and credentials."
        ) from exc

    except Exception:
        await client.close()
        raise

    database.client = client
    database.db = client[settings.MONGODB_DB_NAME]

    print(
        "✅ MongoDB connected: "
        f"{settings.MONGODB_DB_NAME}"
    )


async def close_database() -> None:
    if database.client is not None:
        await database.client.close()

    database.client = None
    database.db = None

    print("🛑 MongoDB connection closed")


def get_database():
    if database.db is None:
        raise RuntimeError(
            "Database is not initialized. "
            "Ensure connect_database() completed successfully."
        )

    return database.db