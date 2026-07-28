import type {
    RechargeFilters,
    RechargePackage,
    RechargePackageListResponse,
    RechargePackagePayload,
    RechargePackageStatistics,
} from "../types/recharge";

const RAW_API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    "https://golden-sweep.onrender.com/api";

const NORMALIZED_API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

const API_BASE_URL = NORMALIZED_API_BASE_URL.endsWith("/api")
    ? NORMALIZED_API_BASE_URL
    : `${NORMALIZED_API_BASE_URL}/api`;

function getAuthToken(): string | null {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("token")
    );
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getAuthToken();

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const headers = new Headers(options.headers);

    if (options.body !== undefined && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(
        `${API_BASE_URL}${normalizedPath}`,
        {
            ...options,
            headers,
        },
    );

    if (!response.ok) {
        let detail = `Request failed with status ${response.status}.`;

        try {
            const contentType =
                response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const payload = (await response.json()) as {
                    detail?: string | Array<{
                        loc?: Array<string | number>;
                        msg?: string;
                        type?: string;
                    }>;
                    message?: string;
                };

                if (typeof payload.detail === "string") {
                    detail = payload.detail;
                } else if (Array.isArray(payload.detail)) {
                    detail = payload.detail
                        .map((error) => {
                            const location = error.loc?.join(".") || "request";
                            return `${location}: ${error.msg || "Invalid value"}`;
                        })
                        .join(", ");
                } else if (payload.message) {
                    detail = payload.message;
                }
            } else {
                const text = await response.text();

                detail =
                    text ||
                    response.statusText ||
                    detail;
            }
        } catch {
            detail =
                response.statusText ||
                detail;
        }

        throw new Error(detail);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType =
        response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
            `Expected JSON response but received ${
                contentType || "unknown content type"
            }. Response: ${text.slice(0, 120)}`,
        );
    }

    return (await response.json()) as T;
}

const rechargeService = {
    async getStatistics(): Promise<RechargePackageStatistics> {
        return request<RechargePackageStatistics>(
            "/admin/recharge/statistics",
        );
    },

    async getPackages(
        filters: RechargeFilters,
        page = 1,
        limit = 20,
    ): Promise<RechargePackageListResponse> {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            sort_by: "sort_order",
            sort_order: "asc",
        });

        const search = filters.search?.trim();

        if (search) {
            params.set("search", search);
        }

        if (filters.status) {
            params.set(
                "is_active",
                filters.status === "active"
                    ? "true"
                    : "false",
            );
        }

        const currency = filters.currency?.trim();

        if (currency) {
            params.set(
                "currency",
                currency.toUpperCase(),
            );
        }

        return request<RechargePackageListResponse>(
            `/admin/recharge?${params.toString()}`,
        );
    },

    async createPackage(
        payload: RechargePackagePayload,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            "/admin/recharge",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
    },

    async updatePackage(
        packageId: string,
        payload: Partial<RechargePackagePayload>,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            `/admin/recharge/${encodeURIComponent(packageId)}`,
            {
                method: "PATCH",
                body: JSON.stringify(payload),
            },
        );
    },

    async activatePackage(
        packageId: string,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            `/admin/recharge/${encodeURIComponent(packageId)}/activate`,
            {
                method: "PATCH",
            },
        );
    },

    async deactivatePackage(
        packageId: string,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            `/admin/recharge/${encodeURIComponent(packageId)}/deactivate`,
            {
                method: "PATCH",
            },
        );
    },

    async deletePackage(
        packageId: string,
    ): Promise<void> {
        return request<void>(
            `/admin/recharge/${encodeURIComponent(packageId)}`,
            {
                method: "DELETE",
            },
        );
    },
};

export default rechargeService;