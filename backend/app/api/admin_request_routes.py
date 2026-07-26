from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_admin
from app.schemas.admin_request import (
    AdminRequestApprove,
    AdminRequestAssign,
    AdminRequestCancel,
    AdminRequestCreate,
    AdminRequestFilter,
    AdminRequestInformationRequest,
    AdminRequestNoteCreate,
    AdminRequestPriority,
    AdminRequestPriorityUpdate,
    AdminRequestReject,
    AdminRequestSort,
    AdminRequestStatus,
    AdminRequestType,
    BulkAdminRequestAction,
    BulkAdminRequestReject,
)
from app.services.admin_request_service import admin_request_service

router = APIRouter(prefix="/admin/requests", tags=["Admin Requests"])


@router.get("/statistics")
async def statistics(_: dict = Depends(get_current_admin)):
    return await admin_request_service.get_statistics()


@router.get("/metadata")
async def metadata(_: dict = Depends(get_current_admin)):
    return await admin_request_service.metadata()


@router.post("/bulk/approve")
async def bulk_approve(payload: BulkAdminRequestAction, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.bulk_approve(payload, current_admin)


@router.post("/bulk/reject")
async def bulk_reject(payload: BulkAdminRequestReject, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.bulk_reject(payload, current_admin)


@router.get("")
async def list_requests(
    search: str | None = Query(None, max_length=200),
    request_type: AdminRequestType | None = Query(None),
    request_status: AdminRequestStatus | None = Query(None, alias="status"),
    priority: AdminRequestPriority | None = Query(None),
    requester_role: str | None = Query(None, max_length=60),
    country: str | None = Query(None, max_length=120),
    assigned_admin_id: str | None = Query(None, max_length=64),
    created_from: datetime | None = Query(None),
    created_to: datetime | None = Query(None),
    include_deleted: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: AdminRequestSort = Query(AdminRequestSort.newest),
    _: dict = Depends(get_current_admin),
):
    payload = AdminRequestFilter(
        search=search,
        request_type=request_type,
        status=request_status,
        priority=priority,
        requester_role=requester_role,
        country=country,
        assigned_admin_id=assigned_admin_id,
        created_from=created_from,
        created_to=created_to,
        include_deleted=include_deleted,
        page=page,
        limit=limit,
        sort=sort,
    )
    return await admin_request_service.list_requests(payload)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(payload: AdminRequestCreate, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.create_request(payload, current_admin)


@router.get("/{request_id}")
async def get_request(request_id: str, _: dict = Depends(get_current_admin)):
    return await admin_request_service.get_request(request_id)


@router.get("/{request_id}/timeline")
async def request_timeline(request_id: str, _: dict = Depends(get_current_admin)):
    return await admin_request_service.timeline(request_id)


@router.patch("/{request_id}/approve")
async def approve_request(request_id: str, payload: AdminRequestApprove, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.approve(request_id, payload, current_admin)


@router.patch("/{request_id}/reject")
async def reject_request(request_id: str, payload: AdminRequestReject, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.reject(request_id, payload, current_admin)


@router.patch("/{request_id}/assign")
async def assign_request(request_id: str, payload: AdminRequestAssign, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.assign(request_id, payload, current_admin)


@router.post("/{request_id}/notes")
async def add_note(request_id: str, payload: AdminRequestNoteCreate, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.add_note(request_id, payload, current_admin)


@router.patch("/{request_id}/request-information")
async def request_information(request_id: str, payload: AdminRequestInformationRequest, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.request_information(request_id, payload, current_admin)


@router.patch("/{request_id}/priority")
async def update_priority(request_id: str, payload: AdminRequestPriorityUpdate, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.update_priority(request_id, payload, current_admin)


@router.patch("/{request_id}/cancel")
async def cancel_request(request_id: str, payload: AdminRequestCancel, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.cancel(request_id, payload, current_admin)


@router.delete("/{request_id}")
async def delete_request(request_id: str, current_admin: dict = Depends(get_current_admin)):
    return await admin_request_service.delete(request_id, current_admin)
