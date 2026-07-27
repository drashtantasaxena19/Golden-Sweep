import {
    clearAuth,
    getAccessToken,
    getRefreshToken,
    updateAccessToken,
} from "./authStorage"

const RAW_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api"

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "")

interface ApiRequestOptions extends RequestInit {
    skipAuth?: boolean
    skipRefresh?: boolean
}

interface ApiErrorBody {
    detail?: string | unknown[]
    message?: string
}

interface RefreshResponse {
    access_token: string
    refresh_token?: string
}

interface WrappedRefreshResponse {
    success: boolean
    message: string
    data: RefreshResponse
}

export class ApiError extends Error {
    status: number
    data?: unknown

    constructor(message: string, status: number, data?: unknown) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

let refreshPromise: Promise<boolean> | null = null

export const buildApiUrl = (path: string): string => {
    let normalizedPath = path.trim()

    if (!normalizedPath.startsWith("/")) {
        normalizedPath = `/${normalizedPath}`
    }

    const baseEndsWithApi = API_BASE_URL.toLowerCase().endsWith("/api")

    if (
        baseEndsWithApi &&
        normalizedPath.toLowerCase().startsWith("/api/")
    ) {
        normalizedPath = normalizedPath.slice(4)
    }

    if (
        baseEndsWithApi &&
        normalizedPath.toLowerCase() === "/api"
    ) {
        normalizedPath = ""
    }

    return `${API_BASE_URL}${normalizedPath}`
}

const parseResponse = async (response: Response): Promise<unknown> => {
    if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
    ) {
        return null
    }

    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
        try {
            return await response.json()
        } catch {
            return null
        }
    }

    try {
        return await response.text()
    } catch {
        return null
    }
}

const getErrorMessage = (data: unknown, fallback: string): string => {
    if (typeof data === "string" && data.trim()) {
        return data
    }

    if (data && typeof data === "object") {
        const body = data as ApiErrorBody

        if (typeof body.detail === "string" && body.detail.trim()) {
            return body.detail
        }

        if (Array.isArray(body.detail)) {
            return body.detail
                .map((item) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        "msg" in item
                    ) {
                        return String(item.msg)
                    }

                    return "Invalid request."
                })
                .join("\n")
        }

        if (typeof body.message === "string" && body.message.trim()) {
            return body.message
        }

        if (
            body.detail &&
            typeof body.detail === "object" &&
            "message" in body.detail
        ) {
            const nestedMessage = (
                body.detail as { message?: unknown }
            ).message

            if (
                typeof nestedMessage === "string" &&
                nestedMessage.trim()
            ) {
                return nestedMessage
            }
        }
    }

    return fallback
}

const performTokenRefresh = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
        clearAuth()
        return false
    }

    try {
        const response = await fetch(
            buildApiUrl("/auth/refresh"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    refresh_token: refreshToken,
                }),
            },
        )

        const body = await parseResponse(response)

        if (!response.ok) {
            clearAuth()
            return false
        }

        const refreshData =
            body &&
            typeof body === "object" &&
            "data" in body
                ? (body as WrappedRefreshResponse).data
                : (body as RefreshResponse)

        if (!refreshData?.access_token) {
            clearAuth()
            return false
        }

        updateAccessToken(
            refreshData.access_token,
            refreshData.refresh_token,
        )

        return true
    } catch {
        clearAuth()
        return false
    }
}

const refreshAccessToken = (): Promise<boolean> => {
    if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
            refreshPromise = null
        })
    }

    return refreshPromise
}

const createHeaders = (
    headers: HeadersInit | undefined,
    skipAuth: boolean,
    body: BodyInit | null | undefined,
): Headers => {
    const finalHeaders = new Headers(headers)

    if (!finalHeaders.has("Accept")) {
        finalHeaders.set("Accept", "application/json")
    }

    if (
        !finalHeaders.has("Content-Type") &&
        body !== undefined &&
        body !== null &&
        !(body instanceof FormData)
    ) {
        finalHeaders.set("Content-Type", "application/json")
    }

    if (!skipAuth) {
        const token = getAccessToken()

        if (token) {
            finalHeaders.set("Authorization", `Bearer ${token}`)
        }
    }

    return finalHeaders
}

export const apiFetch = async (
    path: string,
    options: ApiRequestOptions = {},
): Promise<Response> => {
    const {
        skipAuth = false,
        skipRefresh = false,
        headers,
        ...requestOptions
    } = options

    const requestUrl = buildApiUrl(path)

    let finalHeaders = createHeaders(
        headers,
        skipAuth,
        requestOptions.body,
    )

    let response: Response

    try {
        response = await fetch(requestUrl, {
            ...requestOptions,
            headers: finalHeaders,
        })
    } catch (error) {
        throw new ApiError(
            error instanceof Error
                ? error.message
                : "Unable to connect to the server.",
            0,
            error,
        )
    }

    if (
        response.status === 401 &&
        !skipAuth &&
        !skipRefresh
    ) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
            finalHeaders = createHeaders(
                headers,
                false,
                requestOptions.body,
            )

            try {
                response = await fetch(requestUrl, {
                    ...requestOptions,
                    headers: finalHeaders,
                })
            } catch (error) {
                throw new ApiError(
                    "Unable to reconnect to the server.",
                    0,
                    error,
                )
            }
        }
    }

    return response
}

export const apiRequest = async <T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> => {
    const response = await apiFetch(path, options)
    const data = await parseResponse(response)

    if (!response.ok) {
        if (response.status === 401 && !options.skipAuth) {
            clearAuth()
        }

        throw new ApiError(
            getErrorMessage(
                data,
                `Request failed with status ${response.status}.`,
            ),
            response.status,
            data,
        )
    }

    return data as T
}
