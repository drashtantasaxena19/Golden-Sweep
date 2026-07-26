import type {
    RechargeFilters,
    RechargePackage,
    RechargePackageListResponse,
    RechargePackagePayload,
    RechargePackageStatistics,
} from "../types/recharge";

const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";

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

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        let detail = `Request failed with status ${response.status}.`;

        try {
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const payload = (await response.json()) as {
                    detail?: string;
                    message?: string;
                };

                detail = payload.detail || payload.message || detail;
            } else {
                const text = await response.text();
                detail = text || response.statusText || detail;
            }
        } catch {
            detail = response.statusText || detail;
        }

        throw new Error(detail);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
            `Expected JSON response but received ${contentType || "unknown content type"}. Response: ${text.slice(0, 120)}`,
        );
    }

    return (await response.json()) as T;
}

const rechargeService = {
    async getStatistics(): Promise<RechargePackageStatistics> {
        return request<RechargePackageStatistics>(
            "/api/admin/recharge/statistics",
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

        if (filters.search.trim()) {
            params.set("search", filters.search.trim());
        }

        if (filters.status) {
            params.set(
                "is_active",
                filters.status === "active" ? "true" : "false",
            );
        }

        if (filters.currency.trim()) {
            params.set(
                "currency",
                filters.currency.trim().toUpperCase(),
            );
        }

        return request<RechargePackageListResponse>(
            `/api/admin/recharge?${params.toString()}`,
        );
    },

    async createPackage(
        payload: RechargePackagePayload,
    ): Promise<RechargePackage> {
        return request<RechargePackage>("/api/admin/recharge", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    async updatePackage(
        packageId: string,
        payload: Partial<RechargePackagePayload>,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            `/api/admin/recharge/${packageId}`,
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
            `/api/admin/recharge/${packageId}/activate`,
            {
                method: "PATCH",
            },
        );
    },

    async deactivatePackage(
        packageId: string,
    ): Promise<RechargePackage> {
        return request<RechargePackage>(
            `/api/admin/recharge/${packageId}/deactivate`,
            {
                method: "PATCH",
            },
        );
    },

    async deletePackage(packageId: string): Promise<void> {
        return request<void>(
            `/api/admin/recharge/${packageId}`,
            {
                method: "DELETE",
            },
        );
    },
};

export default rechargeService;