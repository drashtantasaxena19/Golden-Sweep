from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.admin_request_model import public_request_number, timeline_event, utc_now
from app.repositories.admin_request_repository import admin_request_repository
from app.schemas.admin_request import (
    AdminRequestApprove,
    AdminRequestAssign,
    AdminRequestCancel,
    AdminRequestCreate,
    AdminRequestFilter,
    AdminRequestInformationRequest,
    AdminRequestNoteCreate,
    AdminRequestPriorityUpdate,
    AdminRequestReject,
    BulkAdminRequestAction,
    BulkAdminRequestReject,
)


class AdminRequestService:
    PRIORITY_RANK = {"low": 1, "normal": 2, "high": 3, "urgent": 4}
    ACTIONABLE_STATUSES = ["pending", "assigned", "in_review", "waiting_for_information"]

    @staticmethod
    def _actor(current_user: dict[str, Any] | None) -> dict[str, str | None]:
        current_user = current_user or {}
        actor_id = current_user.get("id") or current_user.get("_id") or current_user.get("uid") or current_user.get("user_id")
        return {
            "id": str(actor_id) if actor_id is not None else None,
            "name": current_user.get("full_name") or current_user.get("name") or current_user.get("email") or "Administrator",
            "role": current_user.get("role") or "admin",
        }

    @staticmethod
    def _iso(value: Any) -> str | None:
        return value.isoformat() if isinstance(value, datetime) else (str(value) if value else None)

    def _serialize_event(self, event: dict[str, Any]) -> dict[str, Any]:
        return {
            "event_id": event.get("event_id"),
            "action": event.get("action"),
            "actor_id": event.get("actor_id"),
            "actor_name": event.get("actor_name"),
            "actor_role": event.get("actor_role"),
            "message": event.get("message"),
            "metadata": event.get("metadata") or {},
            "created_at": self._iso(event.get("created_at")),
        }

    def _serialize(self, row: dict[str, Any], include_details: bool = False) -> dict[str, Any]:
        result = {
            "id": str(row["_id"]),
            "request_number": row.get("request_number"),
            "request_type": row.get("request_type"),
            "title": row.get("title"),
            "description": row.get("description"),
            "priority": row.get("priority", "normal"),
            "status": row.get("status", "pending"),
            "requester_id": row.get("requester_id"),
            "requester_name": row.get("requester_name"),
            "requester_email": row.get("requester_email"),
            "requester_role": row.get("requester_role"),
            "company_id": row.get("company_id"),
            "company_name": row.get("company_name"),
            "country": row.get("country"),
            "assigned_admin_id": row.get("assigned_admin_id"),
            "assigned_admin_name": row.get("assigned_admin_name"),
            "created_at": self._iso(row.get("created_at")),
            "updated_at": self._iso(row.get("updated_at")),
            "decided_at": self._iso(row.get("decided_at")),
            "decision_by_id": row.get("decision_by_id"),
            "decision_by_name": row.get("decision_by_name"),
            "rejection_reason": row.get("rejection_reason"),
            "resolution_note": row.get("resolution_note"),
            "notes_count": len(row.get("notes") or []),
            "attachments_count": len(row.get("attachments") or []),
        }
        if include_details:
            result.update(
                {
                    "payload": row.get("payload") or {},
                    "attachments": row.get("attachments") or [],
                    "notes": [
                        {
                            **{k: v for k, v in note.items() if k != "created_at"},
                            "created_at": self._iso(note.get("created_at")),
                        }
                        for note in row.get("notes") or []
                    ],
                    "timeline": [self._serialize_event(event) for event in row.get("timeline") or []],
                    "resolution_data": row.get("resolution_data") or {},
                    "information_request": row.get("information_request"),
                }
            )
        return result

    async def initialise(self) -> None:
        await admin_request_repository.create_indexes()

    async def create_request(self, payload: AdminRequestCreate, current_user: dict[str, Any] | None = None) -> dict[str, Any]:
        actor = self._actor(current_user)
        if payload.idempotency_key:
            existing = await admin_request_repository.get_by_idempotency_key(payload.idempotency_key)
            if existing:
                return self._serialize(existing, include_details=True)

        now = utc_now()
        requester_id = payload.requester_id or actor["id"]
        requester_name = payload.requester_name or actor["name"]
        requester_role = payload.requester_role or actor["role"]
        event = timeline_event(
            action="created",
            actor_id=requester_id,
            actor_name=requester_name,
            actor_role=requester_role,
            message="Admin request submitted.",
        )
        document = {
            "request_number": public_request_number(),
            "request_type": payload.request_type.value,
            "title": payload.title,
            "description": payload.description,
            "priority": payload.priority.value,
            "priority_rank": self.PRIORITY_RANK[payload.priority.value],
            "status": "pending",
            "requester_id": requester_id,
            "requester_name": requester_name,
            "requester_email": payload.requester_email,
            "requester_role": requester_role,
            "company_id": payload.company_id,
            "company_name": payload.company_name,
            "country": payload.country,
            "payload": payload.payload,
            "attachments": [item.model_dump() for item in payload.attachments],
            "notes": [],
            "timeline": [event],
            "assigned_admin_id": None,
            "assigned_admin_name": None,
            "resolution_data": {},
            "rejection_reason": None,
            "resolution_note": None,
            "idempotency_key": payload.idempotency_key,
            "created_at": now,
            "updated_at": now,
            "decided_at": None,
            "decision_by_id": None,
            "decision_by_name": None,
            "deleted_at": None,
            "deleted_by": None,
        }
        created = await admin_request_repository.create(document)
        await self._audit(str(created["_id"]), event)
        return self._serialize(created, include_details=True)

    async def list_requests(self, payload: AdminRequestFilter) -> dict[str, Any]:
        filters = admin_request_repository.build_filters(
            search=payload.search,
            request_type=payload.request_type.value if payload.request_type else None,
            status=payload.status.value if payload.status else None,
            priority=payload.priority.value if payload.priority else None,
            requester_role=payload.requester_role,
            country=payload.country,
            assigned_admin_id=payload.assigned_admin_id,
            created_from=payload.created_from,
            created_to=payload.created_to,
            include_deleted=payload.include_deleted,
        )
        rows, total = await admin_request_repository.list_requests(
            filters=filters, page=payload.page, limit=payload.limit, sort=payload.sort.value
        )
        return {
            "total": total,
            "page": payload.page,
            "limit": payload.limit,
            "pages": max(1, (total + payload.limit - 1) // payload.limit),
            "requests": [self._serialize(row) for row in rows],
        }

    async def get_request(self, request_id: str) -> dict[str, Any]:
        row = await self._require(request_id)
        return self._serialize(row, include_details=True)

    async def get_statistics(self) -> dict[str, int]:
        base = await admin_request_repository.get_statistics()
        now = datetime.now(timezone.utc)
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today = await admin_request_repository.get_today_decision_counts(start, start + timedelta(days=1))
        return {**base, **today}

    async def approve(self, request_id: str, payload: AdminRequestApprove, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        event = timeline_event(
            action="approved", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message="Request approved.", metadata={"note": payload.note} if payload.note else {},
        )
        updated = await admin_request_repository.update_if_status_allowed(
            request_id=request_id,
            allowed_statuses=self.ACTIONABLE_STATUSES,
            update={"$set": {
                "status": "approved", "resolution_note": payload.note, "resolution_data": payload.resolution_data,
                "decided_at": now, "decision_by_id": actor["id"], "decision_by_name": actor["name"], "updated_at": now,
            }, "$push": {"timeline": event}},
        )
        if not updated:
            await self._raise_action_error(request_id)
        await self._audit(request_id, event)
        await self._notify_requester(updated, "Your request was approved", "approved")
        return self._serialize(updated, include_details=True)

    async def reject(self, request_id: str, payload: AdminRequestReject, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        event = timeline_event(
            action="rejected", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message="Request rejected.", metadata={"reason": payload.reason},
        )
        updated = await admin_request_repository.update_if_status_allowed(
            request_id=request_id,
            allowed_statuses=self.ACTIONABLE_STATUSES,
            update={"$set": {
                "status": "rejected", "rejection_reason": payload.reason, "resolution_data": payload.resolution_data,
                "decided_at": now, "decision_by_id": actor["id"], "decision_by_name": actor["name"], "updated_at": now,
            }, "$push": {"timeline": event}},
        )
        if not updated:
            await self._raise_action_error(request_id)
        await self._audit(request_id, event)
        await self._notify_requester(updated, "Your request was rejected", "rejected")
        return self._serialize(updated, include_details=True)

    async def assign(self, request_id: str, payload: AdminRequestAssign, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        event = timeline_event(
            action="assigned", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message=f"Request assigned to {payload.admin_name or payload.admin_id}.",
            metadata={"assigned_admin_id": payload.admin_id, "assigned_admin_name": payload.admin_name, "note": payload.note},
        )
        updated = await admin_request_repository.update_if_status_allowed(
            request_id=request_id,
            allowed_statuses=self.ACTIONABLE_STATUSES,
            update={"$set": {
                "status": "assigned", "assigned_admin_id": payload.admin_id,
                "assigned_admin_name": payload.admin_name, "updated_at": now,
            }, "$push": {"timeline": event}},
        )
        if not updated:
            await self._raise_action_error(request_id)
        await self._audit(request_id, event)
        return self._serialize(updated, include_details=True)

    async def add_note(self, request_id: str, payload: AdminRequestNoteCreate, current_user: dict[str, Any]) -> dict[str, Any]:
        await self._require(request_id)
        actor = self._actor(current_user)
        now = utc_now()
        note = {
            "note_id": uuid4().hex, "note": payload.note, "internal": payload.internal,
            "author_id": actor["id"], "author_name": actor["name"], "author_role": actor["role"], "created_at": now,
        }
        event = timeline_event(
            action="note_added", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message="Internal note added." if payload.internal else "Public note added.", metadata={"note_id": note["note_id"]},
        )
        updated = await admin_request_repository.update(
            request_id, {"$set": {"updated_at": now}, "$push": {"notes": note, "timeline": event}}
        )
        await self._audit(request_id, event)
        return self._serialize(updated, include_details=True)

    async def request_information(self, request_id: str, payload: AdminRequestInformationRequest, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        info = {"message": payload.message, "requested_items": payload.requested_items, "requested_at": now, "requested_by_id": actor["id"], "requested_by_name": actor["name"]}
        event = timeline_event(
            action="information_requested", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message="More information requested.", metadata={"requested_items": payload.requested_items},
        )
        updated = await admin_request_repository.update_if_status_allowed(
            request_id=request_id, allowed_statuses=self.ACTIONABLE_STATUSES,
            update={"$set": {"status": "waiting_for_information", "information_request": info, "updated_at": now}, "$push": {"timeline": event}},
        )
        if not updated:
            await self._raise_action_error(request_id)
        await self._audit(request_id, event)
        await self._notify_requester(updated, payload.message, "information_requested")
        return self._serialize(updated, include_details=True)

    async def update_priority(self, request_id: str, payload: AdminRequestPriorityUpdate, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        event = timeline_event(
            action="priority_updated", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message=f"Priority changed to {payload.priority.value}.", metadata={"priority": payload.priority.value},
        )
        updated = await admin_request_repository.update(
            request_id, {"$set": {"priority": payload.priority.value, "priority_rank": self.PRIORITY_RANK[payload.priority.value], "updated_at": now}, "$push": {"timeline": event}}
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Admin request not found.")
        await self._audit(request_id, event)
        return self._serialize(updated, include_details=True)

    async def cancel(self, request_id: str, payload: AdminRequestCancel, current_user: dict[str, Any]) -> dict[str, Any]:
        actor = self._actor(current_user)
        now = utc_now()
        event = timeline_event(
            action="cancelled", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"],
            message="Request cancelled.", metadata={"reason": payload.reason} if payload.reason else {},
        )
        updated = await admin_request_repository.update_if_status_allowed(
            request_id=request_id, allowed_statuses=self.ACTIONABLE_STATUSES,
            update={"$set": {"status": "cancelled", "resolution_note": payload.reason, "decided_at": now, "decision_by_id": actor["id"], "decision_by_name": actor["name"], "updated_at": now}, "$push": {"timeline": event}},
        )
        if not updated:
            await self._raise_action_error(request_id)
        await self._audit(request_id, event)
        return self._serialize(updated, include_details=True)

    async def timeline(self, request_id: str) -> dict[str, Any]:
        row = await self._require(request_id)
        logs = await admin_request_repository.get_audit_logs(request_id)
        return {
            "request_id": request_id,
            "timeline": [self._serialize_event(event) for event in row.get("timeline") or []],
            "audit_logs": [
                {**{k: v for k, v in log.items() if k != "_id" and k != "created_at"}, "id": str(log["_id"]), "created_at": self._iso(log.get("created_at"))}
                for log in logs
            ],
        }

    async def metadata(self) -> dict[str, list[str]]:
        return {
            "countries": await admin_request_repository.distinct_values("country"),
            "requester_roles": await admin_request_repository.distinct_values("requester_role"),
            "request_types": await admin_request_repository.distinct_values("request_type"),
        }

    async def delete(self, request_id: str, current_user: dict[str, Any]) -> dict[str, str]:
        await self._require(request_id)
        actor = self._actor(current_user)
        now = utc_now()
        success = await admin_request_repository.soft_delete(request_id, now, actor["id"])
        if not success:
            raise HTTPException(status_code=409, detail="Request could not be deleted.")
        event = timeline_event(action="deleted", actor_id=actor["id"], actor_name=actor["name"], actor_role=actor["role"], message="Request deleted.")
        await self._audit(request_id, event)
        return {"message": "Admin request deleted successfully."}

    async def bulk_approve(self, payload: BulkAdminRequestAction, current_user: dict[str, Any]) -> dict[str, Any]:
        succeeded, failed = [], []
        for request_id in dict.fromkeys(payload.request_ids):
            try:
                await self.approve(request_id, AdminRequestApprove(note=payload.note), current_user)
                succeeded.append(request_id)
            except HTTPException as exc:
                failed.append({"request_id": request_id, "reason": str(exc.detail)})
        return {"succeeded": succeeded, "failed": failed, "succeeded_count": len(succeeded), "failed_count": len(failed)}

    async def bulk_reject(self, payload: BulkAdminRequestReject, current_user: dict[str, Any]) -> dict[str, Any]:
        succeeded, failed = [], []
        for request_id in dict.fromkeys(payload.request_ids):
            try:
                await self.reject(request_id, AdminRequestReject(reason=payload.reason), current_user)
                succeeded.append(request_id)
            except HTTPException as exc:
                failed.append({"request_id": request_id, "reason": str(exc.detail)})
        return {"succeeded": succeeded, "failed": failed, "succeeded_count": len(succeeded), "failed_count": len(failed)}

    async def _require(self, request_id: str) -> dict[str, Any]:
        row = await admin_request_repository.get_by_id(request_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin request not found.")
        return row

    async def _raise_action_error(self, request_id: str) -> None:
        row = await admin_request_repository.get_by_id(request_id)
        if not row:
            raise HTTPException(status_code=404, detail="Admin request not found.")
        raise HTTPException(status_code=409, detail=f"Request cannot be changed from status '{row.get('status')}'.")

    async def _audit(self, request_id: str, event: dict[str, Any]) -> None:
        await admin_request_repository.add_audit_log({
            "request_id": request_id,
            "event_id": event.get("event_id"),
            "action": event.get("action"),
            "actor_id": event.get("actor_id"),
            "actor_name": event.get("actor_name"),
            "actor_role": event.get("actor_role"),
            "message": event.get("message"),
            "metadata": event.get("metadata") or {},
            "created_at": event.get("created_at") or utc_now(),
        })

    async def _notify_requester(self, row: dict[str, Any], message: str, event_type: str) -> None:
        if not row.get("requester_id"):
            return
        await admin_request_repository.create_notification({
            "user_id": row.get("requester_id"),
            "type": f"admin_request_{event_type}",
            "title": row.get("title") or "Admin request update",
            "message": message,
            "data": {"request_id": str(row["_id"]), "request_number": row.get("request_number"), "status": row.get("status")},
            "read": False,
            "created_at": utc_now(),
        })


admin_request_service = AdminRequestService()
