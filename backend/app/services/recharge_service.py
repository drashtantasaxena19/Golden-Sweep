from __future__ import annotations

from typing import Any

from pymongo.errors import DuplicateKeyError

from app.models.recharge_model import build_recharge_package_document
from app.schemas.recharge_schema import (
    RechargePackageCreate,
    RechargePackageUpdate,
)
from app.repositories.recharge_repository import RechargeRepository


class RechargeService:
    ALLOWED_SORT_FIELDS = {
        "created_at",
        "updated_at",
        "name",
        "price",
        "coins",
        "bonus_coins",
        "sort_order",
    }

    def __init__(self, repository: RechargeRepository):
        self.repository = repository

    @staticmethod
    def serialize(document: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": str(document["_id"]),
            "name": document["name"],
            "description": document.get("description"),
            "price": float(document["price"]),
            "currency": document.get("currency", "INR"),
            "coins": int(document["coins"]),
            "bonus_coins": int(document.get("bonus_coins", 0)),
            "total_coins": int(document["coins"]) + int(document.get("bonus_coins", 0)),
            "badge": document.get("badge"),
            "sort_order": int(document.get("sort_order", 0)),
            "is_active": bool(document.get("is_active", True)),
            "created_by": document.get("created_by"),
            "updated_by": document.get("updated_by"),
            "created_at": document["created_at"],
            "updated_at": document["updated_at"],
        }

    async def create(
        self,
        payload: RechargePackageCreate,
        admin_id: str | None,
    ) -> dict[str, Any]:
        existing = await self.repository.get_by_name(payload.name)
        if existing:
            raise ValueError("A recharge package with this name already exists.")

        document = build_recharge_package_document(
            **payload.model_dump(),
            admin_id=admin_id,
        )
        try:
            created = await self.repository.create(document)
        except DuplicateKeyError as error:
            raise ValueError("A recharge package with this name already exists.") from error
        return self.serialize(created)

    async def list(
        self,
        *,
        page: int,
        limit: int,
        search: str | None,
        is_active: bool | None,
        currency: str | None,
        sort_by: str,
        sort_order: str,
    ) -> dict[str, Any]:
        if sort_by not in self.ALLOWED_SORT_FIELDS:
            sort_by = "sort_order"

        direction = -1 if sort_order.lower() == "desc" else 1
        rows, total = await self.repository.list(
            page=page,
            limit=limit,
            search=search,
            is_active=is_active,
            currency=currency,
            sort_by=sort_by,
            sort_direction=direction,
        )
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "packages": [self.serialize(row) for row in rows],
        }

    async def get(self, package_id: str) -> dict[str, Any]:
        row = await self.repository.get_by_id(package_id)
        if row is None:
            raise LookupError("Recharge package not found.")
        return self.serialize(row)

    async def update(
        self,
        package_id: str,
        payload: RechargePackageUpdate,
        admin_id: str | None,
    ) -> dict[str, Any]:
        updates = payload.model_dump(exclude_unset=True)
        if not updates:
            return await self.get(package_id)

        if "name" in updates:
            existing = await self.repository.get_by_name(updates["name"])
            if existing and str(existing["_id"]) != package_id:
                raise ValueError("A recharge package with this name already exists.")

        try:
            updated = await self.repository.update(package_id, updates, admin_id)
        except DuplicateKeyError as error:
            raise ValueError("A recharge package with this name already exists.") from error

        if updated is None:
            raise LookupError("Recharge package not found.")
        return self.serialize(updated)

    async def set_active(
        self,
        package_id: str,
        is_active: bool,
        admin_id: str | None,
    ) -> dict[str, Any]:
        updated = await self.repository.set_active(package_id, is_active, admin_id)
        if updated is None:
            raise LookupError("Recharge package not found.")
        return self.serialize(updated)

    async def delete(self, package_id: str, admin_id: str | None) -> None:
        deleted = await self.repository.soft_delete(package_id, admin_id)
        if not deleted:
            raise LookupError("Recharge package not found.")

    async def statistics(self) -> dict[str, Any]:
        stats = await self.repository.statistics()
        stats.pop("_id", None)
        return stats
