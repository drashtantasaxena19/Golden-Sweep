import { ApiError, apiFetch, apiRequest } from "../services/api"

import type {
    AnalyticsExportRequest,
    AnalyticsGranularity,
    AnalyticsOverviewResponse,
    AnalyticsQueryParams,
    GameAnalyticsQueryParams,
    GameAnalyticsResponse,
    RevenueAnalyticsResponse,
    TransactionAnalyticsResponse,
    UserAnalyticsResponse,
    WalletAnalyticsResponse,
} from "../types/analytics"

const ANALYTICS_BASE_PATH = "/api/admin/analytics"

interface ApiErrorPayload {
    detail?: unknown
    message?: unknown
    error?: unknown
}

export interface AnalyticsExportDownload {
    blob: Blob
    filename: string
    contentType: string
}

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0

const extractErrorMessage = (
    payload: ApiErrorPayload | null,
    fallback: string,
): string => {
    if (!payload) return fallback

    if (isNonEmptyString(payload.detail)) {
        return payload.detail
    }

    if (
        payload.detail &&
        typeof payload.detail === "object" &&
        "message" in payload.detail &&
        isNonEmptyString(
            (payload.detail as { message?: unknown }).message,
        )
    ) {
        return (payload.detail as { message: string }).message
    }

    if (isNonEmptyString(payload.message)) {
        return payload.message
    }

    if (isNonEmptyString(payload.error)) {
        return payload.error
    }

    return fallback
}

const readErrorPayload = async (
    response: Response,
): Promise<ApiErrorPayload | null> => {
    try {
        return (await response.json()) as ApiErrorPayload
    } catch {
        return null
    }
}

const appendDateRangeParams = (
    searchParams: URLSearchParams,
    params: AnalyticsQueryParams,
): void => {
    if (params.start_date) {
        searchParams.set("start_date", params.start_date)
    }

    if (params.end_date) {
        searchParams.set("end_date", params.end_date)
    }

    if (params.granularity) {
        searchParams.set("granularity", params.granularity)
    }
}

const buildAnalyticsQuery = (
    params: AnalyticsQueryParams = {},
): string => {
    const searchParams = new URLSearchParams()
    appendDateRangeParams(searchParams, params)

    const query = searchParams.toString()
    return query ? `?${query}` : ""
}

const getHeaderFilename = (
    contentDisposition: string | null,
): string | null => {
    if (!contentDisposition) return null

    const encodedMatch = contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/i,
    )

    if (encodedMatch?.[1]) {
        try {
            return decodeURIComponent(
                encodedMatch[1]
                    .trim()
                    .replace(/^["']|["']$/g, ""),
            )
        } catch {
            return encodedMatch[1]
                .trim()
                .replace(/^["']|["']$/g, "")
        }
    }

    const filenameMatch = contentDisposition.match(
        /filename\s*=\s*("([^"]+)"|([^;]+))/i,
    )

    const filename =
        filenameMatch?.[2] ?? filenameMatch?.[3]

    return filename?.trim().replace(/^["']|["']$/g, "") ?? null
}

const buildFallbackExportFilename = (
    request: AnalyticsExportRequest,
): string => {
    const section = request.section ?? "full"
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z")

    return `analytics_${section}_${timestamp}.${request.format}`
}

export const getAnalyticsOverview = (
    params: AnalyticsQueryParams = {},
): Promise<AnalyticsOverviewResponse> =>
    apiRequest<AnalyticsOverviewResponse>(
        `${ANALYTICS_BASE_PATH}/overview${buildAnalyticsQuery(params)}`,
        { method: "GET" },
    )

export const getRevenueAnalytics = (
    params: AnalyticsQueryParams = {},
): Promise<RevenueAnalyticsResponse> =>
    apiRequest<RevenueAnalyticsResponse>(
        `${ANALYTICS_BASE_PATH}/revenue${buildAnalyticsQuery(params)}`,
        { method: "GET" },
    )

export const getUserAnalytics = (
    params: AnalyticsQueryParams = {},
): Promise<UserAnalyticsResponse> =>
    apiRequest<UserAnalyticsResponse>(
        `${ANALYTICS_BASE_PATH}/users${buildAnalyticsQuery(params)}`,
        { method: "GET" },
    )

export const getWalletAnalytics = (
    params: AnalyticsQueryParams = {},
): Promise<WalletAnalyticsResponse> =>
    apiRequest<WalletAnalyticsResponse>(
        `${ANALYTICS_BASE_PATH}/wallet${buildAnalyticsQuery(params)}`,
        { method: "GET" },
    )

export const getTransactionAnalytics = (
    params: AnalyticsQueryParams = {},
): Promise<TransactionAnalyticsResponse> =>
    apiRequest<TransactionAnalyticsResponse>(
        `${ANALYTICS_BASE_PATH}/transactions${buildAnalyticsQuery(params)}`,
        { method: "GET" },
    )

export const getGameAnalytics = (
    params: GameAnalyticsQueryParams = {},
): Promise<GameAnalyticsResponse> => {
    const searchParams = new URLSearchParams()
    appendDateRangeParams(searchParams, params)

    if (params.top_limit !== undefined) {
        searchParams.set("top_limit", String(params.top_limit))
    }

    const query = searchParams.toString()

    return apiRequest<GameAnalyticsResponse>(
        `${ANALYTICS_BASE_PATH}/games${query ? `?${query}` : ""}`,
        { method: "GET" },
    )
}

export const exportAnalytics = async (
    request: AnalyticsExportRequest,
): Promise<AnalyticsExportDownload> => {
    const payload: AnalyticsExportRequest = {
        format: request.format,
        section: request.section ?? "full",
        start_date: request.start_date ?? null,
        end_date: request.end_date ?? null,
        granularity: request.granularity ?? "day",
    }

    const response = await apiFetch(
        `${ANALYTICS_BASE_PATH}/export`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/octet-stream",
            },
            body: JSON.stringify(payload),
        },
    )

    if (!response.ok) {
        const errorPayload = await readErrorPayload(response)

        throw new ApiError(
            extractErrorMessage(
                errorPayload,
                `Analytics export failed with status ${response.status}.`,
            ),
            response.status,
            errorPayload,
        )
    }

    const blob = await response.blob()
    const contentType =
        response.headers.get("Content-Type") ||
        blob.type ||
        "application/octet-stream"

    const filename =
        getHeaderFilename(
            response.headers.get("Content-Disposition"),
        ) ?? buildFallbackExportFilename(payload)

    return {
        blob,
        filename,
        contentType,
    }
}

export const downloadAnalyticsExport = async (
    request: AnalyticsExportRequest,
): Promise<AnalyticsExportDownload> => {
    const download = await exportAnalytics(request)
    const objectUrl = URL.createObjectURL(download.blob)
    const anchor = document.createElement("a")

    try {
        anchor.href = objectUrl
        anchor.download = download.filename
        anchor.style.display = "none"

        document.body.appendChild(anchor)
        anchor.click()
    } finally {
        anchor.remove()
        URL.revokeObjectURL(objectUrl)
    }

    return download
}

export const analyticsApi = {
    getOverview: getAnalyticsOverview,
    getRevenue: getRevenueAnalytics,
    getUsers: getUserAnalytics,
    getWallet: getWalletAnalytics,
    getTransactions: getTransactionAnalytics,
    getGames: getGameAnalytics,
    export: exportAnalytics,
    downloadExport: downloadAnalyticsExport,
}

export type { AnalyticsGranularity }

export default analyticsApi
