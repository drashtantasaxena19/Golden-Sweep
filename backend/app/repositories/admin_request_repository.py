from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING, ReturnDocument

from app.core.database import get_database


class AdminRequestRepository:
    @property
    def collection(self):
        return get_database()["admin_requests"]

    @property
    def audit_collection(self):
        return get_database()["admin_request_audit_logs"]

    @property
    def notification_collection(self):
        return get_database()["notifications"]

    async def create_indexes(self) -> None:
        await self.collection.create_index(
            [("request_number", ASCENDING)], unique=True, name="unique_request_number"
        )
        await self.collection.create_index(
            [("idempotency_key", ASCENDING)], unique=True, sparse=True, name="unique_request_idempotency"
        )
        await self.collection.create_index(
            [("status", ASCENDING), ("created_at", DESCENDING)], name="request_status_created"
        )
        await self.collection.create_index(
            [("request_type", ASCENDING), ("status", ASCENDING)], name="request_type_status"
        )
        await self.collection.create_index(
            [("priority_rank", DESCENDING), ("created_at", ASCENDING)], name="request_priority_queue"
        )
        await self.collection.create_index(
            [("assigned_admin_id", ASCENDING), ("status", ASCENDING)], name="request_assignee_status"
        )
        await self.collection.create_index(
            [("requester_id", ASCENDING), ("created_at", DESCENDING)], name="request_requester_created"
        )
        await self.collection.create_index(
            [("country", ASCENDING)], name="request_country"
        )
        await self.collection.create_index(
            [("deleted_at", ASCENDING)], name="request_deleted"
        )
        await self.collection.create_index(
            [
                ("request_number", "text"),
                ("title", "text"),
                ("description", "text"),
                ("requester_name", "text"),
                ("requester_email", "text"),
                ("company_name", "text"),
            ],
            name="request_text_search",
            default_language="english",
        )
        await self.audit_collection.create_index(
            [("request_id", ASCENDING), ("created_at", ASCENDING)], name="audit_request_created"
        )
        await self.notification_collection.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)], name="notification_user_created"
        )

    @staticmethod
    def _oid(value: str) -> ObjectId | None:
        return ObjectId(value) if ObjectId.is_valid(value) else None

    async def create(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document

    async def get_by_id(self, request_id: str, include_deleted: bool = False) -> dict[str, Any] | None:
        oid = self._oid(request_id)
        if not oid:
            return None
        query: dict[str, Any] = {"_id": oid}
        if not include_deleted:
            query["deleted_at"] = None
        return await self.collection.find_one(query)

    async def get_by_idempotency_key(self, key: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"idempotency_key": key, "deleted_at": None})

    def build_filters(
        self,
        *,
        search: str | None,
        request_type: str | None,
        status: str | None,
        priority: str | None,
        requester_role: str | None,
        country: str | None,
        assigned_admin_id: str | None,
        created_from: datetime | None,
        created_to: datetime | None,
        include_deleted: bool,
    ) -> dict[str, Any]:
        query: dict[str, Any] = {}
        if not include_deleted:
            query["deleted_at"] = None
        if request_type:
            query["request_type"] = request_type
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        if requester_role:
            query["requester_role"] = requester_role
        if country:
            query["country"] = {"$regex": f"^{re.escape(country)}$", "$options": "i"}
        if assigned_admin_id:
            query["assigned_admin_id"] = assigned_admin_id
        if created_from or created_to:
            query["created_at"] = {}
            if created_from:
                query["created_at"]["$gte"] = created_from
            if created_to:
                query["created_at"]["$lte"] = created_to
        if search:
            escaped = re.escape(search.strip())
            query["$or"] = [
                {"request_number": {"$regex": escaped, "$options": "i"}},
                {"title": {"$regex": escaped, "$options": "i"}},
                {"description": {"$regex": escaped, "$options": "i"}},
                {"requester_name": {"$regex": escaped, "$options": "i"}},
                {"requester_email": {"$regex": escaped, "$options": "i"}},
                {"company_name": {"$regex": escaped, "$options": "i"}},
            ]
        return query

    async def list_requests(
        self,
        *,
        filters: dict[str, Any],
        page: int,
        limit: int,
        sort: str,
    ) -> tuple[list[dict[str, Any]], int]:
        sort_map: dict[str, list[tuple[str, int]]] = {
            "newest": [("created_at", DESCENDING)],
            "oldest": [("created_at", ASCENDING)],
            "priority": [("priority_rank", DESCENDING), ("created_at", ASCENDING)],
            "updated": [("updated_at", DESCENDING)],
        }
        total = await self.collection.count_documents(filters)
        cursor = self.collection.find(filters)
        cursor = cursor.sort(sort_map.get(sort, sort_map["newest"]))
        cursor = cursor.skip((page - 1) * limit).limit(limit)
        rows = await cursor.to_list(length=limit)
        return rows, total

    async def update_if_status_allowed(
        self,
        *,
        request_id: str,
        allowed_statuses: list[str],
        update: dict[str, Any],
    ) -> dict[str, Any] | None:
        oid = self._oid(request_id)
        if not oid:
            return None
        return await self.collection.find_one_and_update(
            {"_id": oid, "deleted_at": None, "status": {"$in": allowed_statuses}},
            update,
            return_document=ReturnDocument.AFTER,
        )

    async def update(self, request_id: str, update: dict[str, Any]) -> dict[str, Any] | None:
        oid = self._oid(request_id)
        if not oid:
            return None
        return await self.collection.find_one_and_update(
            {"_id": oid, "deleted_at": None},
            update,
            return_document=ReturnDocument.AFTER,
        )

    async def soft_delete(self, request_id: str, deleted_at: datetime, actor_id: str | None) -> bool:
        oid = self._oid(request_id)
        if not oid:
            return False
        result = await self.collection.update_one(
            {"_id": oid, "deleted_at": None},
            {"$set": {"deleted_at": deleted_at, "deleted_by": actor_id, "updated_at": deleted_at}},
        )
        return result.modified_count == 1

    async def add_audit_log(self, document: dict[str, Any]) -> None:
        await self.audit_collection.insert_one(document)

    async def get_audit_logs(self, request_id: str) -> list[dict[str, Any]]:
        cursor = self.audit_collection.find({"request_id": request_id}).sort("created_at", ASCENDING)
        return await cursor.to_list(length=1000)

    async def create_notification(self, document: dict[str, Any]) -> None:
        await self.notification_collection.insert_one(document)

    async def get_statistics(self) -> dict[str, int]:
        pipeline = [
            {"$match": {"deleted_at": None}},
            {
                "$group": {
                    "_id": None,
                    "total_requests": {"$sum": 1},
                    "pending_requests": {"$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}},
                    "assigned_requests": {"$sum": {"$cond": [{"$eq": ["$status", "assigned"]}, 1, 0]}},
                    "in_review_requests": {"$sum": {"$cond": [{"$eq": ["$status", "in_review"]}, 1, 0]}},
                    "waiting_requests": {"$sum": {"$cond": [{"$eq": ["$status", "waiting_for_information"]}, 1, 0]}},
                    "approved_requests": {"$sum": {"$cond": [{"$eq": ["$status", "approved"]}, 1, 0]}},
                    "rejected_requests": {"$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}},
                    "cancelled_requests": {"$sum": {"$cond": [{"$eq": ["$status", "cancelled"]}, 1, 0]}},
                    "high_priority_requests": {"$sum": {"$cond": [{"$in": ["$priority", ["high", "urgent"]]}, 1, 0]}},
                }
            },
            {"$project": {"_id": 0}},
        ]
        cursor = await self.collection.aggregate(pipeline)
        rows = await cursor.to_list(length=1)
        defaults = {
            "total_requests": 0,
            "pending_requests": 0,
            "assigned_requests": 0,
            "in_review_requests": 0,
            "waiting_requests": 0,
            "approved_requests": 0,
            "rejected_requests": 0,
            "cancelled_requests": 0,
            "high_priority_requests": 0,
        }
        if not rows:
            return defaults
        return {key: int(rows[0].get(key, 0) or 0) for key in defaults}

    async def get_today_decision_counts(self, start: datetime, end: datetime) -> dict[str, int]:
        pipeline = [
            {"$match": {"deleted_at": None, "decided_at": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
        cursor = await self.collection.aggregate(pipeline)
        rows = await cursor.to_list(length=20)
        mapped = {row["_id"]: int(row["count"]) for row in rows}
        return {
            "approved_today": mapped.get("approved", 0),
            "rejected_today": mapped.get("rejected", 0),
        }

    async def distinct_values(self, field: str) -> list[str]:
        allowed = {"country", "requester_role", "request_type", "status", "priority"}
        if field not in allowed:
            return []
        values = await self.collection.distinct(field, {"deleted_at": None})
        return sorted(str(value) for value in values if value)


admin_request_repository = AdminRequestRepository()
