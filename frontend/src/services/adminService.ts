import { apiRequest } from "./api"

import type {
    AdminDashboardStats,
    AdminProfile,
} from "../types/admin"

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface AdminHealthResponse {
    status: string
    admin_id: string
    role: "admin" | "super_admin"
}

const unwrapResponse = <T>(
    response: T | ApiResponse<T>,
): T => {
    if (
        response &&
        typeof response === "object" &&
        "data" in response
    ) {
        return (response as ApiResponse<T>).data
    }

    return response as T
}

export const adminService = {
    async getMe(): Promise<AdminProfile> {
        const response = await apiRequest<
            AdminProfile | ApiResponse<AdminProfile>
        >("/api/admin/me", {
            method: "GET",
        })

        return unwrapResponse(response)
    },

    async checkHealth(): Promise<AdminHealthResponse> {
        const response = await apiRequest<
            AdminHealthResponse |
            ApiResponse<AdminHealthResponse>
        >("/api/admin/health", {
            method: "GET",
        })

        return unwrapResponse(response)
    },

    async getDashboardStats(): Promise<AdminDashboardStats> {
        const response = await apiRequest<
            AdminDashboardStats |
            ApiResponse<AdminDashboardStats>
        >("/api/admin/dashboard/stats", {
            method: "GET",
        })

        return unwrapResponse(response)
    },
}

export default adminService