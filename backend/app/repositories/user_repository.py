from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo import ASCENDING

from app.core.database import get_database


class UserRepository:
    @property
    def collection(self):
        return get_database()["users"]

    async def create_indexes(self) -> None:
        await self.collection.create_index(
            [("email", ASCENDING)],
            unique=True,
            name="unique_user_email",
        )
        await self.collection.create_index(
            [("phone", ASCENDING)],
            unique=True,
            sparse=True,
            name="unique_user_phone",
        )

    async def create(self, user: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(user)
        user["_id"] = result.inserted_id
        return user

    async def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"email": email.strip().lower()})

    async def find_by_phone(self, phone: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"phone": phone.strip()})

    async def update_by_id(
        self, user_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        if not ObjectId.is_valid(user_id):
            return None

        updates["updated_at"] = datetime.now(timezone.utc)

        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates},
        )

        return await self.find_by_id(user_id)

    async def update_by_email(
        self, email: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        updates["updated_at"] = datetime.now(timezone.utc)

        await self.collection.update_one(
            {"email": email.strip().lower()},
            {"$set": updates},
        )

        return await self.find_by_email(email)
    
    async def delete_by_id(
        self,
        user_id: str,
    ) ->bool:
        if not ObjectId.is_valid(
            user_id
        ):
            return False

        result = await (
            self.collection
            .delete_one(
                {
                    "_id":
                        ObjectId(
                            user_id
                        )
                }
            )
        )

        return (
            result.deleted_count
            == 1
        )


user_repository = UserRepository()
