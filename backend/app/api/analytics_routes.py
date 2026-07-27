from __future__ import annotations

from datetime import datetime
from io import BytesIO
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.core.admin_dependencies import get_current_admin
from app.schemas.analytics_schema import (
    AnalyticsExportRequestSchema,
    AnalyticsGranularity,
    AnalyticsOverviewResponseSchema,
    GameAnalyticsResponseSchema,
    RevenueAnalyticsResponseSchema,
    TransactionAnalyticsResponseSchema,
    UserAnalyticsResponseSchema,
    WalletAnalyticsResponseSchema,
)
from app.services.analytics_service import (
    AnalyticsDependencyError,
    AnalyticsExportError,
    AnalyticsRepositoryError,
    AnalyticsServiceError,
    AnalyticsValidationError,
    analytics_service,
)


router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin Analytics"],
)


def _error_detail(exc: AnalyticsServiceError) -> dict[str, Any]:
    return {
        "message": exc.message,
        "code": exc.code,
        "details": exc.details,
    }


def _raise_http_error(exc: AnalyticsServiceError) -> None:
    if isinstance(exc, AnalyticsValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
    elif isinstance(exc, AnalyticsDependencyError):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif isinstance(exc, AnalyticsRepositoryError):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif isinstance(exc, AnalyticsExportError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    raise HTTPException(
        status_code=status_code,
        detail=_error_detail(exc),
    ) from exc


def _content_disposition(filename: str) -> str:
    safe_filename = filename.replace('"', "").replace("\r", "").replace("\n", "")
    encoded_filename = quote(safe_filename, safe="")
    return (
        f'attachment; filename="{safe_filename}"; '
        f"filename*=UTF-8''{encoded_filename}"
    )


def _stream_export(
    buffer: BytesIO,
    *,
    filename: str,
    content_type: str,
    section: str,
    export_format: str,
    generated_at: datetime,
) -> StreamingResponse:
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=content_type,
        headers={
            "Content-Disposition": _content_disposition(filename),
            "X-Analytics-Section": section,
            "X-Analytics-Format": export_format,
            "X-Analytics-Generated-At": generated_at.isoformat(),
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponseSchema,
    summary="Get analytics overview",
)
async def get_analytics_overview(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    _: dict = Depends(get_current_admin),
) -> AnalyticsOverviewResponseSchema:
    try:
        return await analytics_service.get_overview(
            start_date=start_date,
            end_date=end_date,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.get(
    "/revenue",
    response_model=RevenueAnalyticsResponseSchema,
    summary="Get revenue analytics",
)
async def get_revenue_analytics(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    granularity: AnalyticsGranularity = Query(default="day"),
    _: dict = Depends(get_current_admin),
) -> RevenueAnalyticsResponseSchema:
    try:
        return await analytics_service.get_revenue(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.get(
    "/users",
    response_model=UserAnalyticsResponseSchema,
    summary="Get user analytics",
)
async def get_user_analytics(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    granularity: AnalyticsGranularity = Query(default="day"),
    _: dict = Depends(get_current_admin),
) -> UserAnalyticsResponseSchema:
    try:
        return await analytics_service.get_users(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.get(
    "/wallet",
    response_model=WalletAnalyticsResponseSchema,
    summary="Get wallet analytics",
)
async def get_wallet_analytics(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    granularity: AnalyticsGranularity = Query(default="day"),
    _: dict = Depends(get_current_admin),
) -> WalletAnalyticsResponseSchema:
    try:
        return await analytics_service.get_wallet(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.get(
    "/transactions",
    response_model=TransactionAnalyticsResponseSchema,
    summary="Get transaction analytics",
)
async def get_transaction_analytics(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    granularity: AnalyticsGranularity = Query(default="day"),
    _: dict = Depends(get_current_admin),
) -> TransactionAnalyticsResponseSchema:
    try:
        return await analytics_service.get_transactions(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.get(
    "/games",
    response_model=GameAnalyticsResponseSchema,
    summary="Get game analytics",
)
async def get_game_analytics(
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    granularity: AnalyticsGranularity = Query(default="day"),
    top_limit: int = Query(default=10, ge=1, le=100),
    _: dict = Depends(get_current_admin),
) -> GameAnalyticsResponseSchema:
    try:
        return await analytics_service.get_games(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            top_limit=top_limit,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


@router.post(
    "/export",
    response_class=StreamingResponse,
    summary="Export analytics",
    responses={
        status.HTTP_200_OK: {
            "description": "Generated analytics export file.",
            "content": {
                "text/csv": {},
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {},
                "application/pdf": {},
            },
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid analytics export request."
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "description": "Analytics data or an export dependency is unavailable."
        },
    },
)
async def export_analytics(
    payload: AnalyticsExportRequestSchema,
    _: dict = Depends(get_current_admin),
) -> StreamingResponse:
    try:
        buffer, metadata = await analytics_service.generate_export(payload)

        return _stream_export(
            buffer,
            filename=metadata.filename,
            content_type=metadata.content_type,
            section=metadata.section,
            export_format=metadata.format,
            generated_at=metadata.generated_at,
        )
    except AnalyticsServiceError as exc:
        _raise_http_error(exc)


__all__ = ["router"]